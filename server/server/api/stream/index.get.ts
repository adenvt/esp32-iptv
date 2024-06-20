import Servers from '~/channels.json'

export default defineEventHandler(() => {
  return {
    code   : 200,
    message: 'Ok',
    data   : Servers.map((s) => {
      return s.name
    }),
  }
})
