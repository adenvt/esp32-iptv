export interface StreamerOptions {
  onConnected?: () => void,
  onChunk: (chunk: Uint8Array) => void,
  onDisconnected?: () => void,
}

export class Streamer {
  options: StreamerOptions

  #url: string
  #cancel?: AbortController
  #reader?: ReadableStreamDefaultReader<Uint8Array>

  constructor (url: string, options: StreamerOptions) {
    this.options = options
    this.#url    = url
  }

  #loop () {
    if (this.#reader) {
      this.#reader.read()
        .then(({ done, value }) => {
          if (value)
            this.options.onChunk(value)

          if (!done)
            this.#loop()
        })
        .catch((error: Error) => {
          if (error.name !== 'AbortError')
            console.error(error)
        })
    }
  }

  setUrl (url: string) {
    this.#url = url
  }

  start () {
    this.#cancel = new AbortController()

    fetch(this.#url, { signal: this.#cancel.signal })
      .then((response) => {
        if (response.ok && response.body) {
          this.#reader = response.body.getReader()

          this.options.onConnected?.()

          this.#loop()
        }
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError')
          console.error(error)
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
