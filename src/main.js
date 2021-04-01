/*
  Файл main.js:
  основной код.
*/

import {
  getStatistics,
  min,
  max,
  statisticsTeX,
  randomJS
} from './modules/statistics.js'
import { commonCounter, borders, genArray } from './modules/utils.js'
import { readXcr } from './modules/files.js'
import UID from './modules/UID.js'
import Plots from './modules/Plots.js'
import Matrix from './modules/Matrix.js'
import { derivative, indexOfMax, fourier1DTransform, reverseFourier1DTransform } from './modules/lists.js'

// const _ = require('lodash')

const fs = require('fs')
const encode = require('image-encode')
const decode = require('image-decode')

// Элемент, в который будем добавлять графики.
const $plots = document.querySelector('.plots')
const inlineImages = true

const corePath = './data/img'

;(async function () {
  const startMs = performance.now()
  await runShite()
  const endMs = performance.now()
  console.log('Current run took', Number((endMs - startMs).toFixed(2)), 'ms.');
})()

async function runShite () {
  const fullName = 'some-kek.xcr'
  // const fullName = 'x-ray.xcr'
  const [fileName, fileExt] = fullName.split('.')
  const imagePath = `${corePath}/${fullName}`

  const sizes = {
    'x-ray.xcr': { width: 1024, height: 1024 },
    'some-kek.xcr': { width: 2048, height: 2500 },
  }
  const { width, height } = sizes[fullName]
  const xcr = await readXcr(`${corePath}/${fileName}.${fileExt}`)
  // const arr = normalize(xcr.data)
  const arr = xcr.data

  // const decoded = decode(fs.readFileSync(imagePath))
  // const { width, height } = decoded
  // const arr = toPixels(decoded.data)

  // insert your shit here

  const original = new Matrix(arr, { width, height }).rotate(270).normalize()

    // .rotate(270)
  // const resized = original.copy().resize({ multiplier: 2 })

  const booba = 0.3839999999
  const bones = 0.2939453125

  const xRay = {
    max: 0.38654439024,
    interval: 0.05,
    m: 16
  }
  xRay.weights = Plots.potterBandStopWeights({
    fc1: xRay.max - xRay.interval,
    fc2: xRay.max + xRay.interval,
    m: xRay.m,
    dt: 1
  })
  const filtered = original.copy().mapByRow(r => Plots.convolution(r, xRay.weights))
    .calculateSides()
    .mapByRow(row => row.slice(xRay.m, xRay.m + original.columns).map(x => borders(x)))
    .calculateSides()
  const resizedFiltered = filtered.copy().resize({ width: 256, height: 256 })

  console.log('Maximum', findMaximum({ plot: true }))

  function findMaximum ({ step = 10, plot = false } = {}) {
    const spectres = []
    const maximums = []
    let prevRowD = null
    const maxI = !plot ? original.rows : 60
    for (let i = 0; i < maxI; i += step) {
      const { matrixRowD, spectre } = processRow(i, prevRowD)
      prevRowD = matrixRowD
      const secondHalf = spectre.ys.slice(spectre.ys.length / 2)
      maximums.push(0.25 + indexOfMax(secondHalf) / (spectre.ys.length * 2))
      if (plot) spectres.push(spectre)
    }
    if (plot) addPlots(spectres)
    return { spectres, max: getStatistics(maximums) }
  }

  function processRow (row, prevRowD = null) {
    const matrixRowD = derivative(original.matrix[row])

    if (prevRowD === null) prevRowD = matrixRowD

    const crossCorr = Plots.crossCorrelation(matrixRowD, prevRowD)
    const spectre = Plots.spectrumPlotData({ ys: crossCorr, dt: 1, title: `${row + 1}-row` })

    return { matrixRowD, spectre }
  }

  addMatrixToPage(original.normalize().negative().resize({ width: 256, height: 256 }), 'было')
  // addMatrixToPage(resized.normalize())
  addMatrixToPage(resizedFiltered.normalize().negative(), 'стало')
  // addMatrixToPage(filtered.normalize().negative().resize({ width: 256, height: 256 }), 'стало')
}

// const fourier = original.copy()
//   // .resize({ width: 16, height: 16 })
//   .fourierTransform2D()
//   // .reverseFourierTransform2D()
//   .prettifyFourier({ logN: 10 })

// const white = original.copy().addNoise({ method: Matrix.NOISE_METHODS.WHITE_NOISE })
// const saltAndPepper = original.copy().addNoise({ method: Matrix.NOISE_METHODS.SALT_AND_PEPPER })
// const mix = original.copy().addNoise({ method: Matrix.NOISE_METHODS.MIX })

// addMatrixToPage(original)
// addMatrixToPage(saltAndPepper.denoise())
// addMatrixToPage(white.denoise())
// addMatrixToPage(mix.denoise())

// const fourier = original.copy()
//     // .resize({ width: 16, height: 16 })
//     .fourierTransform2D()
//     // .reverseFourierTransform2D()
//     .prettifyFourier({ logN: 10 })
// addMatrixToPage(fourier)

function matrixDifference (m1, m2) {
  return m1.copy().map((v, r, c) => borders(m1.matrix[r][c] - m2.matrix[r][c]))
}
function matrixAbsDifference (m1, m2) {
  return m1.copy().map((v, r, c) => borders(Math.abs(m1.matrix[r][c] - m2.matrix[r][c])))
}

function addMatrixToPage (matrix, caption = '') {
  const savedImage = saveImage(matrix.toArray(), { width: matrix.width, height: matrix.height })
  addImage(savedImage, caption)
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

function addImage (imagePath, caption = '') {
  const $container = inlineImages
    ? document.createElement('span')
    : document.createElement('div')
  $container.className = 'image-container'
  if (inlineImages) {
    $container.style.margin = '0.1rem'
  }
  const $img = document.createElement('img')
  $img.src = imagePath
  $container.appendChild($img)
  if (caption !== '') {
    const $caption = document.createElement('span')
    $caption.className = 'caption'
    $caption.innerHTML = caption
    $container.appendChild($caption)
  }
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
