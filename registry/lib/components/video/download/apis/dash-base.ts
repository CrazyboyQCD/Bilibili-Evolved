/** dash 格式更明确的扩展名 */
export const DefaultDashExtensions = {
  video: '.mp4',
  audio: '.m4a',
  flacAudio: '.flac',
}
/** dash 格式原本的扩展名 */
export const DashFragmentExtension = '.m4s'
/** dash 格式支持的编码类型 */
export enum DashCodec {
  Avc = 'AVC/H.264',
  Hevc = 'HEVC/H.265',
  Av1 = 'AV1',
}
