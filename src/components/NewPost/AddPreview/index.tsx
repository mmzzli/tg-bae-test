import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text, useToast } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import RecordRTC from 'recordrtc'
import { SkeletonShine } from '@/components/Skeketon/ChatSkeleton'
import { cutReq } from '@/api'

import BaseButton from '@/components/BaseButton/BaseButton'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useStore } from '@/store'
import { uploadImgUrl } from '@/utils/env'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

import Trailer from '@/components/NewPost/AddPreview/Trailer'
import Slider from '@/components/NewPost/AddPreview/Slider'
import TrailerVideo from '@/components/NewPost/AddPreview/TrailerVideo'

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
  setTrailer: (url: string) => void
  trailer: string | null
  videoFile: File | null
}

const AddPreview: React.FC<VideoPlayerProps> = ({
  videoRef,
  setCover,
  videoSrc: videoUrl,
  setTrailer,
  trailer,
  videoFile,
}) => {
  const toast = useToast()
  const [videoRefTrailer, setVideoRefTrailer] = useState<File | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  // 显示视频地址
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('')
  const [frames, setFrames] = useState<Frame[]>([])
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const token = useStore((state) => state.token)
  const [loading, setLoading] = useState(false)
  const [loadingSkeleton, setLoadingSkeleton] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false) // New state to track if video is playing
  // 设置播放时间
  const [startTime, setStartTime] = useState<number>(0) // Set the start time for the video (in seconds)
  const [endTime, setEndTime] = useState<number>(6) // Set the end time for the video (in seconds)
  // 选择用哪个预告片
  const [trailerBoll, setTrailerBoll] = useState(false)
  const [boll, setBoll] = useState(true)

  const isLandscape =
    selectedFrame?.width && selectedFrame?.height
      ? selectedFrame.width > selectedFrame.height
      : false

  const renderFrameToCanvas = (): void => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (video && canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const videoWidth = video.videoWidth
        const videoHeight = video.videoHeight

        canvas.width = videoWidth
        canvas.height = videoHeight

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, videoWidth, videoHeight)
      }
    }
  }

  const handleVideoClick = () => {
    const video = videoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying) // Toggle the playing state
    }
  }
  const handleVideoClick1 = () => {
    const video = previewVideoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying) // Toggle the playing state
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration)
        setCurrentTime(0)
        renderFrameToCanvas()
      }

      const handleCanPlay = () => {
        renderFrameToCanvas()
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('canplay', handleCanPlay)
      video.addEventListener('loadeddata', handleCanPlay)

      if (video.readyState >= 3) {
        handleCanPlay()
      } else {
        video
          .play()
          .then(() => video.pause())
          .catch(console.error)
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('canplay', handleCanPlay)
        video.removeEventListener('loadeddata', handleCanPlay)
      }
    }
  }, [videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.currentTime = startTime // Set the initial time to the start time

      const handleTimeUpdate = () => {
        if (video.currentTime >= endTime) {
          video.currentTime = startTime // Reset to start time if it exceeds the end time
        }
        setCurrentTime(video.currentTime)
        renderFrameToCanvas()
      }

      video.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [startTime, endTime, videoRef])

  const handleSliderChange = (value: React.FormEvent<HTMLInputElement>): void => {
    const video = videoRef.current
    if (video) {
      video.currentTime = Number(value)
      setCurrentTime(Number(value))
      renderFrameToCanvas()
    }
  }

  useEffect(() => {
    if (videoRef) {
      const timer = setTimeout(() => {
        // captureFrame();
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [videoRef, videoUrl])

  async function checkVideoURL(url: string): Promise<AxiosResponse<any> | undefined> {
    let isNotFound = true

    while (isNotFound) {
      try {
        const response: AxiosResponse<any> = await axios.get(url)
        isNotFound = false
        return response
      } catch (error: any) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
  }

  const videoUpload = async (formData: any) => {
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      await axios.post(response.data, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: async (progressEvent: any) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          const percentCompleted = Math.round((current * 100) / total)
          console.log('Upload progress:', percentCompleted)

          if (percentCompleted >= 100) {
            const id = response.data.split('/').pop()
            const url = `https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`
            // 是否是截取视频
            if (!trailerBoll && boll) {
              setBoll(false)
              await checkVideoURL(url)
              setTrailer(url)
              setLoading(false)
              setBoll(true)
              off()
              return
            }
            setTrailer(url)
            setLoading(false)
            off()
          }
        },
      })
    } catch (error) {
      console.error('Error uploading video:', error)
      toast({
        render: () => {
          return <CustomToast title="Failed to upload video" type={typeOptions.error} />
        },
        position: 'bottom',
      })
      setLoading(false)
    }
  }

  // 自定义预告片
  const customizationVideo = async (videoRefTrailer: any) => {
    if (!videoRefTrailer) {
      return
    }
    setLoading(true)
    const formData = new FormData()
    formData.append('file', videoRefTrailer)
    formData.append('name', videoRefTrailer.name)
    formData.append('type', 'bae')

    formData.append(
      'meta',
      JSON.stringify({
        name: videoRefTrailer.name,
        type: 'bae',
      })
    )
    videoUpload(formData)
  }

  const captureFrame = async () => {
    if (trailerBoll) {
      customizationVideo(videoRefTrailer)
      return
    }

    if (!videoRef.current) return
    setLoading(true)

    const video = videoRef.current
    video.currentTime = startTime // 设置视频开始时间

    const videoElement = videoRef.current as HTMLVideoElement & {
      captureStream?: () => MediaStream
    }
    if (!videoElement?.captureStream) {
      toast({
        render: () => {
          return (
            <CustomToast
              title="Your browser doesn't support video capture"
              type={typeOptions.error}
            />
          )
        },
        position: 'bottom',
      })
      return
    }

    const stream = videoElement.captureStream()
    const recorder = new RecordRTC(stream, {
      type: 'video',
      mimeType: 'video/webm;codecs=h264',  // 使用 H.264 编码
      frameRate: 30,                        // 提高帧率
      videoBitsPerSecond: 2500000,         // 提高比特率到 2.5Mbps
      recorderType: RecordRTC.MediaStreamRecorder,
      // 确保音频质量
      numberOfAudioChannels: 2,             // 立体声
      audioBitsPerSecond: 128000,          // 音频比特率
      // 视频处理选项
      disableLogs: true,
      timeSlice: 100,                      // 减少时间片以提高流畅度
      // 事件处理
      onTimeStamp: (timestamp: number) => {
        console.log('Recording timestamp:', timestamp)
      },
      ondataavailable: (blob: Blob) => {
        console.log('Recording progress:', blob.size)
      }
    })

    // 开始录制前确保视频已准备就绪
    video.currentTime = startTime
    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true })
    })

    // 开始录制
    recorder.startRecording()

    // 播放视频并在指定时间后停止录制
    video.play()

    setTimeout(
      () => {
        video.pause()
        recorder.stopRecording(async () => {
          const blob = recorder.getBlob()
          console.log('Recording completed, blob size:', blob.size)

          const formData = new FormData()
          formData.append('file', blob)
          formData.append('name', 'trailer.webm')
          formData.append('type', 'bae')

          formData.append(
            'meta',
            JSON.stringify({
              name: 'trailer.webm',
              type: 'bae',
            })
          )

          // 清理资源
          recorder.destroy()
          stream.getTracks().forEach((track) => track.stop())

          // 直接上传录制的视频片段
          videoUpload(formData)
        })
      },
      (endTime - startTime) * 1000
    )
  }

  const base64ToFile = (base64String: any, filename: string) => {
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
      <div className="fixed bottom-[133px] left-0 w-[100%]">
        <div className="px-7 flex justify-between gap-2 flex-none">
          <div>
            <p className="text-[16px] text-[#000]">Add a preview</p>
            <p className="text-[12px] text-[#8E8E92] font-light">Give your fans a sneak peek before they unlock the content!</p>
          </div>
          {/* className="w-full h-full flex items-center justify-center border-dashed border border-[#CDCDD4] rounded-lg cursor-pointer" */}

          {trailer ? (
            <TrailerVideo trailer={trailer} setTrailer={setTrailer} />
          ) : (
            <p
              className="h-[64px] w-[64px] bg-[#F7F9FC] rounded-md flex-none flex items-center justify-center"
              onClick={() => toggle()}
            >
              <i className="iconfont icon-add text-[#999999] text-[20px]"></i>
            </p>
          )}
        </div>
      </div>

      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height={isLandscape ? '70vh' : '85vh'}
        animation={{ duration: 400, timingFunction: 'ease-in-out' }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div
          className="w-[100%]"
          style={{
            display: loadingSkeleton ? 'block' : 'none',
          }}
        >
          <div className="h-[315px] w-[100%] relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727] rounded w-2/3">
            <SkeletonShine />
          </div>
          <div className="h-[100px] w-[100%] mt-8 relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727] rounded w-2/3">
            <SkeletonShine />
          </div>
        </div>

        <div
          className="w-[100%]"
          style={{
            display: loadingSkeleton ? 'none' : 'block',
          }}
        >
          <h2 className="text-[24px] text-[#333] mt-[24px]">Add a preview</h2>

          {videoUrl && (
            <div className="pt-[24px]">
              {/* Video Element */}
              <div className='max-h-[330px] min-h-[100px] overflow-hidden w-[fit-content] bg-[#666]'>
              <video
                ref={previewVideoRef}
                src={previewVideoUrl}
                style={{ display: previewVideoUrl ? "block" : "none", width: "243px" }}
                preload="metadata"
                playsInline
                muted
                onClick={handleVideoClick1}
              />
              <video
                ref={videoRef}
                src={videoUrl}
                style={{ display: previewVideoUrl ? "none" : "block", width: "243px" }}
                preload="metadata"
                playsInline
                muted
                onClick={handleVideoClick} // Add click handler to toggle play/pause
              />
              </div>
              {/* <canvas
                ref={canvasRef}
                width={243}
                height={315}
                style={{
                  marginTop: "16px",
                  display: "block",
                  width: "243px",
                  height: "315px",
                }}
              ></canvas> */}

              <div className="bg-[#fff] rounded-tl-[16px] rounded-tr-[16px]">
                <p className="text-[#999] pt-[30px] pb-[18px]">
                  Select a clip from the video to use as a preview, or upload a video from album.
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Trailer
                    trailerBoll={trailerBoll}
                    setTrailerBoll={setTrailerBoll}
                    setVideoRefTrailer={setVideoRefTrailer}
                    setPreviewVideoUrl={setPreviewVideoUrl}
                  />
                  <Slider
                    duration={duration}
                    handleSliderChange={handleSliderChange}
                    setStartTime={setStartTime}
                    setEndTime={setEndTime}
                    trailerBoll={trailerBoll}
                    setTrailerBoll={setTrailerBoll}
                    videoRef={videoRef}
                    setLoadingSkeleton={setLoadingSkeleton}
                    setPreviewVideoUrl={setPreviewVideoUrl}
                  />
                </div>

                <div className="px-[20px] pt-[24px] pb-[20px]">
                  <BaseButton
                    text="Done"
                    width="100%"
                    loading={loading}
                    className="h-[48px]"
                    handler={() => captureFrame()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </BaseModal>
    </>
  )
}

export default AddPreview
