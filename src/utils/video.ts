import { FormatterListItem } from '@/store/slices/resourceListSlice'

export const videoScale = (data: FormatterListItem, containerDom: HTMLDivElement) => {
  const { width: videoOriginWidth, height: videoOriginHeight } = data
  const { width: containerWidth, height: containerHeight } = {
    width: containerDom.offsetWidth,
    height: containerDom.offsetHeight,
  }
  const aspect = Number(videoOriginWidth) / Number(videoOriginHeight)
  const containerAspect = containerWidth / containerHeight

  if (aspect === containerAspect) {
    // 如果宽高比相等，直接返回 scale 为 1
    return 'object-cover'
  } else if (aspect > containerAspect) {
    return 'object-contain'
  } else {
    // 视频宽高比更小（纵向撑满，裁切左右）
    return 'object-cover'
  }
}
