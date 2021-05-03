// LowPass filter
async function runShite () {
  const dir = '.'
  const color = false
  const { original } = loadImage('grace.jpg', { dir, color })
  const LPweights = Plots.potterLowPassWeights({ m: 128, dt: 1, fc: 0.05 })
  const LPfilter = original.copy().applyPotterFilter(LPweights)
    // .normalize()
  const diff = matrixDifference(original, LPfilter)
    .map(v => borders(v))
    // .pixelize(2)
    // .negative()

  addPlots([Plots.spectrumPlotData({ ys: LPweights })])

  addMatrixToPage(original, 'original')
  addMatrixToPage(LPfilter, 'low pass filter')
  addMatrixToPage(diff, 'low pass filter diff')
}

// Laplace
async function runShite () {
  const dir = '.'
  const color = false
  const { original } = loadImage('MODELimage.jpg', { dir, color })
  const contour = original.applyMask(masks.laplace, { useBorders: true })
    // .brighterLines(20)

  addMatrixToPage(original, 'original')
  addMatrixToPage(contour, 'contour')
}

// Gradient
async function runShite () {
  const dir = '.'
  const color = false
  const { original } = loadImage('MODELimage.jpg', { dir, color })
  const horizontal = original.applyMask(masks.gradientHorizontal)
  const vertical = original.applyMask(masks.gradientVertical)

  addMatrixToPage(original, 'original')
  addMatrixToPage(matrixSumSq(horizontal, vertical), 'contour')
}
