interface QueueItem<T> {
  value: T,
  next?: QueueItem<T>,
}

export class Queue<T> {
  #head?: QueueItem<T>
  #tail?: QueueItem<T>

  count: number
  capacity: number

  constructor (capacity = 5) {
    this.capacity = capacity
    this.count    = 0
  }

  get current () {
    return this.#head?.value
  }

  add (value: T) {
    const node: QueueItem<T> = { value: value }

    if (!this.#head) {
      this.#head = node
      this.#tail = node
    } else if (this.#tail) {
      this.#tail.next = node
      this.#tail      = this.#tail.next
    }

    this.count++
  }

  next () {
    if (this.#head) {
      this.#head = this.#head.next

      this.count--
    }
  }

  clear () {
    this.#head = undefined
    this.#tail = undefined
    this.count = 0
  }

  get isFull () {
    return this.count >= this.capacity
  }
}
