import { borders } from './utils.js'

export default class Matricies {
  static add (matrixA, matrixB, { useBorders = true } = {}) {
    return Matricies.zip(matrixA, matrixB, (a, b) => a + b, { useBorders })
  }

  static substract (matrixA, matrixB, { useBorders = true } = {}) {
    return Matricies.zip(matrixA, matrixB, (a, b) => a - b, { useBorders })
  }

  static substractAbs (matrixA, matrixB, { useBorders = true } = {}) {
    return Matricies.zip(matrixA, matrixB, (a, b) => Math.abs(a - b), { useBorders })
  }

  static multiply (matrixA, matrixB, { useBorders = true } = {}) {
    return Matricies.zip(matrixA, matrixB, (a, b) => a * b, { useBorders })
  }

  static withMask (matrix, mask, { useBorders = true } = {}) {
    return Matricies.zip(matrix, mask, (matrixElement, maskElement) => maskElement === 0 ? 0 : matrixElement)
  }

  static zip (matrixA, matrixB, fn, { useBorders = true } = {}) {
    return useBorders
      ? matrixA.copy().map((_, r, c) => borders(fn(matrixA.matrix[r][c], matrixB.matrix[r][c])))
      : matrixA.copy().map((_, r, c) => fn(matrixA.matrix[r][c], matrixB.matrix[r][c]))
  }
}
