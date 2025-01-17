import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import {
  Input
} from '@chakra-ui/react'

const Trailer = () => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [videoSrc, setVideoSrc] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files
    if (!newFiles || newFiles.length === 0) return
    const fileArray = Array.from(newFiles)
    const videoUrl = URL.createObjectURL(fileArray[0])
    setVideoSrc(videoUrl)

  }

  const handleChooseFile = () => {
    inputRef.current?.click()
  }

  return (
    <div>
      {
        !videoSrc ?
          <p className='h-[64px] w-[64px] bg-[#F7F9FC] rounded-md flex-none' onClick={handleChooseFile}></p>
          :
          <div className='rounded-md border-2 border-[#6254FF]'>
            <video
              // ref={videoRef}
              className={`h-[64px] min-w-[64px] rounded-md`}
              src={videoSrc}
              // onLoadedMetadata={(e) => {
              //   const video = e.currentTarget
              //   setDuration(video.duration)
              // }}
              // onTimeUpdate={(e) => {
              //   const video = e.currentTarget
              //   if (!isDragging) {
              //     setCurrentTime(video.currentTime)
              //     setProgress((video.currentTime / video.duration) * 100)
              //   }
              // }}
              // onEnded={() => {
              //   setPlaying(false)
              // }}
              // onPause={() => setPlaying(false)}
              // onPlay={() => setPlaying(true)}
              // onWaiting={() => setIsLoading(true)}
              // onPlaying={() => setIsLoading(false)}
              controls={false}
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              x5-video-player-type="h5"
              x5-video-player-fullscreen="false"
              preload="auto"
              x-webkit-airplay="allow"
            />
          </div>
      }
      <Input
        type="file"
        accept=".mp4,.webm"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={inputRef}
      />
    </div>
  )
}
export default Trailer
