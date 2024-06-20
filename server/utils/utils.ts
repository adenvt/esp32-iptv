export function toString (data: Uint8Array) {
  return String.fromCharCode(...data)
}

export function toBase64 (data: Uint8Array) {
  return btoa(toString(data))
}

export function fromBase64 (base64: string) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
}

export function readUint32LE (data: Uint8Array, offset = 0): number {
  return new DataView(data.buffer, data.byteOffset).getUint32(offset, true)
}

export function milis () {
  return performance.now()
}

export function humanFileSize (bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh)
    return bytes + ' B'

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  let u = -1

  const r = 10 ** dp

  do {
    bytes /= thresh;

    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)


  return bytes.toFixed(dp) + ' ' + units[u]
}
