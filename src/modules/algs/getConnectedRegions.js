import { clamp } from '../utils.js'
import { ELEMENT_ONE, ELEMENT_ZERO, Point } from '../definitions.js'

let maxLogs = 100

export const getConnectedRegionsMethods = {
  SQUARE: 'square',
  CIRCLE: 'circle',
}

export function getConnectedRegions(matrix, bordersMatrix, maxSize, method = getConnectedRegionsMethods.CIRCLE) {
  const { rows, columns } = matrix
  const copy = matrix.copy()
  const resultMatrix = matrix.copy().map(v => ELEMENT_ZERO)
  let counter = 0

  for (const { row, column } of copy.matrixIterator()) {
    const point = new Point({ row, column })

    if (copy.getPoint(point) === ELEMENT_ZERO || bordersMatrix.getPoint(point) !== ELEMENT_ZERO) {
      continue
    }

    const regionPoints = []

    goThroughPoint(regionPoints, point)


    if (method === getConnectedRegionsMethods.SQUARE) {
      const { minX, minY, maxX, maxY } = getBoundaries(regionPoints)
      if (maxX - minX + 1 === maxSize && maxY - minY + 1 === maxSize) {
        addRegion(regionPoints)
        counter++
      }
    } else {
      if (getMaxDistance(regionPoints) + 1 === maxSize) {
        addRegion(regionPoints)
        counter++
      }
    }

  }

  console.log("Было найдено", counter, "камней")
  return resultMatrix

  function addRegion (regionPoints) {
    for (const point of regionPoints) {
      resultMatrix.matrix[point.row][point.column] = ELEMENT_ONE
    }
  }

  function goThroughPoint (regionPoints, point) {
    const pointsToGoThrough = []

    addPointToRegion(regionPoints, point)
    removePointFromCopy(point)
    for (const neighbour of getNeighbours(point)) {
      if (isPointInRegion(regionPoints, neighbour)) continue

      // if (maxLogs--) {
      //   console.log("SAS", { inCopy: copy.getPoint(neighbour) !== ELEMENT_ZERO, inBorders: bordersMatrix.getPoint(neighbour) !== ELEMENT_ZERO })
      // }

      if (copy.getPoint(neighbour) !== ELEMENT_ONE && copy.getPoint(neighbour) !== ELEMENT_ZERO) {
        console.log("ПИЗДА");
      }
      if (bordersMatrix.getPoint(neighbour) !== ELEMENT_ONE && bordersMatrix.getPoint(neighbour) !== ELEMENT_ZERO) {
        console.log("ПИЗДА");
      }

      // console.log("SUKA");

      // if (copy.getPoint(neighbour) === ELEMENT_ONE && bordersMatrix.getPoint(neighbour) !== ELEMENT_ONE) {
      //   console.log("HOBA");
      // }

      if (copy.getPoint(neighbour) === ELEMENT_ONE) {
        if (bordersMatrix.getPoint(neighbour) === ELEMENT_ZERO) {
          pointsToGoThrough.push(neighbour)
        } else {
          addPointToRegion(regionPoints, neighbour)
        }
      } else if (bordersMatrix.getPoint(neighbour) !== ELEMENT_ZERO) {
        addPointToRegion(regionPoints, neighbour)
      }
    }

    // console.log("LETS GO", pointsToGoThrough.length);

    for (const pointToGoThrough of pointsToGoThrough) {
      goThroughPoint(regionPoints, pointToGoThrough)
    }
  }

  function isPointInRegion (regionPoints, point) {
    if (regionPoints.some(regionPoint => regionPoint.isEqual(point))) {
      return true
    } else {
      return false
    }
  }

  function addPointToRegion (regionPoints, point) {
    regionPoints.push(point)
  }

  function removePointFromCopy (point) {
    copy.matrix[point.row][point.column] = ELEMENT_ZERO
  }

  function* getNeighbours (point) {
    for (let row = clamp(point.row - 1, 0, rows); row <= clamp(point.row + 1, 0, rows - 1); row++) {
      for (let column = clamp(point.column - 1, 0, columns); column <= clamp(point.column + 1, 0, columns - 1); column++) {
        if (row === point.row && column === point.column) continue
        yield new Point({ row, column })
      }
    }
  }

  function getBoundaries (points) {
    return points.reduce((acc, curr) => {
      return {
        minX: curr.x < acc.minX ? curr.x : acc.minX,
        minY: curr.y < acc.minY ? curr.y : acc.minY,
        maxX: curr.x > acc.maxX ? curr.x : acc.maxX,
        maxY: curr.y > acc.maxY ? curr.y : acc.maxY
      }
    }, { minX: +Infinity, minY: +Infinity, maxX: -Infinity, maxY: -Infinity })
  }

  function getMaxDistance (points) {
    let maxDistance = -Infinity
    for (const pointA of points) {
      for (const pointB of points) {
        const distance = pointA.distanceTo(pointB)
        if (distance > maxDistance) maxDistance = distance
      }
    }
    return maxDistance
  }
}
