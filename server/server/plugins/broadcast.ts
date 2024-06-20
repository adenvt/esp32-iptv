import Channels from '~/channels.json'

declare module 'h3' {
  interface H3EventContext {
    $broadcaster: ReturnType<typeof createBroadcaster>,
  }
}

export default defineNitroPlugin((nitro) => {
  const broadcaster = createBroadcaster(Channels, 12, 16_000)

  nitro.hooks.hook('request', (event) => {
    event.context.$broadcaster = broadcaster
  })
})
