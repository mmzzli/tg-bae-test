import Hls from 'hls.js'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'

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
  let url = videoCard.media
  // todo trailer预告片需处理为 mp4
  if (videoCard.price > 0 && !videoCard.is_pay && videoCard.trailer && videoCard.currentUid !== videoCard.uid) {
    url = [videoCard.trailer]
  }
  video.setAttribute('video-id', '' + videoCard.id)
  const videoParentContainer = videoCardContainer.querySelector('.video-container')

  console.log(videoCard.currentUid,'jacob=================');
  if (!videoParentContainer) return

  video.style.visibility = 'hidden'

  video.src = url[0]
  video.style.width = '100vw'
  video.style.height = 'auto'
  video.style.visibility = ''
  video.style.position = 'absolute'
  video.style.zIndex = '0'
  video.loop = true
  videoParentContainer.appendChild(video)


  video.addEventListener('play',()=>{
    video.style.zIndex = '4'
  })


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


  const unsubscribeRoute = useStore.subscribe((state) => {
    const currentPath = window.location.pathname
    if (video) {
      if (currentPath === '/home' || currentPath === '/christmas' || currentPath === '/') {
        video.play().catch((error:any) => {
          console.log('视频播放失败:', error)
          video.muted = true
          video.play()
        })
      } else {
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


  // 清理函数
  return () => {
    unsubscribe()
    unsubscribeRoute()
  }
}
