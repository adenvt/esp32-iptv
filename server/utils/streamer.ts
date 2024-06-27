export interface StreamerOptions {
  onConnected?: () => void,
  onDisconnected?: () => void,
}

export class Streamer {
  options: StreamerOptions

  #url: string
  #cancel?: AbortController
  #reader?: ReadableStreamDefaultReader<Uint8Array>

  #retry = 0

  constructor (url: string, options: StreamerOptions) {
    this.options = options
    this.#url    = url
  }

  setUrl (url: string) {
    this.#url = url
  }

  getReader () {
    return this.#reader
  }

  start () {
    this.#cancel = new AbortController()

    fetch(this.#url, { signal: this.#cancel.signal })
      .then((response) => {
        if (response.ok && response.body) {
          this.#retry  = 0
          this.#reader = response.body.getReader()

          this.options.onConnected?.()
        }
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') {
          console.error(error)

          if (this.#retry < 3)
            setTimeout(this.start, 1000 * ++this.#retry)
        }
      })
  }

  stop () {
    if (this.#cancel)
      this.#cancel.abort()

    this.#cancel = undefined
    this.#reader = undefined

    this.options.onDisconnected?.()
  }
}
