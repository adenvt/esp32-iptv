/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { milis, toBase64 } from './utils'
import { Queue } from './queue'

export interface VideoOption {
  canvas: HTMLCanvasElement,
}

export class Video {
  options: VideoOption

  #ctx: CanvasRenderingContext2D
  #image: HTMLImageElement

  #queue: Queue<{
    data: Uint8Array,
    start: number,
    end: number,
  }>

  constructor (options: VideoOption) {
    this.options = options
    this.#ctx    = options.canvas.getContext('2d')!
    this.#image  = new Image(this.#ctx.canvas.width, this.#ctx.canvas.height)
    this.#queue  = new Queue()

    this.#image.addEventListener('load', this.#onLoadImage.bind(this), { passive: true })

    this.clear()
  }

  clear () {
    this.#ctx.fillRect(0, 0, this.#ctx.canvas.width, this.#ctx.canvas.height)
  }

  #onLoadImage () {
    this.#ctx.drawImage(this.#image, 0, 0)
  }

  #draw (data: Uint8Array) {
    this.#image.src = `data:image/jpg;base64,${toBase64(data)}`
  }

  feed (data: Uint8Array, start: number, end: number) {
    this.#queue.add({
      data, start, end,
    })
  }

  loop () {
    const frame = this.#queue.current

    if (frame) {
      if (milis() < frame.start)
        return

      if (milis() < frame.end)
        this.#draw(frame.data)

      this.#queue.next()
    }
  }

  start () {
    this.#queue.clear()
  }

  stop () {
    this.clear()
  }
}
