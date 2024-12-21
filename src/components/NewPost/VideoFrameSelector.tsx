import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'

import BaseButton from '@/components/BaseButton/BaseButton'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useStore } from '@/store'
import { uploadImgUrl } from '@/utils/env'

interface Frame {
  url: string
  time: number
  height: number
  width: number
}
interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>
  setCover: Dispatch<SetStateAction<string | null>>
  videoSrc: string
}

const VideoFrameSelector: React.FC<VideoPlayerProps> = ({ videoRef, setCover, videoSrc }) => {
  const [frames, setFrames] = useState<Frame[]>([])
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const token = useStore((state) => state.token)
  const [loading, setLoading] = useState(false)

  const extractFramesFromVideo = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    console.log(videoRef)
    console.log(video)

    const framesArray: Frame[] = []
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const videoDuration = video.duration

    const frameInterval = videoDuration / 20

    video.currentTime = 0

    const extractFrame = () => {
      if (video.currentTime >= videoDuration) {
        video.ontimeupdate = null
        return
      }

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        framesArray.push({
          url: canvas.toDataURL('image/png'),
          time: video.currentTime,
          height: canvas.height,
          width: canvas.width,
        })
        setFrames([...framesArray])
      }

      video.currentTime += frameInterval
    }

    video.ontimeupdate = extractFrame

    video.play()
  }

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame)
  }
  const handler = async (curl:string) => {
    if(!curl){
      console.log('post error')
      return
    }
    setLoading(true)
    const timestamp: number = new Date().getTime()
    const url = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${timestamp}`
    const file = base64ToFile(curl, 'image.png')

    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      setCover(response.data)
      setLoading(false)
      off()
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error)
    }
  }

  useEffect(() => {
    console.log(videoSrc,'123321')
    if(videoRef){
      const timer = setTimeout(() => {
        extractFramesFromVideo()
      }, 1000)
      return () => clearTimeout(timer);
    }
  }, [videoRef, videoSrc])
  useEffect(() => {
    console.log(frames)
    if (frames.length === 3) {
      console.log(frames)
      setSelectedFrame(frames[0])
      handler(frames[0]?.url)
    }
  }, [frames])

  function base64ToFile(base64String: any, filename: string) {
    const arr = base64String.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  return (
    <>
      <Text
        color="#FFF"
        fontSize="14px"
        borderRadius="4px"
        bg="rgba(0, 0, 0, 0.50)"
        p="5px 9px 6px 10px"
        position="absolute"
        bottom="8px"
        right="8px"
        cursor="pointer"
        onClick={() => toggle()}
      >
        Select cover
      </Text>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="90vh"
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="w-[100%]">
          <h2 className="text-[24px] text-[#333] mt-[24px]">Select cover</h2>
          {selectedFrame && selectedFrame.width > selectedFrame.height && (
            <div className="rounded-[5px] mt-[16px] max-h-[300px] overflow-hidden">
              <img
                src={selectedFrame.url}
                alt={`Selected Frame at ${selectedFrame.time}s`}
                width="100%"
              />
            </div>
          )}
          {selectedFrame && selectedFrame.width < selectedFrame.height && (
            <div className="mt-[16px]">
              <img
                src={selectedFrame.url}
                className="rounded-[5px]"
                style={{
                  width: '243px',
                  height: '315px',
                  objectFit: 'cover',
                }}
                alt={`Selected Frame at ${selectedFrame.time}s`}
              />
            </div>
          )}
          <div className="bg-[#fff] rounded-tl-[16px] rounded-tr-[16px]">
            <div>
              <p className="text-center text-[#999] pt-[62px] pb-[15px]">
                Swipe left and right to choose the best cover
              </p>
              <div className="flex overflow-auto rounded-[8px]">
                {frames.map((frame, index) => (
                  <img
                    key={index}
                    src={frame.url}
                    alt={`Frame at ${frame.time}s`}
                    onClick={() => handleSelectFrame(frame)}
                    className="object-cover"
                    style={{
                      height: '64px',
                      width: '48px',
                      minWidth: '48px',
                      cursor: 'pointer',
                      border: selectedFrame?.time === frame.time ? '2px solid #FFF' : 'none',
                      borderRadius: selectedFrame?.time === frame.time ? '8px' : '0px',
                      opacity: selectedFrame?.time === frame.time ? '1' : '0.5',
                    }}
                    width="100px"
                  />
                ))}
              </div>
              <div className="px-[20px] pt-[24px] pb-[44px]">
                <BaseButton
                  text="Done"
                  width="100%"
                  loading={loading}
                  className="h-[48px]"
                  handler={()=>handler(selectedFrame?.url || '')}
                />
              </div>
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  )
}

export default VideoFrameSelector
