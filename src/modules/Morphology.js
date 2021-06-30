import { borders } from './utils.js'
import { ELEMENT_ZERO, ELEMENT_ONE, structuralElements } from './definitions.js'

export default class Morphology {
  static erosion (matrix, element = structuralElements.E) {
    const windowPadding = Math.floor(element.length / 2)
    const result = matrix.copy().map(v => ELEMENT_ZERO)
    for (const { win, row, column } of matrix.windowIterator(windowPadding)) {
      result.matrix[row][column] = getValue(win, element)
    }
    return result

    function getValue (win, element) {
      for (let i = 0; i < win.length; i++)
        for (let j = 0; j < win[i].length; j++)
          if (element[i][j] === ELEMENT_ONE && win[i][j] !== ELEMENT_ONE)
            return ELEMENT_ZERO
      return ELEMENT_ONE
    }
  }

  static dilation (matrix, element = structuralElements.E) {
    const windowPadding = Math.floor(element.length / 2)
    const result = matrix.copy()
    for (const { win, row, column } of matrix.windowIterator(windowPadding)) {
      if (matrix.matrix[row][column] !== ELEMENT_ONE) continue
      for (let i = 0; i < win.length; i++) {
        for (let j = 0; j < win[i].length; j++) {
          if (element[i][j] === ELEMENT_ONE) {
            const r = borders(row + i - windowPadding, 0, result.rows - 1)
            const c = borders(column + j - windowPadding, 0, result.columns - 1)
            result.matrix[r][c] = ELEMENT_ONE
          }
        }
      }
    }
    return result
  }
}
