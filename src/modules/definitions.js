export class Point {
  constructor ({ row, column, x, y } = {}) {
    this.x = x ?? column
    this.y = y ?? row
    this.column = column ?? x
    this.row = row ?? y
  }

  isEqual (point) {
    return this.row === point.row && this.column === point.column
  }

  distanceTo (point) {
    return Math.sqrt((this.x - point.x)**2 + (this.y - point.y)**2)
  }
}

export const masks = {
  laplace: [
    [0, -1, 0],
    [-1, 4, -1],
    [0, -1, 0],
  ],
  gradientVertical: [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ],
  gradientHorizontal: [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ]
}

export const ELEMENT_ZERO = 0
export const ELEMENT_ONE = 255

export const structuralElements = {
  E: [
    [ELEMENT_ONE, ELEMENT_ONE, ELEMENT_ONE],
    [ELEMENT_ONE, ELEMENT_ONE, ELEMENT_ONE],
    [ELEMENT_ONE, ELEMENT_ONE, ELEMENT_ONE],
  ],
  CROSS: [
    [ELEMENT_ZERO, ELEMENT_ONE, ELEMENT_ZERO],
    [ELEMENT_ONE, ELEMENT_ONE, ELEMENT_ONE],
    [ELEMENT_ZERO, ELEMENT_ONE, ELEMENT_ZERO],
  ],
}

export const IMAGES = {
  segmentation: {
    brainH: { dir: 'segmentation', color: false, filename: 'brain-H_x512.bin', w: 512 },
    brainV: { dir: 'segmentation', color: false, filename: 'brain-V_x256.bin', w: 256 },
    spineH: { dir: 'segmentation', color: false, filename: 'spine-H_x256.bin', w: 256 },
    spineV: { dir: 'segmentation', color: false, filename: 'spine-V_x512.bin', w: 512 },
    stones: { dir: 'segmentation', color: false, filename: 'stones.jpg' },
    stonesSegment: { dir: 'segmentation', color: false, filename: 'stonesSegment.png' },
  }
}
