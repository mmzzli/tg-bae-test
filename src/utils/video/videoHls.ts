import Hls from 'hls.js'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
const video = document.createElement('video')

export const videoHls = (videoCard: FormatterListItem, videoCardContainer: HTMLElement) => {
  const url = videoCard.media[0]

  const curVideo = videoCardContainer.querySelector('video')
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

  const switchBtn = videoParentContainer.querySelector('.video-card-switch')

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

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.muted = true
    video.play().catch((error) => {
      console.log(error, 'error====jacob')
      video.muted = true
      video.play()
    })
  })
}
