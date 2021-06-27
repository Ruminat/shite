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
