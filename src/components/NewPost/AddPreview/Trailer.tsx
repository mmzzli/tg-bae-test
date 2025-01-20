import React, { FC, useState, useEffect, useRef, RefObject } from 'react'
import {
  Input
} from '@chakra-ui/react'

interface TrailerProps {
  trailerBoll: boolean
  setTrailerBoll: (boll:boolean)=>void
  setVideoRefTrailer: (file: File | null)=>void
}

const Trailer: React.FC<TrailerProps> = ({
  trailerBoll,
  setTrailerBoll,
  setVideoRefTrailer
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [videoSrc, setVideoSrc] = useState("")

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files
    if (!newFiles || newFiles.length === 0) return
    const fileArray = Array.from(newFiles)
    setVideoRefTrailer(fileArray[0])
    const videoUrl = URL.createObjectURL(fileArray[0])
    setVideoSrc(videoUrl)
    setTrailerBoll(true)

  }

  const handleChooseFile = () => {
    inputRef.current?.click()
  }

  return (
    <div className='relative'>
      {
        !videoSrc ?
          <p className='h-[64px] w-[64px] bg-[#F7F9FC] rounded-md flex-none flex items-center justify-center' onClick={handleChooseFile}>
            <i className="iconfont icon-add text-[#999999] text-[30px]"></i>
          </p>
          :
          <div className='rounded-md'
            style={{
              border: `2px solid ${trailerBoll ? "#6254FF" : "#fff"}`
            }}
          >

            <div className='w-[20px] h-[20px] right-[-6px] top-[-6px] z-10 rounded-[50px] bg-[#666] absolute flex items-center justify-center'
              onClick={()=>{setVideoSrc("");setTrailerBoll(false)}}
            >
              <i className="iconfont icon-icon_close text-[#fff] dark:text-[#E0E2F6] text-[16px]"></i>
            </div>

            <video
              className={`h-[64px] min-w-[64px] rounded-md`}
              src={videoSrc}
              onClick={()=>setTrailerBoll(true)}
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
