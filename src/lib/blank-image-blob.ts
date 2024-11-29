const hexString: string = `
  89504E470D0A1A0A
  0000000D49484452
  0000000100000001
  0100000000376EF9
  240000000A494441
  5478016360000000
  0200017375011800
  00000049454E44AE
  426082
`.replace(/\s+/g, "")
const byteArray = new Uint8Array(
  hexString.match(/.{2}/g).map(byte => parseInt(byte, 16))
)
const blob = new Blob([byteArray], { type: "image/png" })
export const blankImageUrl = URL.createObjectURL(blob)
