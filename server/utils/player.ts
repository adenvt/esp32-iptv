import { Decoder } from './decoder'
import { Video } from './video'
import { Audio } from './audio'
import { milis } from './utils'

export class AviPlayer {
  #canvas: HTMLCanvasElement
  #decoder: Decoder

  #audioStart: number
  #videoStart: number

  #sampleRate: number
  #frameRate: number

  #video: Video
  #audio: Audio

  isPlaying: boolean

  #framePerMs: number
  #samplePerMs: number

  #interval?: ReturnType<typeof setTimeout>
  #stream?: ReadableStreamDefaultReader<Uint8Array>

  constructor (frameRate = 12, sampleRate = 16_000) {
    const canvas = document.createElement('canvas')

    canvas.width  = 320
    canvas.height = 170

    this.#canvas     = canvas
    this.#frameRate  = frameRate
    this.#sampleRate = sampleRate

    this.#framePerMs  = 1000 / this.#frameRate
    this.#samplePerMs = 1000 / this.#sampleRate

    this.#videoStart = 0
    this.#audioStart = 0
    this.isPlaying   = false

    this.#video   = new Video({ canvas: this.#canvas })
    this.#audio   = new Audio({ sampleRate: this.#sampleRate })
    this.#decoder = new Decoder({
      onChunkStart: this.#onChunkStart.bind(this),
      onChunk     : this.#onChunk.bind(this),
    })
  }

  #onChunkStart () {
    this.#videoStart = milis() + (this.#framePerMs / 2)
    this.#audioStart = milis()
  }

  #onChunk (type: string, _size: number, data: Uint8Array) {
    if (type.endsWith('dc')) {
      const duration = Math.round(this.#framePerMs)
      const start    = this.#videoStart
      const end      = start + duration

      this.#video.feed(data, start, end)

      this.#videoStart = Math.max(milis(), end)
    }

    if (type.endsWith('wb')) {
      const duration = Math.round(this.#samplePerMs * data.byteLength)
      const start    = this.#audioStart
      const end      = start + duration

      this.#audio.feed(data, start, end)

      this.#audioStart = Math.max(milis(), end)
    }
  }

  #loop () {
    if (!this.isBusy)
      this.#loadStream()

    this.#audio.loop()
    this.#video.loop()

    this.#interval = setTimeout(this.#loop.bind(this), 0)
  }

  #feed (data: Uint8Array) {
    this.#decoder.feed(data)
  }

  get isBusy () {
    return this.#audio.queue.isFull || this.#video.queue.isFull
  }

  #loadStream () {
    if (this.#stream) {
      void this.#stream.read()
        .then(({ value }) => {
          if (value)
            this.#feed(value)
        })
        .catch((error: Error) => {
          console.warn(error)
        })
    }
  }

  stop () {
    if (this.isPlaying) {
      if (this.#interval)
        clearTimeout(this.#interval)

      this.#video.stop()
      this.#audio.stop()

      this.#stream   = undefined
      this.#interval = undefined
      this.isPlaying = false
    }
  }

  start () {
    if (!this.isPlaying) {
      this.#decoder.start()
      this.#video.start()
      this.#audio.start()

      this.#loop()

      this.isPlaying = true
    }
  }

  openStream (stream: ReadableStreamDefaultReader<Uint8Array>) {
    this.#stream = stream

    this.start()
  }

  mount (selector: string) {
    document.querySelector(selector)?.append(this.#canvas)
  }
}
