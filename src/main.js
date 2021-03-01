/*
  Файл main.js:
  основной код.
*/

import {
  getStatistics,
  min,
  max,
  statisticsTeX
} from './modules/statistics.js'
import { commonCounter, borders } from './modules/utils.js'
import { readXcr } from './modules/files.js'
import UID from './modules/UID.js'
import Plots from './modules/Plots.js'
import Matrix from './modules/Matrix.js'

// const _ = require('lodash')

const fs = require('fs')
const encode = require('image-encode')
const decode = require('image-decode')

// Элемент, в который будем добавлять графики.
const $plots = document.querySelector('.plots')
const inlineImages = true

const corePath = './data/img'

// const imagePath = `${corePath}/angel.jpg`
// addImage(imagePath)
// const { data, width, height } = decode(fs.readFileSync(imagePath))
// const RGBA = toRGBA(data)
// toEachColor(RGBA, v => borders(v**3 - v**2 - 10*v))
// const savedImage = `${corePath}/test.jpg`
// fs.writeFileSync(savedImage, Buffer.from(encode(toValues(RGBA), [width, height], 'jpg')))
// addImage(savedImage)

;(async function () {
  const startMs = performance.now()
  await runShite()
  const endMs = performance.now()
  console.log('Current run took', Number((endMs - startMs).toFixed(2)), 'ms.');
})()

async function runShite () {
  const fullName = 'booba.jpg'
  const [fileName, fileExt] = fullName.split('.')
  const imagePath = `${corePath}/${fullName}`

  // const width = 1024
  // const height = 1024
  // const xcr = await readXcr(`${corePath}/${fileName}.${fileExt}`)
  // const arr = normalize(xcr.data)

  const decoded = decode(fs.readFileSync(imagePath))
  const { width, height } = decoded
  const arr = toPixels(decoded.data)

  const original = new Matrix(arr, { width, height })
    // .resize({
    //   width: 420,
    //   height: 420,
    //   method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION
    // })
    // .rotate(270)

  // const brightened = (new Matrix(original)).resize()

  // const resized = new Matrix(arr, { width, height })
  // const matrixCopy = new Matrix(arr, { width, height })

  // matrix.rotate(270)

  // const multiplier = 1/3
  // const neighbour = (new Matrix(original))
  //   .resize({ multiplier, method: Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR})
    // .resize({ width: original.width, height: original.height, method: Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR})

  // const bilinear = (new Matrix(original))
  //   .resize({ multiplier, method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION})
    // .resize({ width: original.width, height: original.height, method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION})
  // resized.resize({
  //   width: original.width,
  //   height: original.height,
  //   method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION
  // })

  const equalized = original.copy().histogramEqualization()
  // const diff1 = matrixAbsDifference(original, neighbour)
  // const diff2 = matrixAbsDifference(original, bilinear)
  
  addPlots([
    { ys: original.createHistogram() },
    { ys: equalized.createHistogram() }
  ])


  const phi = 2.6180339887

  // const neighbour = original.copy()
  //   .resize({ multiplier: phi, method: Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR })
  //   .resize({ width: 256, height: 256, method: Matrix.RESIZE_METHODS.NEAREST_NEIGHBOUR })
  // const bilinear = original.copy()
  //   .resize({ multiplier: phi, method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION })
  //   .resize({ width: 256, height: 256, method: Matrix.RESIZE_METHODS.BILINEAR_INTERPOLATION })

  addMatrixToPage(original)
  addMatrixToPage(equalized)
  // addMatrixToPage(matrixAbsDifference(original, neighbour).powerTransform({ multiplier: 0.25, power: 2 }))
  // addMatrixToPage(matrixAbsDifference(original, bilinear).powerTransform({ multiplier: 0.25, power: 2 }))
  // addMatrixToPage(original.logTransform({ multiplier: 15 }))
  // addMatrixToPage(original.powerTransform({ multiplier: 0.25, power: 1.5 }))
  // addMatrixToPage(original.histogramEqualization())
  // addMatrixToPage(bilinear)
  // addMatrixToPage(diff1.powerTransform({ multiplier: 2, power: 2 }))
  // addMatrixToPage(diff2.powerTransform({ multiplier: 2, power: 2 }))
  // addMatrixToPage(resized)
  // addMatrixToPage(diff.powerTransform({ multiplier: 2, power: 2 }))
  // addMatrixToPage((new Matrix(diff)).powerTransform({ multiplier: 1.5, power: 1.1 }))
  // addMatrixToPage((new Matrix(diff)).logTransform({ multiplier: 20 }))
}

function matrixDifference (m1, m2) {
  return (new Matrix(m1)).map((v, r, c) => borders(m1.matrix[r][c] - m2.matrix[r][c]))
}
function matrixAbsDifference (m1, m2) {
  return (new Matrix(m1)).map((v, r, c) => borders(Math.abs(m1.matrix[r][c] - m2.matrix[r][c])))
}

