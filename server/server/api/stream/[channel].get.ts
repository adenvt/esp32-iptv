import { sendBroadcast } from '../../utils/broadcast'

export default defineEventHandler(async (event) => {
  const channel = getRouterParam(event, 'channel')

  return await sendBroadcast(event, Number.parseInt(channel ?? ''))
})
