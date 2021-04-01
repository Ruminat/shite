export function derivative (arr, dx = 1) {
  const result = [0]
  const multiplier = 1 / dx
  for (let i = 1; i < arr.length; i++) {
    result.push(multiplier * (arr[i] - arr[i - 1]))
  }
  return result
}

export function fourier1DTransform (arr = []) {
  return arr.map((_, k) => fourier1DTransformKthElement(arr, k))
}

function fourier1DTransformKthElement (arr, k) {
  const N = arr.length
  const multiplier = (2 * Math.PI * k) / N

  let re = 0
  let im = 0

  if (typeof arr[0] === 'number') {
    for (let n = 0; n < N; n++) {
      const arg = multiplier * n
      re += arr[n] * Math.cos(arg)
      im += arr[n] * -Math.sin(arg)
    }
  } else {
    for (let n = 0; n < N; n++) {
      const x = arr[n]
      const arg = multiplier * n
      const cos = Math.cos(arg)
      const sin = -Math.sin(arg)

      re += x.re * cos - x.im * sin
      im += x.re * sin + x.im * cos
    }
  }

  return { im, re }
}

export function reverseFourier1DTransform (arr = []) {
  return arr.map((_, k) => reverseFourier1DTransformKthElement(arr, k))
}

function reverseFourier1DTransformKthElement (arr, k) {
  const N = arr.length
  const multiplier = (2 * Math.PI * k) / N

  let re = 0
  let im = 0

  if (typeof arr[0] === 'number') {
    for (let n = 0; n < N; n++) {
      const arg = multiplier * n
      re += arr[n] * Math.cos(arg)
      im += arr[n] * Math.sin(arg)
    }
  } else {
    for (let n = 0; n < N; n++) {
      const x = arr[n]
      const arg = multiplier * n
      const cos = Math.cos(arg)
      const sin = Math.sin(arg)

      re += x.re * cos - x.im * sin
      im += x.re * sin + x.im * cos
    }
  }

  return { im: im / N, re: re / N }
}

export function indexOfMax (arr) {
  return arr.reduce((iMax, x, i) => x > arr[iMax] ? i : iMax, 0)
}
