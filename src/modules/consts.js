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


// gradientHorizontal: [
//   [0, 0, 0],
//   [0, -1, 0],
//   [0, 0, 1],
// ],
// gradientVertical: [
//   [0, 0, 0],
//   [0, 0, -1],
//   [0, 1, 0],
// ]
