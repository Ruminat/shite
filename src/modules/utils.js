export const delay = ms => new Promise(resolve => global.setTimeout(resolve, ms))

export async function until (fn, { waitMs = 40, tries = Infinity } = {}) {
  for (const i of range()) {
    if (await fn()) return true
    if (tries-- === 0) return false
    await delay(waitMs)
  }
}

export async function fetchWithTimeout (url, ms, { ...options } = {}) {
  const controller = new AbortController()
  delay(ms).then(_ => {
    try { controller.abort() } catch (_) {}
  })
  return fetch(url, { signal: controller.signal, ...options })
}

export const genArray = (length, fn) => Array.from({ length }, (_, i) => fn(i))

export const capitalize = str => !str ? str : str[0].toUpperCase() + str.substr(1)

export const tryExpr = (fn, defaultValue = null) => {
  try {
    return fn()
  } catch (_) {
    return defaultValue
  }
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })
export function naturalSort (arr) {
  arr.sort(collator.compare)
}

export function* range (from = 1, to = Infinity, step = 1) {
  for (let i = from; i <= to; i += step)
    yield i
}

export function shuffle (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;([arr[i], arr[j]] = [arr[j], arr[i]])
  }
  return arr
}

let counterValue = 1
export function commonCounter () {
  return counterValue++
}

export function borders (value, from = 0, to = 255) {
  return value > to
    ? to
    : value < from ? from : value;
}
