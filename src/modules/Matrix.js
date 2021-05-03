import { genArray, borders } from './utils.js'
import { randomJS, average, median } from './statistics.js'
import { fourier1DTransform, reverseFourier1DTransform } from './lists.js'
import Plots from './Plots.js'

export default class Matrix {
  constructor (base, { width = base.width, height = base.height, color = false } = {}) {
    if (base instanceof Array) {
      this.matrix = genArray(height, r => genArray(width, c => base[r * width + c]))
    } else if (base instanceof Matrix) {
      this.matrix = genArray(height, r => genArray(width, c => base.matrix[r][c]))
    } else {
      console.log('A MOZHET TI PIDOR!?')
    }
    this.color = color
    this.#calculateSides()
  }

  copy () {
    return new Matrix(this, this)
  }

  transposed () {
    this.matrix = genArray(this.columns, c => genArray(this.rows, r => this.matrix[r][c]))
    this.#calculateSides()
    return this
  }

  rotate (deg = 90) {
    if (deg === 90) {
      this.matrix = genArray(this.columns, c => genArray(this.rows, r => this.matrix[this.rows - r - 1][c]))
    } else if (deg === 180) {
      this.matrix = genArray(this.rows, r => genArray(this.columns, c => this.matrix[this.rows - r - 1][this.columns - c - 1]))
    } else if (deg === 270) {
      this.matrix = genArray(this.columns, c => genArray(this.rows, r => this.matrix[r][this.columns - c - 1]))
    } else {
      console.log("POSHOL NAHUI, UMNIK EBANIY")
    }
    this.#calculateSides()
    return this
  }

  static RESIZE_METHODS = {
    NEAREST_NEIGHBOUR: 'nearest_neighbour',
    BILINEAR_INTERPOLATION: 'bilinear_interpolation',
  }

  resize ({
    multiplier = 2,
    width = Math.floor(this.width * multiplier),
    height = Math.floor(this.height * multiplier),
    method = Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR
  }) {
    const maxX = this.width - 1
    const maxY = this.height - 1
    const widthCoeff = maxX / width
    const heightCoeff = maxY / height

    if (method === Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR) {
      this.matrix = genArray(height, r => genArray(width, c =>
        this.matrix[Math.floor(r * heightCoeff)][Math.floor(c * widthCoeff)]
      ))
    } else if (method === Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION) {
      this.matrix = genArray(height, r => genArray(width, c => {
        const x = c * widthCoeff
        const y = r * heightCoeff
        const [x1, x2] = this.#getNearestIndexes(x, maxX)
        const [y1, y2] = this.#getNearestIndexes(y, maxY)
        const dx1 = x2 - x
        const dx2 = x - x1
        const dy1 = y2 - y
        const dy2 = y - y1
        return (
            dx1 * (dy1 * this.matrix[y1][x1] + dy2 * this.matrix[y2][x1])
          + dx2 * (dy1 * this.matrix[y1][x2] + dy2 * this.matrix[y2][x2])
        )
      }))
    } else {
      console.log("TI EBLAN?", { fn: 'resize', width, height, method })
    }
    this.#calculateSides()
    return this
  }

