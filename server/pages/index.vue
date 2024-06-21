
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-300 to-95% to-red-400 text-gray-800">
    <h1 class="text-4xl font-bold mb-7">
      ESP32 IPTV
    </h1>
    <div class="w-[711px] h-[283px] pl-[125px] pt-[55px] bg-[url('/t-embed.png')] drop-shadow-2xl relative">
      <div
        id="player"
        class="w-[320px] h-[170px]" />
      <button
        class="absolute top-[114px] right-[114px] w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
        @click="handleClickPlay">
        <span class="material-symbols-rounded text-[45px]">
          {{ isStarted ? 'stop' : 'play_arrow' }}
        </span>
      </button>
      <button
        class="absolute top-[114px] right-[64px] w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
        @click="changeChannel(1)">
        <span class="material-symbols-rounded text-[30px]">
          skip_next
        </span>
      </button>
      <button
        class="absolute top-[114px] right-[164px] w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
        @click="changeChannel(-1)">
        <span class="material-symbols-rounded text-[30px]">
          skip_previous
        </span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Streamer } from '~/utils/streamer'
import { AviPlayer } from '~/utils/player'

const isStarted = ref(false)
const player    = shallowRef<AviPlayer>()
const streamer  = shallowRef<Streamer>()

const channel  = ref(0)
const channels = ref<Array<{ name: string }>>([])

function init () {
  player.value   = new AviPlayer()
  streamer.value = new Streamer(`/api/stream/${channel.value}`, {
    onConnected () {
      player.value?.start()
    },
    onChunk (chunk) {
      player.value?.feed(chunk)
    },
    onDisconnected () {
      player.value?.stop()
    },
  })

  player.value.mount('#player')
}

async function load () {
  const response = await fetch('/api/stream')
  const body     = await response.json()

  channels.value = body.data
}

function changeChannel (inc: number) {
  channel.value = (channel.value + inc + channels.value.length) % channels.value.length
}

function handleClickPlay () {
  if (isStarted.value) {
    isStarted.value = false

    streamer.value?.stop()
  } else {
    isStarted.value = true

    streamer.value?.start()
  }
}

watch(channel, (value) => {
  if (streamer.value) {
    streamer.value.stop()
    streamer.value.setUrl(`/api/stream/${value}`)

    if (isStarted.value)
      streamer.value.start()
  }
})

onMounted(() => {
  init()
  load()
})

onBeforeMount(() => {
  player.value?.stop()
  streamer.value?.stop()
})
</script>

<style>
.material-symbols-rounded {
  font-variation-settings:
  'FILL' 1,
  'wght' 400,
  'GRAD' 0,
  'opsz' 24
}
</style>
