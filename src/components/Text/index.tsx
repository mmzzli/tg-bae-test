import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import ReactFullpage from '@fullpage/react-fullpage'

const VideoPlayer = ({ videoUrls }: { videoUrls: string[] }) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [preloaded, setPreloaded] = useState<boolean[]>(new Array(videoUrls.length).fill(false))
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement

        if (entry.isIntersecting) {
          videoElement.play().catch((error) => {
            console.error('Video play failed:', error)
          })
        } else {
          videoElement.pause()
        }
      })
    }, options)

    videoUrls.forEach((url, index) => {
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(url)
        hls.attachMedia(videoRefs.current[index]!)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          hls.currentLevel = 0
        })

        videoRefs.current[index]?.addEventListener('canplaythrough', () => {
          setPreloaded((prev) => {
            const updated = [...prev]
            updated[index] = true
            return updated
          })
        })

        observer.observe(videoRefs.current[index]!)

        return () => {
          hls.destroy()
          observer.unobserve(videoRefs.current[index]!)
        }
      } else if (videoRefs.current[index]?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRefs.current[index]!.src = url
        videoRefs.current[index]!.addEventListener('canplaythrough', () => {
          setPreloaded((prev) => {
            const updated = [...prev]
            updated[index] = true
            return updated
          })
        })

        observer.observe(videoRefs.current[index]!)

        return () => {
          observer.unobserve(videoRefs.current[index]!)
        }
      }
    })

    const handleTouchStart = () => {
      setIsMuted(false)
      videoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.play().catch((error) => {
            console.error('Video play failed:', error)
          })
        }
      })
    }

    window.addEventListener('touchstart', handleTouchStart, { once: true })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
    }
  }, [videoUrls])

  const handlePlay = (index: number) => {
    if (playingIndex !== null && playingIndex !== index) {
      const currentVideo = videoRefs.current[playingIndex]
      if (currentVideo) {
        currentVideo.pause()
      }
    }
    setPlayingIndex(index)
  }

  return (
    <ReactFullpage
      scrollingSpeed={1000}
      navigation={false}
      showActiveTooltip
      credits={{ enabled: false }}
      render={() => {
        return (
          <div id="fullpage-wrapper">
            {videoUrls.map((url, index) => (
              <div className="section" key={index}>
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  style={{
                    display: preloaded[index] ? 'block' : 'none',
                    width: '100%',
                    margin: '200px 0',
                  }}
                  controls
                  muted={isMuted}
                  loop
                  playsInline
                  onPlay={() => handlePlay(index)}
                />
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}

export default VideoPlayer
