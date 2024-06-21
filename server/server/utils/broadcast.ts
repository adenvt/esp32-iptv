import FFmpeg from 'fluent-ffmpeg'
import type { H3Event } from 'h3'
import { sendStream, setResponseHeader } from 'h3'
import { Writable } from 'node:stream'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { getStream } from './youtube'

export interface BroadcastClient {
  isStart: boolean,
  controller: ReadableStreamDefaultController<Buffer>,
}

export interface BroadcastChannel {
  source: ChildProcessWithoutNullStreams | string,
  decoder: FFmpeg.FfmpegCommand,
  sender: Writable,
  clients: Map<H3Event, BroadcastClient>,
}

export interface BroadcastChannelMeta {
  /**
   * Channel name
   */
  name: string,
  /**
   * Target url
   */
  url: string,
  /**
   * FFMPEG additional options
   */
  options: string[],
}

const AVI_HEADER = Buffer.from([
  /* eslint-disable array-element-newline */
  0x4C, 0x49, 0x53, 0x54, // 'LIST'
  0xFF, 0xFF, 0xFF, 0xFF, // [size]
  0x6D, 0x6F, 0x76, 0x69, // 'movi'
  /* eslint-enable array-element-newline */
])

export function createBroadcaster (servers: BroadcastChannelMeta[], frameRate: number, sampleRate: number) {
  const channels = new Map<number, BroadcastChannel>()

  function startChannel (channelNum: number) {
    const clients = new Map<H3Event, BroadcastClient>()
    const server  = servers[channelNum]
    const sender  = new Writable({
      write (chunk: Buffer, encoding, next) {
        for (const client of clients.values()) {
          if (client.isStart)
            client.controller.enqueue(chunk)
          else {
            const i = chunk.findIndex((c, i) => {
              if (i > chunk.length - 5)
                return false

              return chunk.subarray(i, i + 4)
                .toString()
                .endsWith('dc')
            })

            if (i > -1) {
              client.controller.enqueue(AVI_HEADER)
              client.controller.enqueue(chunk.subarray(i))

              client.isStart = true
            }
          }
        }

        next()
      },
    })

    const source  = server.url.includes('youtube') ? getStream(server.url) : server.url
    const decoder = FFmpeg(typeof source === 'string' ? source : source.stdout)
      .withOption([
        '-preset',
        'veryfast',
        '-sws_flags',
        'lanczos',
        ...server.options,
      ])
      .withVideoCodec('mjpeg')
      .withSize('320x170')
      .withFpsOutput(frameRate)
      .autopad()
      .withAudioCodec('pcm_u8')
      .withAudioFrequency(sampleRate)
      .withAudioChannels(1)
      .withOutputFormat('avi')
      .on('error', (error) => {
        console.error(error)
      })

    decoder
      .pipe(sender)

    const channel: BroadcastChannel = {
      source,
      clients,
      sender,
      decoder,
    }

    channels.set(channelNum, channel)

    return channel
  }

  function stopChannel (channelNum: number) {
    const channel = channels.get(channelNum)

    if (channel) {
      channel.decoder.kill('SIGKILL')

      if (typeof channel.source !== 'string')
        channel.source.kill('SIGKILL')

      channels.delete(channelNum)
    }
  }

  async function sendBroadcast (event: H3Event, channelNum = 0) {
    setResponseHeader(event, 'Content-Type', 'video/x-msvideo')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Transfer-Encoding', 'chunked')
    setResponseHeader(event, 'Keep-Alive', 'timeout=5, max=1')

    if (!servers[channelNum]) {
      setResponseStatus(event, 404)

      return {
        code   : 404,
        message: 'Not Found',
      }
    }

    const channel = channels.get(channelNum) ?? startChannel(channelNum)
    const stream  = new ReadableStream<Buffer>({
      start (controller) {
        channel.clients.set(event, { isStart: false, controller })
      },
      cancel () {
        channel.clients.delete(event)

        if (channel.clients.size === 0)
          stopChannel(channelNum)
      },
    })

    return await sendStream(event, stream)
  }

  return { sendBroadcast }
}

export async function sendBroadcast (event: H3Event, channelNum = 0) {
  return await event.context.$broadcaster.sendBroadcast(event, channelNum)
}
