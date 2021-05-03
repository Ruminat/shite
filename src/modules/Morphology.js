const ELEMENT_ZERO = 0
const ELEMENT_ONE = 255

export default class Morphology {
  static erosion (matrix, element) {
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

  static dilation (matrix, element) {
    const windowPadding = Math.floor(element.length / 2)
    const result = matrix.copy().map(v => ELEMENT_ZERO)
    for (const { win, row, column } of matrix.windowIterator(windowPadding)) {
      result.matrix[row][column] = getValue(win, element)
    }
    return result

    function getValue (win, element) {
      for (let i = 0; i < win.length; i++)
        for (let j = 0; j < win[i].length; j++)
          if (element[i][j] === ELEMENT_ONE && win[i][j] !== ELEMENT_ONE) {
            return ELEMENT_ZERO
          }
      return ELEMENT_ONE
    }
  } 
}
