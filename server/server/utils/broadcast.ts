/* eslint-disable @typescript-eslint/promise-function-async */
import type { H3Event } from 'h3'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import { setResponseHeader, createError } from 'h3'
import FFmpeg from 'fluent-ffmpeg'
import { Writable } from 'node:stream'
import { getStream } from './youtube'

export interface BroadcastClient {
  isStart: boolean,
  response: H3Event['node']['res'],
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

function isFFMpegCancel (error: unknown): error is Error {
  return error instanceof Error
    && error.message === 'ffmpeg was killed with signal SIGKILL'
}

export function createBroadcaster (servers: BroadcastChannelMeta[], frameRate: number, sampleRate: number) {
  const channels = new Map<number, BroadcastChannel>()

  function startChannel (channelNum: number) {
    const clients = new Map<H3Event, BroadcastClient>()
    const server  = servers[channelNum]
    const sender  = new Writable({
      write (chunk: Buffer, encoding, next) {
        for (const client of clients.values()) {
          if (client.isStart || clients.size === 1)
            client.response.write(chunk)
          else {
            const i = chunk.findIndex((c, i) => {
              if (i > chunk.length - 5)
                return false

              return chunk.subarray(i, i + 4)
                .toString()
                .endsWith('dc')
            })

            if (i > -1) {
              client.response.write(AVI_HEADER)
              client.response.write(chunk.subarray(i))

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

      channel.sender.end()

      channels.delete(channelNum)
    }
  }

  function validateBroadcast (event: H3Event, channelNum = 0) {
    if (!servers[channelNum]) {
      throw createError({
        statusCode   : 404,
        statusMessage: 'Not Found',
      })
    }
  }

  function sendBroadcast (event: H3Event, channelNum = 0) {
    validateBroadcast(event, channelNum)

    setResponseHeader(event, 'Content-Type', 'application/octet-stream')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    setResponseHeader(event, 'Transfer-Encoding', 'chunked')

    return new Promise<void>((resolve, reject) => {
      const channel = channels.get(channelNum) ?? startChannel(channelNum)

      channel.clients.set(event, { isStart: false, response: event.node.res })

      channel.decoder.once('error', (error: Error) => {
        if (!isFFMpegCancel(error))
          console.error(error)

        reject(error)
      })

      event.node.res.once('close', () => {
        channel.clients.delete(event)

        if (channel.clients.size === 0)
          stopChannel(channelNum)

        resolve()
      })
    })
  }

  return { sendBroadcast }
}

export function sendBroadcast (event: H3Event, channelNum = 0) {
  return event.context.$broadcaster.sendBroadcast(event, channelNum)
}
