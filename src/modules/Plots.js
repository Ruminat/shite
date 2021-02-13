
/*
  Файл Plots.js
  содержит класс Plots для обработки и анализа данных.
*/

// const Plotly = require('plotly.js')

// import Plotly from 'plotly.js'
import {
  random, randomInt, randomJS, randomIntJS,
  getStatistics, splitIntoParts, average, variance
} from './statistics.js'
import { delay, genArray } from './utils.js'

// Параметры для библиотеки, строящей графики.
const small = { width: 300, height: 300 }
const medium = { width: 400, height: 350 }
const large = { width: 620, height: 480 }
const margin = 50
const layout = {
  ...medium,
  margin: { l: margin, r: margin, t: margin, b: margin }
}

export default class Plots {
  // Строит график с помощью библиотеки Plotly.
  static makePlot ({ id, data = null, x = [], y = [], type = 'line', title = 'Plot' } = {}) {
    if (x.length === 0) {
      x = y.map((_, i) => i + 1)
    }
    if (data !== null) {
      Plotly.newPlot(id, data, { ...layout, title })
    } else {
      Plotly.newPlot(id, [{ x, y, type }], { ...layout, title })
    }
  }
  // Строит столбцовую диаграмму.
  static barPlot ({ id = '', ys = [], from = 0, bars = 20, to = 100, title = 'Bar plot' } = {}) {
    makePlot({ id, ...getBarData({ ys, from, to, bars }), title })
  }
  // Получает данные столбцовой диаграммы.
  static getBarData ({ ys = [], bars = 20, from = 0, to = 100 } = {}) {
    const barX = genArray(bars, bar => from + bar*((to - from) / bars))
    const barY = genArray(bars, _ => 0)
    for (const y of ys)
      barY[Math.floor((bars / (to - from)) * (y - from))]++
    return { x: barX, y: barY, type: 'bar' }
  }
  // Сдвиг данных ys на значение c.
  static shift (c, ys) {
    return ys.map(y => y + c)
  }
  // Антисдвиг на среднее значение данных.
  static antishift (ys) {
    const avg = average(ys)
    return Plots.shift(-avg, ys)
  }
  // Добавляет N выбросов в данные ys.
  static spikes ({ ys = [], multiplier = 2, value = 100, N = 10, from = null, to = null } = {}) {
    if (ys.length < N) return []

    const result = [...ys]
    if (from === null) from = 0
    if (to === null) to = ys.length - 1

    const points = []
    while (points.length < N) {
      const point = randomIntJS(from, to)
      if (!points.includes(point))
        points.push(point)
    }
    for (const point of points) {
      result[point] += Math.sign(result[point]) * randomJS(value, multiplier * value)
    }
    return result
  }
  // Удаляет выбросы путём взятия среднего значения двух соседних элементов.
  static antispike (ys = [], border = -1) {
    if (ys.length < 2) return ys
    const result = [...ys]

    const isSpike = value => Math.abs(value) > border

    const first = 0
    const last = result.length - 1
    if (isSpike(result[first])) result[first] = nextValue(first)
    if (isSpike(result[last])) result[last] = prevValue(last)

    for (let i = 1; i < result.length - 1; i++)
      if (isSpike(result[i]))
        result[i] = (prevValue(i) + nextValue(i)) / 2

    return result

    function nextValue (index) {
      let value = result[index]
      while (++index < result.length && isSpike(value)) {
        value = result[index]
      }
      if (isSpike(value)) console.log('SUKA', { index, value })
      return value
    }
    function prevValue (index) {
      let value = result[index]
      while (--index < result.length && isSpike(value)) {
        value = result[index]
      }
      if (isSpike(value)) console.log('SUKA', { index, value })
      return value
    }
  }
  // Удаление шума в наборе данных (сглаживание). windowSize — размер окна сглаживания.
  static denoise (ys = [], windowSize = Math.round(0.017*ys.length)) {
    if (ys.length <= windowSize) return ys

    const result = []
    const inverseWindowSize = 1 / windowSize
    let currentSum = 0

    for (let i = 0; i < windowSize; i++) currentSum += ys[i]
    result.push(currentSum * inverseWindowSize)

    const len = ys.length
    const split = len - windowSize
    for (let i = 0; i < split; i++) {
      currentSum += ys[i + windowSize] - ys[i]
      result.push(currentSum * inverseWindowSize)
    }
    for (let i = len - 1; i > split; i--) {
      currentSum += -ys[i - windowSize] + ys[i]
      result.push(currentSum * inverseWindowSize)
    }

    return result
  }
  // Удаляет тренд.
  static antitrend (ys) {
    return Plots.difference(ys, Plots.denoise(ys))
  }
  // Находит поэлементную разность двух массивов.
  static difference (ys1 = [], ys2 = 0) {
    return (ys1.length < ys2.length ? ys1 : ys2).map((_, i) => ys1[i] - ys2[i])
  }
  // Находит поэлементный модуль разности двух массивов.
  static differenceAbs (ys1 = [], ys2 = 0) {
    return (ys1.length < ys2.length ? ys1 : ys2).map((_, i) => Math.abs(ys1[i] - ys2[i]))
  }
  // Находит спектр набора данных, norm — нужна ли нормировка.
  static spectrum (arr, n, { norm = true } = {}) {
    const N = arr.length
    const multiplier = 2 * Math.PI * n / N
    let realPart = 0
    let imaginaryPart = 0
    for (let k = 0; k < N; k++) {
      const arg = multiplier * k
      realPart += arr[k] * Math.cos(arg)
      imaginaryPart += arr[k] * Math.sin(arg)
    }
    if (norm) return Math.sqrt((realPart**2 + imaginaryPart**2) / N**2)
    else return Math.sqrt((realPart**2 + imaginaryPart**2))
  }
  // Возвращает данные для построения графика спектра.
  static spectrumPlotData ({ ys = [], dt = 0.1, title = '', norm = true } = {}) {
    const ns = ys.map((_, i) => i + 1)
    const len = ys.length
    const df = 1 / (dt * len)
    return {
      xs: ns.map(n => n * df).slice(0, len / 2),
      ys: ns.map(n => Plots.spectrum(ys, n, { norm })).slice(0, len / 2),
      title
    }
  }
  // Стационарность данных.
  static stationaryStats (arr) {
    const partsCount = 10
    const parts = splitIntoParts(arr, partsCount).map(getStatistics)


    const differences = {}
    for (const type of ['avg', 'std', 'squareAvg']) {
      const values = parts.map(part => part[type])
      const stats = getStatistics(values)
      differences[type] = stats.max - stats.min
    }

    for (const type of ['avg', 'std', 'squareAvg'])
      differences[type] = getStatistics(differences[type])

    return differences
  }
  // Автокорреляционная функция.
  static autoCorrelationFn (l, arr) {
    const N = arr.length
    let sum = 0
    for (let k = 0; k < N - l; k++) {
      sum += arr[k] * arr[k + l]
    }
    return sum / N
  }
  // Автокорреляция (возвращает массив значений).
  static autoCorrelation (arr) {
    return arr.map((_, l) => Plots.autoCorrelationFn(l, arr))
  }
  // Функция взаимной корреляции.
  static crossCorrelationFn (l, arr1, arr2) {
    const N = arr1.length
    let sum = 0
    for (let k = 0; k < N - l; k++) {
      sum += arr1[k] * arr2[k + l]
    }
    return sum / N
  }
  // Взаимная корреляция (возвращает массив значений).
  static crossCorrelation (arr1, arr2) {
    return arr1.map((_, l) => Plots.crossCorrelationFn(l, arr1, arr2))
  }
  // Свёртка двух массивов.
  static convolution (arr1, arr2, M = arr2.length) {
    const N = arr1.length
    const result = []
    for (let k = 0; k < N + M; k++) {
      let sum = 0
      for (let i = 0; i < M; i++) {
        if (k - i < 0 || k - i >= N) continue
        sum += arr1[k - i] * arr2[i]
      }
      result.push(sum)
    }
    return result
  }
  // Веса Ормсби-Поттера (ФНЧ, Low Pass Filter).
  static potterWeights ({ fc = 120, m = 256, dt = 0.001 } = {}) {
    let fact = 2 * fc * dt
    const weights = [fact]
    fact *= Math.PI
    for (let i = 1; i <= m; i++) {
      weights.push(Math.sin(fact * i) / (Math.PI * i))
    }
    weights[m] /= 2

    const d = [0.35577019, 0.2436983, 0.07211497, 0.00630165]
    let sumg = weights[0]
    for (let i = 1; i <= m; i++) {
      weights[i] *= d.reduce((acc, curr, k) => acc + 2 * curr * Math.cos(Math.PI * k * i / m))
      sumg += 2 * weights[i]
    }
    for (let i = 0; i <= m; i++) {
      weights[i] /= sumg
    }

    const copyWeights = [...weights]
    copyWeights.reverse()
    copyWeights.pop()

    return [...copyWeights, ...weights]
  }
  // Веса Ормсби-Поттера (ФВЧ, High Pass Filter).
  static potterHighPassWeights ({ fc = 120, m = 256, dt = 0.001 } = {}) {
    const weights = Plots.potterWeights({ fc, m, dt })
    return weights.map((w, i) => i === m ? 1 - w : -w)
  }
  // Веса Ормсби-Поттера (ПФ, Band Pass Filter).
  static potterBandPassWeights ({ fc1 = 60, fc2 = 80, m = 256, dt = 0.001 } = {}) {
    const weights1 = Plots.potterWeights({ fc: fc1, m, dt })
    const weights2 = Plots.potterWeights({ fc: fc2, m, dt })
    return weights2.map((w, i) => w - weights1[i])
  }
  // Веса Ормсби-Поттера (РФ, Band Stop Filter).
  static potterBandStopWeights ({ fc1 = 60, fc2 = 80, m = 256, dt = 0.001 } = {}) {
    const weights1 = Plots.potterWeights({ fc: fc1, m, dt })
    const weights2 = Plots.potterWeights({ fc: fc2, m, dt })
    return weights1.map((w, i) => i === m ? 1 - weights2[i] + w : w - weights2[i])
  }
  // Линейная регрессия.
  static linearRegression ({ xs = [], ys = []} = {}) {
    if (xs.length === 0) xs = ys.map((_, i) => i + 1)

    const N = ys.length
    let sumX = 0
    let sumY = 0
    let sumXy = 0
    let sumXx = 0
    for (let i = 0; i < N; i++) {
      let x = xs[i]
      let y = ys[i]
      sumX += x
      sumY += y
      sumXx += x * x
      sumXy += x * y
    }

    const k = (N * sumXy - sumX * sumY) / (N * sumXx - sumX * sumX)
    const b = (sumY - k * sumX) / N

    return { xs, ys: xs.map(x => k * x + b) }
  }
  // Коэффициент корреляции.
  static correlationCoefficient ({ xs = [], ys = [] } = {}) {
    if (xs.length === 0) xs = ys.map((_, i) => i + 1)
    if (ys.length === 0 || xs.length !== ys.length) return null
      
    const xsV = variance(xs)
    const ysV = variance(ys)
    const xsAvg = average(xs)
    const ysAvg = average(ys)

    return xs.reduce((acc, x, i) => acc + (x - xsAvg) * (ys[i] - ysAvg), 0)
      / Math.sqrt(ys.length**2 * xsV * ysV)
  }
}
