import { genArray, borders } from './utils.js'

export default class Matrix {
  constructor (base, { width = base.width, height = base.height } = {}) {
    if (base instanceof Array) {
      this.matrix = genArray(height, r => genArray(width, c => base[r * width + c]))  
    } else if (base instanceof Matrix) {
      this.matrix = genArray(height, r => genArray(width, c => base.matrix[r][c]))
    } else {
      console.log('A MOZHET TI PIDOR!?')
    }
    this.#calculateSides()
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

  resize ({ width = this.width, height = this.height, method = Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR }) {
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
  }

  matrixIterator = function* () {
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

  negative (maxValue = 255) {
    return this.map(v => maxValue - v)
  }

  logTransform ({ multiplier = 1, useBorders = true } = {}) {
    if (useBorders) return this.map(v => borders(multiplier * Math.log(1 + v)))
    else return is.map(v => multiplier * Math.log(1 + v))
  }

  powerTransform ({ multiplier = 1, power = 2, useBorders = true } = {}) {
    if (useBorders) return this.map(v => borders(multiplier * v**power))
    else return is.map(v => multiplier * v**power)
  }

  createHistogram (values = 256) {
    const histogram = genArray(values, () => 0)
    for ({ value } of this.matrixIterator()) {
      histogram[Math.floor(value)] += 1
    }
  }

  #calculateSides () {
    this.rows    = this.height = this.matrix.length
    this.columns = this.width  = this.rows > 0 ? this.matrix[0].length : 0
  }
}
