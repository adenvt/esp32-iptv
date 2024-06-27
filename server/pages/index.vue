
<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-300 to-95% to-red-400 text-gray-900 space-y-4 overflow-hidden">
    <h1 class="text-4xl font-bold">
      ESP32 IPTV
    </h1>
    <div class="w-[711px] h-[283px] bg-[url('/t-embed.png')] drop-shadow-2xl relative self-start md:self-auto translate-x-[calc(-125px_+_2.5rem)] md:translate-x-0">
      <div
        id="player"
        class="w-[320px] h-[170px] absolute left-[125px] top-[55px]" />

      <div class="absolute top-[240px] left-[125px] w-[320px] h-[20px] flex justify-center items-center md:hidden space-x-1">
        <button
          class="w-[50px] h-full hover:text-gray-900/90 text-gray-900 flex items-center justify-center hover:bg-gray-900/20 rounded-lg"
          @click="changeChannel(-1)">
          <span class="material-symbols-rounded">
            skip_previous
          </span>
        </button>
        <button
          class="w-[50px] h-full hover:text-gray-900/90 text-gray-900 flex items-center justify-center hover:bg-gray-900/20 rounded-lg"
          @click="handleClickPlay">
          <span class="material-symbols-rounded">
            {{ isStarted ? 'stop' : 'play_arrow' }}
          </span>
        </button>
        <button
          class="w-[50px] h-full hover:text-gray-900/90 text-gray-900 flex items-center justify-center hover:bg-gray-900/20 rounded-lg"
          @click="changeChannel(1)">
          <span class="material-symbols-rounded">
            skip_next
          </span>
        </button>
      </div>
      <div class="absolute w-[202px] h-[202px] top-[38px] left-[471px] hidden md:flex flex-1 items-center justify-center rounded-full">
        <button
          class="w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
          @click="changeChannel(-1)">
          <span class="material-symbols-rounded text-[30px]">
            skip_previous
          </span>
        </button>
        <button
          class="w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
          @click="handleClickPlay">
          <span class="material-symbols-rounded text-[45px]">
            {{ isStarted ? 'stop' : 'play_arrow' }}
          </span>
        </button>
        <button
          class="w-[50px] h-[50px] rounded-full hover:text-white/90 text-white flex items-center justify-center hover:bg-white/20"
          @click="changeChannel(1)">
          <span class="material-symbols-rounded text-[30px]">
            skip_next
          </span>
        </button>
      </div>
    </div>
    <a
      class="underline decoration-dashed hover:decoration-solid"
      href="https://github.com/adenvt/esp32-iptv"
      target="_blank">
      See source code on Github</a>
  </div>
</template>

<script lang="ts" setup>
import type { Streamer } from '~/utils/streamer'
import type { AviPlayer } from '~/utils/player'

const router = useRouter()
const route  = useRoute()

const isStarted = ref(false)
const player    = shallowRef<AviPlayer>()
const streamer  = shallowRef<Streamer>()

const channels = ref<Array<{ name: string }>>([])
const channel  = computed({
  get () {
    return Number.parseInt(route.query.channel as string) || 0
  },
  set (channel: number) {
    router.replace({ query: { channel } })
  },
})

async function init () {
  const { Streamer }  = await import('~/utils/streamer')
  const { AviPlayer } = await import('~/utils/player')

  player.value   = new AviPlayer()
  streamer.value = new Streamer(`/api/stream/${channel.value}`, {
    onConnected () {
      const stream = streamer.value?.getReader()

      if (stream)
        player.value?.openStream(stream)
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
