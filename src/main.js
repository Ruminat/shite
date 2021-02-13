/*
  Файл main.js:
  основной код.
*/

import {
  random,
  randomInt,
  randomJS,
  randomIntJS,
  getStatistics,
  splitIntoParts,
  min,
  max,
  average,
  sum,
  std,
  statisticsTeX
} from './modules/statistics.js'
import { delay, genArray } from './modules/utils.js'
import { readXcr } from './modules/files.js'
import UID from './modules/UID.js'
import Plots from './modules/Plots.js'

const fs = require('fs')
const encode = require('image-encode')
const decode = require('image-decode')

// Элемент, в который будем добавлять графики.
const $plots = document.querySelector('.plots')

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
  const width = 1024
  const height = 1024
  const xcr = await readXcr(`${corePath}/x-ray.xcr`)

  const minValue = min(xcr.data)
  const maxValue = max(xcr.data)
  console.log({ minValue, maxValue })
  const normalizer = 256 * (1 / (maxValue - minValue))
  // const normalizer = 255 / 4095
  // xcr.data = xcr.data.map(v => v + 1000)
  const normalized = xcr.data.map(v => borders((v - minValue) * normalizer))
  const savedImage = `${corePath}/shite.jpg`
  fs.writeFileSync(savedImage, Buffer.from(encode(pixelsToValues(normalized), [width, height], 'jpg')))
  addImage(savedImage)
})()

function addImage (imagePath) {
  const $img = document.createElement('img')
  $img.src = imagePath
  $plots.appendChild($img)
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
 
function borders (value, from = 0, to = 255) {
  return value > to ? to : value < from ? from : value;
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

  for (const { data = null, xs = [], ys = [], title = '' } of plots) {
    const id = `plotly-${UID()}`
    const $plot = document.createElement('div')
    $plot.id = id
    $plot.className = 'plot'
    $plotsBlock.appendChild($plot)

    Plots.makePlot({ id, data, x: xs, y: ys, title })
  }
}