  *matrixIterator () {
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        yield { value: this.matrix[row][column], row, column }
      }
    }
  }

  #getNearestIndexes (i, maxIndex) {
    const floor = Math.floor(i)
    if (i + 1 > maxIndex) return [maxIndex - 1, maxIndex]
    else if (i < 1) return [0, 1]
    else return [floor, floor + 1]
  }

  toArray () {
    return this.matrix.flat()
  }

  map (fn) {
    this.matrix = genArray(this.rows, r => genArray(this.columns, c => fn(this.matrix[r][c], r, c)))
    return this
  }

  mapByRow (fn) {
    this.matrix = genArray(this.rows, r => fn(this.matrix[r], r))
    return this
  }

  negative (maxValue = 255) {
    return this.map(v => maxValue - v)
  }

  logTransform ({ multiplier = 1, useBorders = true } = {}) {
    if (useBorders) return this.map(v => borders(multiplier * Math.log(1 + v)))
    else return this.map(v => multiplier * Math.log(1 + v))
  }

  powerTransform ({ multiplier = 1, power = 2, useBorders = true } = {}) {
    if (useBorders) return this.map(v => borders(multiplier * v**power))
    else return this.map(v => multiplier * v**power)
  }

  normalize (upperBound = 256) {
    let minValue = this.matrix[0][0]
    let maxValue = this.matrix[0][0]
    for (const { value } of this.matrixIterator()) {
      if (value < minValue) minValue = value
      if (value > maxValue) maxValue = value
    }
    const normalizer = upperBound / (maxValue - minValue)
    return this.map(v => borders((v - minValue) * normalizer))
  }

  pixelize (bits = 8, { upperBound = 256 } = {}) {
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(bits)) {
      console.error("TI DOLBAEB ILI DA?");
      return this
    }
    const forward = 1 / 2**(9 - bits)
    const backward = 2**(9 - bits)
    return this.map(v => borders(Math.round(v * forward) * backward))
  }

  brighterLines (border, brightestValue = 255) {
    return this.map(v => v >= border ? brightestValue : v)
  }

  createHistogram (values = 256) {
    const histogram = genArray(values, () => 0)
    for (const { value } of this.matrixIterator()) {
      histogram[Math.floor(value)] += 1
    }
    return histogram
  }

  histogramEqualization ({ values = 256, histogram = this.createHistogram(values) } = {}) {
    const histogramAdditive = [...histogram]
    for (let i = 1; i < values; i++) {
      histogramAdditive[i] = histogramAdditive[i - 1] + histogramAdditive[i]
    }
    const normalizer = (values - 1) / (histogramAdditive[values - 1] - histogramAdditive[0])
    const normalizedHistogram = histogramAdditive.map(h => normalizer * (h - histogramAdditive[0]))
    return this.map(v => normalizedHistogram[Math.floor(v)])
  }

  #calculateSides () {
    this.rows    = this.height = this.matrix.length
    this.columns = this.width  = this.rows > 0 ? this.matrix[0].length : 0
  }
  calculateSides () {
    this.rows    = this.height = this.matrix.length
    this.columns = this.width  = this.rows > 0 ? this.matrix[0].length : 0
    return this
  }

  static NOISE_METHODS = {
    SALT_AND_PEPPER: 'salt_and_pepper',
    WHITE_NOISE: 'white_noise',
    MIX: 'mix',
  }

  addNoise ({ method = Matrix.NOISE_METHODS.WHITE_NOISE, probability = 0.01, multiplier = 50 } = {}) {
    if (method === Matrix.NOISE_METHODS.WHITE_NOISE) {
      return this.map(v => borders(v + randomJS(-multiplier, multiplier)))
    } else if (method === Matrix.NOISE_METHODS.SALT_AND_PEPPER) {
      return this.map(v => randomJS() < probability ? (randomJS() < 0.5 ? 255 : 0) : v)
    } else if (method === Matrix.NOISE_METHODS.MIX) {
      return this
        .addNoise({ method: Matrix.NOISE_METHODS.WHITE_NOISE, probability, multiplier })
        .addNoise({ method: Matrix.NOISE_METHODS.SALT_AND_PEPPER, probability, multiplier })
    } else {
      console.log("A TI NE OHUEL, HUILO, BLYAT");
      return this
    }
  }

  static DENOISE_METHODS = {
    WINDOW_AVERAGE: 'window_average',
    WINDOW_MEDIAN: 'window_median',
  }

  denoise ({ method = Matrix.DENOISE_METHODS.WINDOW_AVERAGE, windowPadding = 2 } = {}) {
    for (const { win, row, column } of this.windowIterator(windowPadding)) {
      const flatWindow = win.flat()
      if (method === Matrix.DENOISE_METHODS.WINDOW_AVERAGE) {
        this.matrix[row][column] = average(flatWindow)
      } else {
        this.matrix[row][column] = median(flatWindow)
      }
    }
    return this
  }

  applyMask (mask, { useBorders = false } = {}) {
    const windowPadding = Math.floor(mask.length / 2)
    const result = this.copy()
    for (const { win, row, column } of this.windowIterator(windowPadding)) {
      let newValue = 0
      for (let i = 0; i < win.length; i++)
        for (let j = 0; j < win[i].length; j++)
          newValue += mask[i][j] * win[i][j]
      result.matrix[row][column] = useBorders ? borders(newValue) : newValue
    }
    return result
  }

  *windowIterator (windowPadding = 1) {
    const windowWidth = 2 * windowPadding + 1
    for (let row = 0; row < this.rows; row++) {
      for (let column = 0; column < this.columns; column++) {
        const win = this.#getWindow({
          windowPadding,
          windowWidth,
          row: borders(row, windowPadding, this.rows - windowPadding - 1),
          column: borders(column, windowPadding, this.columns - windowPadding - 1)
        })
        yield ({ row, column, win })
      }
    }
  }

  #getWindow ({ windowPadding, windowWidth, row, column }) {
    return genArray(windowWidth, r => genArray(windowWidth, c => this.matrix[row - windowPadding + r][column - windowPadding + c]))
  }

  fourierTransform2D () {
    return this
      .mapByRow(row => fourier1DTransform(row))
      .transposed()
      .mapByRow(column => fourier1DTransform(column))
      .transposed()
      .fourierRearrange()
  }

  prettifyFourier ({ logN = null } = {}) {
    const toReal = this.map(x => Math.sqrt(x.re**2 + x.im**2))
    const prettify = logN !== null
      ? toReal.logTransform({ multiplier: logN, useBorders: false })
      : toReal
    return prettify.normalize()
  }

  reverseFourierTransform2D () {
    return this
      .fourierRearrange()
      .transposed()
      .mapByRow(column => reverseFourier1DTransform(column))
      .transposed()
      .mapByRow(row => reverseFourier1DTransform(row))
  }

  fourierRearrange () {
    const rowsCenter = Math.round(this.rows / 2)
    const columnsCenter = Math.round(this.columns / 2)
    for (let r = 0; r < rowsCenter; r++) {
      for (let c = 0; c < columnsCenter; c++) {
        // try {
          [this.matrix[r][c], this.matrix[r + rowsCenter][c + columnsCenter]] =
            [this.matrix[r + rowsCenter][c + columnsCenter], this.matrix[r][c]];
        // } catch (err) {

        // }
        // try {
          [this.matrix[r + rowsCenter][c], this.matrix[r][c + columnsCenter]] =
            [this.matrix[r][c + columnsCenter], this.matrix[r + rowsCenter][c]];
        // } catch (err) {

        // }
      }
    }
    return this
  }

  applyPotterFilterByRows (weights) {
    const m = Math.floor(weights.length / 2)
    return this.mapByRow(
      row => Plots.convolution(row, weights)
        .slice(m, m + row.length)
    )
  }

  applyPotterFilter (weights) {
    return this.applyPotterFilterByRows(weights)
      .transposed()
      .applyPotterFilterByRows(weights)
      .transposed()
      .map(v => borders(v))
  }
}
