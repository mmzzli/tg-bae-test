import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text, useToast, Img } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import { SkeletonShine } from '@/components/Skeketon/ChatSkeleton'
import { cutReq } from '@/api'
import playIcon from '@/assets/icons/videoSwitch.svg'

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
  const [landscapeBoll, setLandscapeBoll] = useState(false)

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
        video.muted = false
        video.play()
      }
      // setIsPlaying(!isPlaying) // Toggle the playing state
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
    // 是否是截取视频
    if (!trailerBoll && boll) {
      // 获取上传地址
      const response = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })
      const id = response.data.split('/').pop()
      setTrailer(`https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`)
      formData.append('url', response.data)
      setLoading(false)
      setBoll(true)
      off()
      const { data } = await axios.post(
        import.meta.env.VITE_API_URL + 'api/v1/cut_req_file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          timeout: 600000,
        }
      )
      return
    }
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
        console.log(percentCompleted)
        if (percentCompleted >= 100) {
          console.log(response.data)
          const id = response.data.split('/').pop()
          const url = `https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`
          await checkVideoURL(url)
          // 是否是截取视频
          // if(!trailerBoll && boll){
          //   setBoll(false)
          //   const curl = await cutReq({
          //     url,
          //     filename: "trailer",
          //     start: ~~startTime,
          //     end: ~~endTime
          //   })
          //   await checkVideoURL(curl)
          //   setTrailer(curl)
          //   setLoading(false)
          //   setBoll(true)
          //   off();
          //   return
          // }
          setTrailer(url)
          setLoading(false)
          off()
        }
      },
    })
  }

  // 自定义预告片
  const customizationVideo = async (videoRefTrailer: any) => {
    console.log(videoRefTrailer)
    if (!videoRefTrailer) {
      return
    }
    setLoading(true)
    const formData = new FormData()
    const items = Date.now()
    formData.append('file', videoRefTrailer)
    formData.append('name', `${items}`)
    formData.append('type', 'bae')
    // 截取视频使用
    formData.append('start', `${~~startTime}`)
    formData.append('end', `${~~endTime}`)

    formData.append(
      'meta',
      JSON.stringify({
        name: `${items}`,
        type: 'bae',
      })
    )
    videoUpload(formData)
  }

  const captureFrame = async () => {
    if (true) {
      customizationVideo(trailerBoll ? videoRefTrailer : videoFile)
      return
    }

    // if (!videoRef.current) return;
    // setLoading(true)

    // const video = videoRef.current;
    // video.currentTime = startTime; // 设置视频开始时间

    // const videoElement = videoRef.current as HTMLVideoElement & { captureStream?: () => MediaStream };
    // if (!videoElement?.captureStream) {
    //   toast({
    //     render: () => {
    //       return <CustomToast title="captureStream error" type={typeOptions.error} />
    //     },
    //     position: 'bottom',
    //   })
    //   return
    // }

    // const stream = videoElement.captureStream(); // 捕获视频流
    // const recorder = new MediaRecorder(stream);
    // const chunks: Blob[] = [];
    // // 处理录制数据
    // recorder.ondataavailable = (e: BlobEvent) => {
    //   if (e.data.size > 0) {
    //     chunks.push(e.data);
    //   }
    // };

    // // 录制结束后生成 Blob URL
    // recorder.onstop = async() => {
    //   const blob = new Blob(chunks, { type: "video/webm" });
    //   const clipUrl = URL.createObjectURL(blob);
    //   console.log(chunks, clipUrl)
    //   const formData = new FormData();
    //   const videoFile = new File([clipUrl], "trailer.mp4", { type: "video/mp4" });
    //   console.log(videoFile)
    //   formData.append("file", blob); // 添加文件
    //   formData.append("name", videoFile.name); // 添加文件名
    //   formData.append("type", "bae"); // 添加类型

    //   // 添加 meta 数据
    //   formData.append(
    //     "meta",
    //     JSON.stringify({
    //       name: videoFile.name,
    //       type: "bae",
    //     })
    //   );
    //   console.log(formData)
    //   videoUpload(formData)

    // };
    // recorder.start();

    // // 播放视频并自动停止录制
    // video.play();
    // setTimeout(() => {
    //   video.pause();
    //   recorder.stop();
    // }, (endTime - startTime) * 1000); // 按秒设置时长
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

  useEffect(() => {
    if ((videoUrl || previewVideoUrl) && videoRef.current) {
      videoRef.current.load()
    }

    const handleMetadataLoaded = () => {
      if (videoRef.current) {
        const videoElement = videoRef.current
        setLandscapeBoll(videoElement.videoWidth > videoElement.videoHeight)
      }
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('loadedmetadata', handleMetadataLoaded)
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded)
      }
    }
  }, [videoUrl, previewVideoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)

      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)

      return () => {
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
      }
    }
  }, [])
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (!isBaseModalOpen) {
      video.pause()
    } else {
      video.currentTime = 0
    }
  }, [isBaseModalOpen])

  return (
    <>
      <div
        className="fixed left-0 w-[100%]"
        style={{
          bottom: '133px',
        }}
      >
        <div
          className="flex justify-between  flex-none"
          style={{
            gap: '8px',
            padding: '0 28px',
          }}
        >
          <div>
            <p
              className=" text-[#000]"
              style={{
                fontSize: '16px',
              }}
            >
              Add a preview
            </p>
            <p
              className="text-[#8E8E92] font-light"
              style={{
                fontSize: '12px',
              }}
            >
              Give your fans a sneak peek before they unlock the content!
            </p>
          </div>

          {trailer ? (
            <TrailerVideo
              trailer={trailer}
              setTrailer={setTrailer}
              previewVideoUrl={previewVideoUrl}
              videoUrl={videoUrl}
            />
          ) : (
            <p
              className="bg-[#F7F9FC] rounded-md flex-none flex items-center justify-center"
              style={{
                height: '64px',
                width: '64px',
              }}
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
        // height={isLandscape ? '70vh' : '85vh'}
        style={{
          maxHeight: isLandscape ? '70vh' : '85vh',
          height: 'auto',
          overflow: 'auto',
        }}
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
              <div className="relative max-h-[330px] min-h-[100px] overflow-hidden w-[fit-content] rounded-[8px]">
                <video
                  ref={videoRef}
                  src={previewVideoUrl || videoUrl}
                  style={{ display: previewVideoUrl ? 'block' : 'block', width: landscapeBoll ? "100%" : '243px', minHeight: "200px" }}
                  preload="metadata"
                  autoPlay
                  playsInline
                  muted
                  onClick={handleVideoClick} // Add click handler to toggle play/pause
                />
                {!isPlaying && (
                  <Img
                    className="w-[60px] h-[60px] absolute top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%] "
                    src={playIcon}
                    onClick={handleVideoClick}
                  />
                )}
              </div>

              <div className="bg-[#fff] rounded-tl-[16px] rounded-tr-[16px]">
                <p className="text-[#999] pt-[30px] pb-[18px] font-normal">
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
                    previewVideoUrl={videoUrl}
                    startTime={startTime}
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
