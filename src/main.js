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
import { generateUID, borders } from './modules/utils.js'
import { readFileInt16, readXcr } from './modules/files.js'
import Plots from './modules/Plots.js'
import Morphology from './modules/Morphology.js'
import Matrix from './modules/Matrix.js'
import Matricies from './modules/Matricies.js'
import { derivative, indexOfMax, fourier1DTransform, reverseFourier1DTransform } from './modules/lists.js'
import { masks, IMAGES } from './modules/definitions.js'

// const _ = require('lodash')

const fs = require('fs')
const encode = require('image-encode')
const decode = require('image-decode')

// Элемент, в который будем добавлять графики.
const $plots = document.querySelector('.plots')
const inlineImages = true

const corePath = './data/img'


// Тестирую градиент, лапласиан + накладываю это на оригинал
async function runShite () {
  const { original } = await loadImageFromPics(IMAGES.segmentation.stonesSegment)
  const base = original.copy()
  const gradient = dropLowerThanBorder(getGradient(base, 30))
  // const laplace = base.applyMask(masks.laplace, { useBorders: true }).map(v => v > 8 ? borders(4 * v) : 0)
  const multiplication = Matricies.multiply(base, gradient)
  const masked = Matricies.withMask(base, multiplication)

  const jija = toBlackAndWhite(Matricies.add(base, masked))

  displayMatrix(original, 'Оригинал')
  displayMatrix(base, 'База')
  displayMatrix(gradient, 'Градиент')
  // displayMatrix(laplace, 'Лапласиан')
  displayMatrix(multiplication, 'Оригинал * Градиент')
  displayMatrix(masked, 'После маски')
  displayMatrix(jija, 'После маски')
  displayMatrix(Matricies.withMask(base, jija), 'После маски')
}

function getGradient (matrix) {
  const horizontal = matrix.applyMask(masks.gradientHorizontal)
  const vertical = matrix.applyMask(masks.gradientVertical)
  return matrixSumSq(horizontal, vertical)
}

function dropLowerThanBorder (matrix, border = 128) {
  return matrix.map(v => v < border ? 0 : v)
}

function toBlackAndWhite (matrix, border = 128) {
  return matrix.map(v => v < border ? 0 : 255)
}

;(async function () {
  console.log("Calculating...");
  const startMs = performance.now()
  await runShite()
  const endMs = performance.now()
  console.log('Current run took', Number((endMs - startMs).toFixed(2)), 'ms.');
})()

async function loadImageFromPics (imgObject) {
  return await loadImage(imgObject.filename, imgObject)
}

async function loadImage (fullName, { dir = '', color = false, w = 256, h = w } = {}) {
  const [fileName, fileExt] = fullName.split('.')
  const imagePath = `${corePath}/${dir ? `${dir}/` : ''}${fullName}`

  const result = { fullName, dir, fileName, fileExt, imagePath }

  if (['png', 'jpg', 'jpeg'].includes(fileExt)) {
    const decoded = decode(fs.readFileSync(imagePath))
    const { width, height } = decoded
    const arr = color ? toRGBA(decoded.data) : toPixels(decoded.data)
    const original = new Matrix(arr, { width, height, color })
    return { ...result, original }
  } else if (fileExt === 'bin') {
    const arr = await readFileInt16(imagePath)
    const original = new Matrix(arr, { width: w, height: h })
    return { ...result, original }
  }

  return result
}

function multiplyMatricies (m1, m2) {

}
function matrixSumAbs (m1, m2) {
  return m1.copy().map((_, r, c) => borders(Math.abs(m1.matrix[r][c]) + Math.abs(m2.matrix[r][c])))
}
function matrixSumSq (m1, m2) {
  return m1.copy().map((_, r, c) => borders(Math.sqrt(m1.matrix[r][c]**2 + m2.matrix[r][c]**2)))
}
function matrixSum (m1, m2) {
  return m1.copy().map((_, r, c) => borders(m1.matrix[r][c] + m2.matrix[r][c]))
}
function matrixDifference (m1, m2) {
  return m1.copy().map((_, r, c) => borders(m1.matrix[r][c] - m2.matrix[r][c]))
}
function matrixAbsDifference (m1, m2) {
  if (!m1.color) {
    return m1.copy().map((_, r, c) => borders(Math.abs(m1.matrix[r][c] - m2.matrix[r][c])))
  } else {
    console.log({
      R: borders(10 * Math.abs(m1.matrix[0][0].R - m2.matrix[0][0].R)),
      G: borders(10 * Math.abs(m1.matrix[0][0].G - m2.matrix[0][0].G)),
      B: borders(10 * Math.abs(m1.matrix[0][0].B - m2.matrix[0][0].B)),
      A: 255
    })
    return m1.copy().map((_, r, c) => ({
      R: borders(Math.abs(m1.matrix[r][c].R - m2.matrix[r][c].R)),
      G: borders(Math.abs(m1.matrix[r][c].G - m2.matrix[r][c].G)),
      B: borders(Math.abs(m1.matrix[r][c].B - m2.matrix[r][c].B)),
      A: 255
    }))
  }
}

function displayMatrix (matrix, caption = '') {
  const savedImage = saveImage(matrix.toArray(), { ...matrix })
  addImage(savedImage, caption)
}

function saveImage (arr, { name = 'shite-' + generateUID(), width, height, color = false } = {}) {
  const savedImage = `${corePath}/temp/${name}.jpg`
  const values = color ? toValues(arr) : pixelsToValues(arr)
  const encoded = encode(values, [width, height], 'jpg')
  fs.writeFileSync(savedImage, Buffer.from(encoded))
  return savedImage
}

function normalize (data) {
  const minValue = min(data)
  const maxValue = max(data)
  const normalizer = 256 * (1 / (maxValue - minValue))
  return data.map(v => borders((v - minValue) * normalizer))
}

function addLineBreak () {
  $plots.appendChild(document.createElement('br'))
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
    RGBA[i].R = fn(RGBA[i].R, i, RGBA)
    RGBA[i].G = fn(RGBA[i].G, i, RGBA)
    RGBA[i].B = fn(RGBA[i].B, i, RGBA)
  }
}

function toRGBA (imageData) {
  const result = []
  let current = 'R'
  for (let i = 3; i < imageData.length; i += 4) {
    result.push({ R: imageData[i - 3], G: imageData[i - 2], B: imageData[i - 1], A: imageData[i] })
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
  for (let i = 0; i < RGBA.length; i++) {
    result.push(RGBA[i].R)
    result.push(RGBA[i].G)
    result.push(RGBA[i].B)
    result.push(RGBA[i].A)
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
    const id = `plotly-${generateUID()}`
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
