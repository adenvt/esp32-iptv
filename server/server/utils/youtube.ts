import { spawn } from 'node:child_process'

export function getStream (url: string) {
  return spawn('yt-dlp', [
    '-f',
    'worst[height>=170]',
    url,
    '-o',
    '-',
  ])
}
