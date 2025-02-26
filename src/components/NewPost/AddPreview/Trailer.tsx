import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@chakra-ui/react'

interface TrailerProps {
  trailerBoll: boolean
  setTrailerBoll: (boll: boolean) => void
  setVideoRefTrailer: (file: File | null) => void
  setPreviewVideoUrl: (str: string) => void
}

const Trailer: React.FC<TrailerProps> = ({
  trailerBoll,
  setTrailerBoll,
  setVideoRefTrailer,
  setPreviewVideoUrl,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [videoSrc, setVideoSrc] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files
    if (!newFiles || newFiles.length === 0) return

    const file = newFiles[0]
    setVideoRefTrailer(file)

    const videoUrl = URL.createObjectURL(file)
    setVideoSrc(videoUrl)
    setTrailerBoll(true)

    console.log('File selected:', file)
    console.log('Video URL:', videoUrl)
  }

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      setPreviewVideoUrl(videoSrc)
      setTimeout(() => {
        videoRef.current?.load()
      }, 100)
      console.log('Video source set:', videoSrc)
    }
  }, [videoSrc, videoRef])

  const handleChooseFile = () => {
    inputRef.current?.click()
  }

  const clearVideo = () => {
    setVideoSrc('')
    setPreviewVideoUrl('')
    setTrailerBoll(false)
    setVideoRefTrailer(null)
  }

  return (
    <div className="relative">
      {!videoSrc ? (
        <p
          className="h-[64px] w-[64px] bg-[#333] rounded-md flex items-center justify-center cursor-pointer"
          onClick={handleChooseFile}
        >
          <i className="iconfont icon-add text-[#666666] text-[18px]"></i>
        </p>
      ) : (
        <div
          className="rounded-md relative bg-[#6254FF]"
          style={{
            border: `2px solid ${trailerBoll ? '#fff' : '#fff'}`,
          }}
        >
          <div
            className="w-[20px] h-[20px] right-[-6px] top-[-6px] z-10 rounded-full bg-[#666] absolute flex items-center justify-center cursor-pointer"
            onClick={clearVideo}
          >
            <i className="iconfont icon-icon_close text-[#fff] text-[16px]"></i>
          </div>
          <div className="overflow-hidden w-[64px] h-[64px] rounded-md bg-[#F7F9FC]">
            <video
              ref={videoRef}
              className="h-[64px] w-[64px] object-cover cursor-pointer rounded-md"
              onClick={() => {
                setTrailerBoll(true)
                setPreviewVideoUrl(videoSrc)
                // setTimeout(() => {
                //   const scrollable = document.getElementById('postScroll')
                //   if (scrollable) {
                //     scrollable.scrollTo({
                //       top: scrollable.scrollHeight,
                //       behavior: 'smooth',
                //     })
                //   }
                // }, 300)
              }}
              src={videoSrc}
              preload="metadata"
              autoPlay
              playsInline
              muted
              // controls
            />
          </div>
        </div>
      )}
      <Input
        type="file"
        accept=".mp4,.webm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={inputRef}
      />
    </div>
  )
}

export default Trailer
