import { sendBroadcast } from '../../utils/broadcast'

export default defineEventHandler(async (event) => {
  appendCorsHeaders(event, { origin: '*' })

  const channel = Number.parseInt(getRouterParam(event, 'channel') as string)

  if (!Number.isFinite(channel)) {
    setResponseStatus(event, 404)

    return {
      code   : 404,
      message: 'Not Found',
    }
  }

  return await sendBroadcast(event, channel)
})
