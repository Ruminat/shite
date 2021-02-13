/*
  Файл main.js:
  основной код.
*/

import {
  random, randomInt, randomJS, randomIntJS,
  getStatistics, splitIntoParts, average, sum, std,
  statisticsTeX
} from './modules/statistics.js'
import { delay, genArray } from './modules/utils.js'
import UID from './modules/UID.js'
import Plots from './modules/Plots.js'

const fs = require('fs')

// Элемент, в который будем добавлять графики.
const $plots = document.querySelector('.plots')

// Данные Google.
const googleData = JSON.parse(fs.readFileSync('./data/google/googleData.json', 'utf8'))
const google = googleData
  .filter(g => /2012|2013/.test(g.Date))
  .map(g => {
    if (typeof g.Close === 'number') return g.Close
    else return Number(g.Close.replace(/,/g, ''))
  })

// Параметры.
const daysCount = google.length
const days = genArray(daysCount, d => d + 1)

const m = 557/* - 150*/
const M = 1117/* - 150*/

const b = (1 / daysCount) * Math.log((M - m) / daysCount)
const d = daysCount / (2*Math.PI * 4)
const c = 4
const a = m / c

// Моделирование и обработка.
const itou = days.map(itouProcess({ a, b, c, d }))
const pumps = Plots.spikes({ ys: itou, N: 150, value: 100, multiplier: 3 })
const denoised = Plots.denoise(pumps, 15)
const line = Plots.linearRegression({ xs: days, ys: google.slice(0, 400) })
const percent = Plots.differenceAbs(google, line.ys).map((v, i) => 100 * (v / google[i]))

// console.log(getStatistics(percent))
// printStatsTeX()

// Построение графиков.
addPlots([
  {
    title: 'Линейная регрессия', data: [
      { x: days, y: google, name: 'Google' },
      { x: line.xs, y: line.ys, name: 'Модель регрессии' },
    ]
  },
  { xs: days, ys: percent, title: 'Ошибка регрессии (%)' },
  { xs: days, ys: itou, title: 'Itou' },
  { xs: days, ys: denoised, title: 'denoised' },
])
addPlots([
  { xs: days, ys: Plots.autoCorrelation(Plots.antitrend(google)), title: 'Автокорреляция Google' },
  { xs: days, ys: Plots.autoCorrelation(Plots.antitrend(itou)), title: 'Автокорреляция Itou' },
  { xs: days, ys: Plots.autoCorrelation(Plots.antitrend(denoised)), title: 'Автокорреляция Denoised' },
])



function printStatsTeX () {
  const cols = [
    ['', ...getStatisticsTexTable(google).map(s => s.stat)],
    ['Google', ...getStatisticsTexTable(google).map(s => s.value)],
    ['Itou', ...getStatisticsTexTable(itou).map(s => s.value)],
    ['Denoised', ...getStatisticsTexTable(denoised).map(s => s.value)],
  ]

  const tableTeX = cols[0].reduce((acc, curr, i) => {
    acc.push(cols.map(c => c[i]).join(' & '))
    return acc
  }, []).join(' \\\\\n\\hline\n')

  console.log(tableTeX)
}

function getStatisticsTexTable (arr) {
  const result = []
  for (const [s, v] of Object.entries(getStatistics(arr))) {
    if (s === 'sum') continue
    const stat = `$ ${statisticsTeX[s]} $`
    const value = Math.abs(v) < 10000
      ? `$ ${v.toFixed(2)} $`
      : `$ ${v.toExponential(2).replace(/e\+(\d+)/, ' \\cdot 10^{$1}')} $`
    result.push({ stat, value })
  }
  return result
}

// Частный случай Ито-процесса.
function itouProcess ({ a = 1, b = 1, c = 1, d = 1 } = {}) {
  return t => Math.exp(b * t) * t + d * Math.sin(t / d) * randomJS(0, c) + a * c
}

// Добавляет графики на страницу.
function addPlots (plots) {
  const $plotsBlock = document.createElement('div')
  $plotsBlock.className = 'plots-block'
  $plots.appendChild($plotsBlock)

  for (const { data = null, xs = [], ys = [], title = '' } of plots) {
    const id = `plotly-${UID()}`
    const $plot = document.createElement('div')
    $plot.id = id
    $plot.className = 'plot'
    $plotsBlock.appendChild($plot)

    Plots.makePlot({ id, data, x: xs, y: ys, title })
  }
}
