const fs = require('fs')
const fsPromises = fs.promises

export async function readFileFloat32 (filename) {
  const buffer = await fsPromises.readFile(filename)
  const result = []
  for (let i = 0; i < buffer.length; i += 4) {
    result.push(buffer.readFloatLE(i));
  }
  return result
}

export async function readXcr (filename) {
  const buffer = await fsPromises.readFile(filename)

  const headerLength = 2048
  const tailLength = 8192
  const header = []
  const data = []
  const tail = []

  for (let i = 0; i < headerLength; i += 2) {
    header.push(buffer.readUInt16BE(i));
  }
  for (let i = headerLength; i < buffer.length - tailLength; i += 2) {
    data.push(buffer.readUInt16BE(i));
  }
  for (let i = buffer.length - tailLength; i < buffer.length; i += 2) {
    tail.push(buffer.readUInt16BE(i));
  }

  return { header, data, tail }
}
