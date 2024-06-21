import { sendBroadcast } from '../../utils/broadcast'
import { z } from 'zod'

const paramsSchema = z.object({ channel: z.coerce.number() })

export default defineEventHandler(async (event) => {
  const params = await getValidatedRouterParams(event, paramsSchema.parse)

  return await sendBroadcast(event, params.channel)
})
