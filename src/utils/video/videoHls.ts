import Hls from 'hls.js'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useStore } from '@/store'
const video = document.createElement('video')
video.controls = false
video.playsInline = true
video.setAttribute('webkit-playsinline', 'true')
video.setAttribute('x5-playsinline', 'true')
video.setAttribute('x5-video-player-type', 'h5')
video.setAttribute('x5-video-player-fullscreen', 'false')
video.setAttribute('preload', 'auto')
video.setAttribute('x-webkit-airplay', 'allow')
video.id = 'default-video-player'

export const videoHls = (videoCard: FormatterListItem, videoCardContainer: HTMLElement) => {
  const url = videoCard.media[0]
  const curVideo = videoCardContainer.querySelector('video')

  const homeVideoMuted = useStore.getState().homeVideoMuted
  if (curVideo) return

  const videoParentContainer = videoCardContainer.querySelector('.video-container')
  if (!videoParentContainer) return

  video.style.visibility = 'hidden'
  videoParentContainer.appendChild(video)

  video.style.width = '100vw'
  video.style.height = 'auto'
  video.style.visibility = ''
  video.style.position = 'absolute'
  video.style.zIndex = '0'
  video.loop = true

  setTimeout(() => {
    video.style.zIndex = '4'
  }, 500)

  const switchBtn = videoParentContainer.querySelector('.video-card-switch') as HTMLElement | null

  if (switchBtn) {
    switchBtn.style.visibility = 'hidden'
  }

  video.onclick = function () {
    if (switchBtn) {
      switchBtn!.click()
      switchBtn.style.visibility = ''
    }
  }

  const hls = new Hls({
    enableWorker: true,
    maxBufferLength: 30,
    maxMaxBufferLength: 60,
    autoStartLoad: true,
    maxBufferHole: 0.5,
    lowLatencyMode: true,
  })
  hls.loadSource(url)
  hls.attachMedia(video)

  const unsubscribeRoute = useStore.subscribe((state) => {
    const currentPath = window.location.pathname
    if (video) {
      if (currentPath === '/home' || currentPath === '/christmas' || currentPath === '/') {
        video.play().catch((error) => {
          console.log('视频播放失败:', error)
          video.muted = true
          video.play()
        })
      } else {
        hls.destroy()
        video.pause()
      }
    }
  })

  const unsubscribe = useStore.subscribe((state) => {
    const newMutedState = state.homeVideoMuted
    if (video) {
      video.muted = newMutedState
    }
  })

  hls.on(Hls.Events.MANIFEST_PARSED, async () => {
    try {
      // 首先设置为静音以确保可以自动播放
      video.muted = true
      await video.play()

      // 如果初始播放成功，再根据状态设置静音
      if (!homeVideoMuted) {
        // 添加延时以确保浏览器不会阻止取消静音
        setTimeout(() => {
          video.muted = homeVideoMuted
        }, 100)
      }
    } catch (error) {
      console.warn('视频播放失败:', error)
      // 保持静音状态继续尝试播放
      video.muted = true
      try {
        await video.play()
      } catch (retryError) {
        console.error('重试播放失败:', retryError)
      }
    }
  })

  // 清理函数
  return () => {
    unsubscribe()
    unsubscribeRoute()
  }
}
