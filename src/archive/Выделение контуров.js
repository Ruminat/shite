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
  const fuckedUp = Morphology.erosion(blackAndWhite, structuralElements.E)

  addMatrixToPage(blackAndWhite)
  addMatrixToPage(fuckedUp)
  addMatrixToPage(matrixAbsDifference(blackAndWhite, fuckedUp))
}

// Эквализация
async function runShite () {
  const dir = 'segmentation'
  const color = false
  const { original: original1 } = await loadImageFromPics(Pics.segmentation.brainH)
  const { original: original2 } = await loadImageFromPics(Pics.segmentation.brainV)
  const { original: original3 } = await loadImageFromPics(Pics.segmentation.spineH)
  const { original: original4 } = await loadImageFromPics(Pics.segmentation.spineV)

  const pics = [original1, original2, original3, original4].map(o => o.normalize())

  function process (pic) {
    return pic.copy()
      .map(v => v < 10 ? 0 : v)
      .histogramEqualization()
  }

  function contour (pic) {
    return pic.copy().gradient()
  }

  for (const pic of pics) {
    const c = contour(pic).map(v => 0.5 * v)
    const a = process(pic)
    const b = matrixSum(process(pic), c)
    addMatrixToPage(pic, 'оригинал')
    addMatrixToPage(c, 'контур')
    addMatrixToPage(a, 'эквализированный')
    addMatrixToPage(b, 'результат')
    addMatrixToPage(matrixAbsDifference(a, b), 'результат − эквализированный')
    addLineBreak()
  }
}

/*
  Задание его ебучее с камнями нахуй
*/

// Тестирую градиент, лапласиан + накладываю это на оригинал
async function runShite () {
  const { original } = await loadImageFromPics(IMAGES.segmentation.stones)
  const denoised = original.copy().denoise({ method: Matrix.DENOISE_METHODS.WINDOW_MEDIAN, windowPadding: 1 })
  const gradient = dropLowerThanBorder(getGradient(denoised, 30))
  const laplace = denoised.applyMask(masks.laplace, { useBorders: true }).map(v => v > 8 ? borders(v * 10) : 0)
  const multiplication = Matricies.multiply(denoised, gradient)
  const masked = Matricies.withMask(denoised, multiplication)

  const jija = toBlackAndWhite(Matricies.add(denoised, masked))

  displayMatrix(original, 'Оригинал')
  displayMatrix(denoised, 'Убрали шум')
  displayMatrix(gradient, 'Градиент')
  displayMatrix(laplace, 'Лапласиан')
  displayMatrix(multiplication, 'Оригинал * Градиент')
  displayMatrix(masked, 'После маски')
  displayMatrix(jija, 'После маски')
  displayMatrix(Matricies.withMask(original, jija), 'После маски')
  // displayMatrix(getGradient(Matricies.add(original, masked)), 'После маски')
}
