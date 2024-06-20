import { AviPlayer } from './player'
import { Streamer } from './streamer'

const button = document.querySelector('#play')

const URL      = 'http://localhost:8080/broadcast'
const player   = new AviPlayer()
const streamer = new Streamer(URL, {
  onConnected () {
    player.start()
  },
  onChunk (chunk) {
    player.feed(chunk)
  },
})

button?.addEventListener('click', () => {
  if (player.isPlaying) {
    streamer.stop()
    player.stop()

    button.textContent = 'Start'
  } else {
    streamer.start()

    button.textContent = 'Stop'
  }
})

player.mount('#app')
