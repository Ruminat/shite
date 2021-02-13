// Spectrum
await this.addPlots([spectrumPlotData({ arr: ysSinRnd, ns: ls, step: dt, title: 'SinRndSpectrum' })])
// Sin
const s = spikes({ ys: ysSin, multiplier: 2*to, N: 30 })
const as = antispike(s, to)
await this.addPlots([
  { xs: xs, ys: ysSin, title: 'Sin' },
  { xs: xs, ys: ysSinRnd, title: 'Sin-random' },
  { xs: xs, ys: s, title: 'Spikes' },
  { xs: xs, ys: as, title: 'Antispike' },
  { xs: xs, ys: shift(1000, ysJS), title: 'Shift' },
  { xs: xs, ys: antishift(shift(1000, ysJS)), title: 'Antishift' },
])
console.log('Sin')
// Random correlation
await this.addPlots([
  { xs: ls, ys: ls.map(l => autoCorrelation(l, ysSinRnd)), title: 'Sin-random autocorrelation' },
  { xs: ls, ys: ls.map(l => mutualCorrelation(l, ysMy, ysJS)), title: 'Mutual random' },
])
await this.addPlots([
  { xs: ls, ys: ls.map(l => autoCorrelation(l, ysMy)), title: 'My random correlation' },
  { xs: ls, ys: ls.map(l => autoCorrelation(l, ysJS)), title: 'JS random correlation' }
])
console.log('Correlation')
// Random bar plots
barPlot({ id: 'myRandomChart', ys: ysMy, from, to, title: 'My random distribution', bars: 10 })
barPlot({ id: 'jsRandomChart', ys: ysJS, from, to, title: 'JS random distribution', bars: 10 })
console.log('Bar plots')

// Random plots
// Plotly.newPlot('myRandomPlot', [{ x: xs, y: ysMy }], { ...layout, title: 'My random' })
// Plotly.newPlot('jsRandomPlot', [{ x: xs, y: ysJS }], { ...layout, title: 'JS random' })
// console.log('Random plots')

// this.stat = getStatistics(ysMy)
// this.stat2 = getStatistics(ysJS)

// console.log('\n  STATISTICS  \n')

// console.log('my random', getStatistics(ysMy))
// console.log('js random', getStatistics(ysJS))

// console.log('\n  DIFFERENCES  \n')

// console.log('my random', getDifferences(ysMy))
// console.log('js random', getDifferences(ysJS))
// console.log('stats data is ready')