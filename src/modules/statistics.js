
/*
  Файл statistics.js:
  функции рандома, нахождение статистик данных.
*/

// Создаёт массив [fn(0), fn(1), ..., fn(length - 1)].
const genArray = (length, fn) => Array.from({ length }, (_, i) => fn(i))

// Возвращает дробную часть числа.
function fractionalPart (num) {
  const abs = Math.abs(num)
  const sign = Math.sign(num)
  return sign * (abs - Math.trunc(abs))
}

// Функции статистических характеристик.
export const min = arr => arr.reduce((p, v) => p < v ? p : v)
export const max = arr => arr.reduce((p, v) => p > v ? p : v)
export const sum = arr => arr.reduce((a, b) => a + b)
export const average = arr => sum(arr) / arr.length
export const variance = arr => {
  const avg = average(arr)
  return (1 / arr.length) * arr.reduce((a, b) => a + (b - avg)**2, 0)
}
export const std = arr => Math.sqrt(variance(arr))
export const avgSquare = arr => arr.reduce((a, b) => a + b**2, 0)
export const asymmetry = arr => {
  const avg = average(arr)
  return arr.reduce((a, b) => a + (b - avg)**3)
}
export const asymmetryK = arr => asymmetry(arr) / std(arr)**3
export const excess = arr => {
  const avg = average(arr)
  return arr.reduce((a, b) => a + (b - avg)**4)
}
export const excessK = arr => asymmetry(arr) / std(arr)**4 - 3

// Возвращает объект со статистиками переданного массива.
export const getStatistics = arr => ({
  min: min(arr),
  max: max(arr),
  sum: sum(arr),
  avg: average(arr),
  variance: variance(arr),
  std: std(arr),
  avgSquare: avgSquare(arr),
  asymmetry: asymmetry(arr),
  asymmetryK: asymmetryK(arr),
  excess: excess(arr),
  excessK: excessK(arr)
})
// Возвращает TeX-строку для каждой статистики (нужно для красивого вывода).
export const statisticsTeX = {
  min: "\\min",
  max: "\\max",
  sum: "\\sum",
  avg: "\\mu",
  variance: "\\sigma^2",
  std: "\\sigma",
  avgSquare: "\\theta^2",
  asymmetry: "\\mu_3",
  asymmetryK: "\\gamma_1",
  excess: "\\mu_4",
  excessK: "\\gamma_2"
}

// Разбивает массив на n частей.
export function splitIntoParts (array, n) {
  const [...arr] = array
  const result = []
  const l = Math.ceil(arr.length / n)
  while (arr.length)
    result.push(arr.splice(0, l))
  return result
}

// Вспомогательные функции для рандома.
const crazy = x => Math.sin(x + Math.cos(x*x) + Math.sin(4*x))
const smash = x => crazy(1 + 4*crazy(1 + x)) - 8*crazy(2*x)
const getSign = x => x % 2 === 0 ? -1 : 1

let calls = 0 // Количество вызовов рандома.
// Своя функция рандома.
export function random (from = 0, to = 1) {
  const ms = Number(new Date())
  const m = smash(ms)
  const c = smash(calls++)
  return from + (to - from) * (fractionalPart((m + c)) + 1) / 2
}
// Встроенный рандом.
export function randomJS (from = 0, to = 1) {
  return from + (to - from)*Math.random()
}
// Своя функция рандома (возвращает целое число).
export function randomInt (from = 0, to = 1) {
  return Math.round(random(from - 0.5, to + 0.5))
}
// Встроенная функция рандома (возвращает целое число).
export function randomIntJS (from = 0, to = 1) {
  return Math.round((from - 0.5) + (to - from + 1) * Math.random())
}
