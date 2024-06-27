/* eslint-disable unicorn/prefer-code-point */

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