function addMatrixToPage (matrix) {
  const savedImage = saveImage(matrix.toArray(), { width: matrix.width, height: matrix.height })
  addImage(savedImage)
}

function saveImage (arr, { name = 'shite-' + commonCounter(), width, height } = {}) {
  const savedImage = `${corePath}/temp/${name}.jpg`
  fs.writeFileSync(savedImage, Buffer.from(encode(pixelsToValues(arr), [width, height], 'jpg')))
  return savedImage
}

function normalize (data) {
  const minValue = min(data)
  const maxValue = max(data)
  const normalizer = 256 * (1 / (maxValue - minValue))
  return data.map(v => borders((v - minValue) * normalizer))
}

// function matrixElementFn (fn) {
//   if (!matrix || matrix.length === 0 || matrix[0].length === 0) {
//     console.error('BITCH, ARE YOU FUCKING WITH ME?', { fn: 'matrixElementFn', matrix })
//     return []
//   }
//   const rows = matrix.length
//   const columns = matrix[0].length
//   for (let r = 0; r < rows; r++)
//     for (let c = 0; c < rows; c++)
//       fn(matrix[r][c], r, c)
// }

// function getMatrixData (matrix) {
//   const rows = matrix.length
//   const columns = matrix[0].length
//   return { rows, columns }
// }

// function rotate (matrix, deg = 90) {
//   const { rows, columns } = matrix
//   if (deg === 90) {
//     return genArray(columns, c => genArray(rows, r => matrix[rows - r - 1][c]))
//   } else if (deg === 180) {

//   } else if (deg === 270) {

//   } else if (deg === 0 || deg === 360) {
//     return matrix
//   } else {
//     console.log("POSHOL NAHUI, UMNIK EBANIY")
//     return matrix
//   }
// }

// function transposed (matrix) {
//   const rows = matrix.length
//   const columns = matrix[0].length
//   return genArray(columns, c => genArray(rows, r => matrix[r][c]))
// }

// function arrayToMatrix (arr, { width, height } = {}) {
//   if (!(arr && width > 0 && height > 0)) {
//     console.error('THE FUCK ARE YOU GIVING ME?', { fn: 'arrayToMatrix', arr, width, height })
//     return []
//   }

//   const result = {}
//   result.matrix = genArray(height, r => genArray(width, c => arr[r * width + c]))
//   result.basedArray = arr
//   result.width = result.columns = width
//   result.height = result.rows = height

//   return result
// }

// function matrixToArray (matrix) {
//   return matrix.flat()
// }

function addImage (imagePath) {
  const $container = inlineImages
    ? document.createElement('span')
    : document.createElement('div')
  if (inlineImages) {
    $container.style.margin = '0.1rem'
  }
  const $img = document.createElement('img')
  $img.src = imagePath
  $container.appendChild($img)
  $plots.appendChild($container)
}

function pixelsToValues (pixels) {
  const result = []
  for (let i = 0; i < pixels.length; i++) {
    result.push(pixels[i])
    result.push(pixels[i])
    result.push(pixels[i])
    result.push(255)
  }
  return result
}

function toEachColor (RGBA, fn) {
  for (let i = 0; i < RGBA.R.length; i++) {
    RGBA.R[i] = fn(RGBA.R[i], i, RGBA)
    RGBA.G[i] = fn(RGBA.G[i], i, RGBA)
    RGBA.B[i] = fn(RGBA.B[i], i, RGBA)
  }
}

function nextLetter (current) {
  if (current === 'R') return 'G'
  else if (current === 'B') return 'A'
  else if (current === 'A') return 'R'
  else if (current === 'G') return 'B'
}

function toRGBA (imageData) {
  const result = { R: [], G: [], B: [], A: [] }
  let current = 'R'
  for (const value of imageData) {
    result[current].push(value)
    current = nextLetter(current)
  }
  return result
}

function toPixels (imageData) {
  const result = []
  for (let i = 0; i < imageData.length; i += 4) {
    result.push(imageData[i])
  }
  return result
}

function toValues (RGBA) {
  const result = []
  for (let i = 0; i < RGBA.R.length; i++) {
    result.push(RGBA.R[i])
    result.push(RGBA.G[i])
    result.push(RGBA.B[i])
    result.push(RGBA.A[i])
  }
  return result
}

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

// Добавляет графики на страницу.
function addPlots (plots) {
  const $plotsBlock = document.createElement('div')
  $plotsBlock.className = 'plots-block'
  $plots.appendChild($plotsBlock)

  for (const { data = null, xs = [], ys = [], title = '', type = 'line' } of plots) {
    const id = `plotly-${UID()}`
    const $plot = document.createElement('div')
    $plot.id = id
    $plot.className = 'plot'
    $plotsBlock.appendChild($plot)

    if (type === 'line') {
      Plots.makePlot({ id, data, x: xs, y: ys, title })
    } else if (type === 'histogram') {
      Plots.histogramPlot({ id, data, x: xs, y: ys, title })
    }
  }
}
