// filters
async function runShite () {
  const dir = '.'
  const color = false
  const { original } = loadImage('MODELimage.jpg', { dir, color })
  const HPweights = Plots.potterHighPassWeights({ m: 4, dt: 1, fc: 0.05 })
  const HPfilter = original.copy().applyPotterFilter(HPweights)
    // .normalize()
  const LPweights = Plots.potterLowPassWeights({ m: 4, dt: 1, fc: 0.05 })
  const LPfilter = original.copy().applyPotterFilter(LPweights)

  const diff = matrixDifference(original, LPfilter)
    // .map(v => borders(Math.abs(v)))
    // .pixelize(2)
    // .negative()

  addPlots([Plots.spectrumPlotData({ ys: HPweights })])

  const bubba = HPfilter.copy().map((v, r, c) => borders(Math.sqrt(v**2 + 16 * diff.matrix[r][c]**2)))

  addMatrixToPage(original, 'original')
  addMatrixToPage(HPfilter.copy().map(v => borders(4 * v)), 'high pass filter')
  addMatrixToPage(diff.map(v => borders(Math.abs(v))), 'low pass filter diff')
  addMatrixToPage(bubba.brighterLines(20), 'low pass filter diff')
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

// Morphology (erosion)
async function runShite () {
  const dir = '.'
  const color = false
  const { original } = loadImage('MODELimage.jpg', { dir, color })
  const blackAndWhite = toBlackAndWhite(original, { border: 198 })
  const fuckedUp = Morphology.dilation(blackAndWhite, structuralElements.E)

  addMatrixToPage(blackAndWhite)
  addMatrixToPage(fuckedUp)
  addMatrixToPage(matrixAbsDifference(blackAndWhite, fuckedUp))
}
