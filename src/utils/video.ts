import { FormatterListItem } from '@/store/slices/resourceListSlice'

export const videoScale = (data: FormatterListItem, containerDom: HTMLDivElement) => {
  const { width: videoOriginWidth, height: videoOriginHeight } = data
  console.log(data, containerDom, containerDom.getBoundingClientRect())
  const { width: containerWidth, height: containerHeight } = {
    width: containerDom.offsetWidth,
    height: containerDom.offsetHeight,
  }
  const aspect = Number(videoOriginWidth) / Number(videoOriginHeight)
  const containerAspect = containerWidth / containerHeight

  console.log(containerAspect,'jacob===========');
  console.log(aspect,'jacob===========');
  console.log(aspect === containerAspect,'jacob===========');
  if (aspect === containerAspect) {
    // 如果宽高比相等，直接返回 scale 为 1
    return 'object-cover'
  } else if (aspect>1.2) {
    // 横屏视频，使用 object-contain 以确保视频完整显示
    return 'object-contain'
  } else {
    // 竖屏视频，使用 object-cover 以确保视频覆盖整个容器
    return 'object-cover'
  }
}
