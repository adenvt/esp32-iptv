import { Queue } from './queue'
import { milis } from './utils'

export interface AudioOption {
  sampleRate: number,
}

export class Audio {
  options: AudioOption

  #ctx: AudioContext
  #gainNode: GainNode
  #smoother: number

  #starttTime: number
  queue: Queue<{
    data: Uint8Array,
    start: number,
    end: number,
  }>

  constructor (options: AudioOption) {
    this.options     = options
    this.#ctx        = new AudioContext()
    this.#gainNode   = this.#ctx.createGain()
    this.#starttTime = this.#ctx.currentTime
    this.#smoother   = 25
    this.queue       = new Queue(12)

    this.#gainNode.gain.value = 1
    this.#gainNode.connect(this.#ctx.destination)
  }

  #draw (data: Uint8Array) {
    const source     = this.#ctx.createBufferSource()
    const buffer     = this.#ctx.createBuffer(1, data.length, this.options.sampleRate)
    const bufferData = buffer.getChannelData(0)

    source.buffer = buffer

    for (let i = 0; i < data.length; i++) {
      bufferData[i] = (data[i] - 128) / 128

      // Add smoother for reducing noice
      if (i < this.#smoother)
        bufferData[i] = (bufferData[i] * i) / this.#smoother

      if (i > data.length - (this.#smoother + 1))
        bufferData[i] = (bufferData[i] * (bufferData.length - (i + 1))) / this.#smoother
      // End
    }

    this.#starttTime = Math.max(this.#starttTime, this.#ctx.currentTime)

    source.connect(this.#gainNode)
    source.start(this.#starttTime)

    this.#starttTime += buffer.duration
  }

  feed (data: Uint8Array, start: number, end: number) {
    this.queue.add({
      data, start, end,
    })
  }

  loop () {
    const sample = this.queue.current

    if (sample) {
      if (milis() < sample.start)
        return

      if (milis() < sample.end)
        this.#draw(sample.data)

      this.queue.next()
    }
  }

  start () {
    this.#starttTime = this.#ctx.currentTime

    void this.#ctx.resume()

    this.queue.clear()
  }

  stop () {
    void this.#ctx.suspend()
  }
}
