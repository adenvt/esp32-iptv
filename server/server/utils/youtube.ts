import { execSync } from 'node:child_process'

export function getVideoUrl (url: string) {
  const stdout = execSync(`youtube-dl -f "worst[height>=170]" -g "${url}"`)
  const result = stdout.toString().trim()

  return result
}
