import { MutableBuffer } from './buffer'
import { readUint32LE, toString } from './utils'

export interface DecoderOptions {
  onChunk: (type: string, size: number, data: Uint8Array, header?: Uint8Array) => void,
  onChunkStart?: () => void,
  onChunkEnd?: () => void,
}

export class Decoder {
  options: DecoderOptions
  buffer: MutableBuffer

  #remainingMovi: number

  constructor (options: DecoderOptions) {
    this.options = options
    this.buffer  = new MutableBuffer()

    this.#remainingMovi = 0
  }

  feed (data: Uint8Array) {
    this.buffer.feed(data)

    if (this.#remainingMovi > 0 || this.#remainingMovi === -1)
      this.#findStream()

    if (this.#remainingMovi <= 0)
      this.#findMovi()
  }

  #findMovi () {
    // eslint-disable-next-line unicorn/prefer-array-some
    while (this.buffer.find('LIST') && this.buffer.left > 12) {
      this.buffer.skip(4)

      const size = readUint32LE(this.buffer.take(4))
      const type = toString(this.buffer.take(4))

      if (type === 'movi') {
        this.#remainingMovi = size

        this.options.onChunkStart?.()

        return this.#findStream()
      }
    }
  }

  #findStream () {
    while (this.buffer.left > 8) {
      const type      = toString(this.buffer.peek(4))
      const size      = readUint32LE(this.buffer.peek(4, 4))
      const totalSize = 8 + size + (size % 2) // headerSize + chunkSize + padding

      if (this.buffer.left < totalSize)
        break

      const header = this.buffer.take(8)
      const data   = this.buffer.take(size)

      this.options.onChunk(type, size, data, header)

      if (size % 2)
        this.buffer.take(1)

      this.#remainingMovi -= totalSize

      if (this.#remainingMovi <= 0)
        return this.options.onChunkEnd?.()
    }
  }

  start () {
    this.#remainingMovi = 0

    this.buffer.clear()
  }
}
