import { MP4_REGEX } from '../constants'
export const converMedia = (data: any) => {
  if (!data) return;
  if (data.type === 1) {
    if (data.media && typeof data.media === 'string') {
      return data.media.split(',')
    }
  } else if (data.type === 0) {
    // const picUrl = medias.find((item) => !item.endsWith('.m3u8'))
    if (data.media && typeof data.media === 'string') {
      const medias = data.media.split(',')
      const media = medias.find((item: string) => MP4_REGEX.test(item))
      return [media]
    }
  }
  return data.media
}
