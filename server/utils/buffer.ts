import { toString } from './utils'

export class MutableBuffer {
  data: Uint8Array

  constructor (data = new Uint8Array()) {
    this.data = data
  }

  feed (data: Uint8Array) {
    const temp = new Uint8Array(this.data.length + data.length)

    temp.set(this.data, 0)
    temp.set(data, this.data.length)

    this.data = temp
  }

  peek (size: number, offset = 0) {
    return this.data.subarray(offset, offset + size)
  }

  take (size: number, offset = 0) {
    const data = this.peek(size, offset)

    this.skip(offset + size)

    return data
  }

  skip (size: number) {
    this.data = this.data.subarray(size)
  }

  find (keyword: string) {
    const index = this.data.findIndex((_, i) => {
      return toString(this.data.subarray(i, i + keyword.length)) === keyword
    })

    if (index > -1) {
      this.take(index)

      return true
    }

    this.clear()

    return false
  }

  clear () {
    this.data = new Uint8Array()
  }

  get left () {
    return this.data.byteLength
  }
}
