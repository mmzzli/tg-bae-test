import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text, useToast, Img } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'
import * as tus from "tus-js-client";

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
import { MP4_REGEX } from '@/utils/constants';

interface Metadata {
  vid: string;
  url: string;
  start?: string; // 可选属性
  end?: string;   // 可选属性
}

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
  setTrailerR2: (url: string) => void
  trailer: string | null
  videoFile: File | null
}

const AddPreview: React.FC<VideoPlayerProps> = ({
  videoRef,
  setCover,
  videoSrc: videoUrl,
  setTrailer,
  setTrailerR2,
  trailer,
  videoFile,
}) => {
  const toast = useToast()
  const [videoRefTrailer, setVideoRefTrailer] = useState<File | null>(null)
  const previewVideoRef = useRef<HTMLVideoElement>(null)
  // 显示视频地址
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string>('')
  const [frames, setFrames] = useState<Frame[]>([])
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false)
  const token = useStore((state) => state.token)

  const {
    virtualRoutePage,
    setVirtualRoutePage,
    resetVirtualRoutePage,
  } = useStore((state) => ({
    virtualRoutePage: state.virtualRoutePage,
    setVirtualRoutePage: state.setVirtualRoutePage,
    resetVirtualRoutePage: state.resetVirtualRoutePage,
  }))

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
  // 是否是横屏
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


  // 自定义预告片
  const customizationVideo = async (videoRefTrailer: any) => {
    console.log(videoRefTrailer)
    if (!videoRefTrailer) {
      return
    }
    setLoading(true)
    console.log(trailerBoll)
    // 是否是裁剪视频

    const videoId = performance.timeOrigin * 1e6 + performance.now() * 1e3
    console.log(videoId)
    const metadata: any = {
      vid: videoId,
    }

    if(trailerBoll){
      if(videoRefTrailer.name.endsWith('.mp4')){
        const url = `${import.meta.env.VITE_APP_UPLOAD_URL}uploadall`
        // 参数
        const formData = new FormData()
        const items = Date.now()
        formData.append('file', videoRefTrailer)
        formData.append('name', `${items}`)
        formData.append('type', 'bae')

        axios.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent: any) => {
            const total = progressEvent.total
            const current = progressEvent.loaded
            const percentCompleted = Math.round((current * 100) / total)
            console.log(`上传进度: ${percentCompleted}%`)
          },
        })
          .then((r2Response) => {
            setTrailer(r2Response.data.urls[0])
          })
      }else{
        const upload = new tus.Upload(videoRefTrailer, {
          endpoint: `${import.meta.env.VITE_APP_UPLOAD_R2_URL}files`, // 你的 tus 服务器地址
          retryDelays: [0, 3000, 5000, 10000], // 失败时重试间隔
          headers: {
            'Authorization': `Bearer ${token}`
          },
          metadata: metadata,
        })
        upload.start();
        setTrailer(`${import.meta.env.VITE_APP_UPLOAD_IMG_URL}${videoId}.mp4`)
      }
    }else{

      metadata["start"] = `${~~startTime}`
      metadata["end"] = `${~~endTime}`

      const upload = new tus.Upload(videoRefTrailer, {
        endpoint: `${import.meta.env.VITE_APP_UPLOAD_R2_URL}files`, // 你的 tus 服务器地址
        retryDelays: [0, 3000, 5000, 10000], // 失败时重试间隔
        headers: {
          'Authorization': `Bearer ${token}`
        },
        metadata: metadata,
      })
      upload.start();
      setTrailer(`${import.meta.env.VITE_APP_UPLOAD_IMG_URL}${videoId}.mp4`)
    }
    setLoading(false)
    // setVirtualRoutePage({ name: '', enterFrom: '' })
    resetVirtualRoutePage()

    return
    setLoading(true)

    // const uploadRes = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //     Authorization: `Bearer ${token}`,
    //   },
    // })

    // const videoId = performance.timeOrigin * 1e6 + performance.now() * 1e3

    // const metadata: any = {
    //   vid: videoId,
    //   // url: uploadRes.data
    //   // metadata["vid"] = videoId
    // }

    // if (trailerBoll && videoRefTrailer.name.endsWith('.mp4')) {
    //   const url = `${import.meta.env.VITE_APP_UPLOAD_URL}uploadall`
    //   const formData = new FormData()
    //   const items = Date.now()
    //   formData.append('file', videoRefTrailer)
    //   formData.append('name', `${items}`)
    //   formData.append('type', 'bae')
    //   // 截取视频使用
    //   formData.append('start', `${~~startTime}`)
    //   formData.append('end', `${~~endTime}`)
    //   formData.append(
    //     'meta',
    //     JSON.stringify({
    //       name: `${items}`,
    //       type: 'bae',
    //     })
    //   )
    //   axios.put(url, formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //       Authorization: `Bearer ${token}`,
    //     },
    //     onUploadProgress: (progressEvent: any) => {
    //       const total = progressEvent.total
    //       const current = progressEvent.loaded
    //       const percentCompleted = Math.round((current * 100) / total)
    //       console.log(`上传进度: ${percentCompleted}%`)
    //     },
    //   })
    //     .then((r2Response) => {
    //       setTrailer(r2Response.data.urls[0])
    //     })

    // }

    // if (!trailerBoll && boll) {
    //   metadata["start"] = `${~~startTime}`
    //   metadata["end"] = `${~~endTime}`
    // }

    // const upload = new tus.Upload(videoRefTrailer, {
    //   endpoint: `${import.meta.env.VITE_APP_UPLOAD_R2_URL}files`, // 你的 tus 服务器地址
    //   retryDelays: [0, 3000, 5000, 10000], // 失败时重试间隔
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //   },
    //   metadata: metadata,

    // })
    // upload.start();
    // const url = `${import.meta.env.VITE_APP_UPLOAD_IMG_URL}${videoId}.mp4`
    // setTrailer(url)
    // setLoading(false)
    // // setBoll(true)
    // setVirtualRoutePage({ name: '', enterFrom: '' })
    // return
    // setLoading(true)
    // const formData = new FormData()
    // const items = Date.now()
    // formData.append('file', videoRefTrailer)
    // formData.append('name', `${items}`)
    // formData.append('type', 'bae')
    // // 截取视频使用
    // formData.append('start', `${~~startTime}`)
    // formData.append('end', `${~~endTime}`)

    // formData.append(
    //   'meta',
    //   JSON.stringify({
    //     name: `${items}`,
    //     type: 'bae',
    //   })
    // )
  }

  const captureFrame = async () => {
    customizationVideo(trailerBoll ? videoRefTrailer : videoFile)

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
    if (virtualRoutePage?.name !== "POST") {
      video.pause()
    } else {
      video.currentTime = 0
    }
  }, [virtualRoutePage])

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
              className=" text-[#333]"
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
              onClick={() => setVirtualRoutePage({ name: 'POST', enterFrom: '/post' })}
            >
              <i className="iconfont icon-add text-[#999999] text-[20px]"></i>
            </p>
          )}
        </div>
      </div>

      {<div
        className="fixed inset-0 z-[999] bg-[#080808]"
        style={{
          paddingTop: 'calc(var(--tg-safe-area-inset-top) + 16px)',
          paddingBottom: 'var(--tg-safe-area-inset-bottom)',
          display: virtualRoutePage?.name === "POST" ? "block" : "none"
        }}
      >
        <div
          className="relative w-full h-full flex flex-col"
          style={{
            paddingTop: 'var(--tg-content-safe-area-inset-top)',
            paddingBottom: 'var(--tg-content-safe-area-inset-bottom)',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              display: loadingSkeleton ? 'block' : 'none',
            }}
          >
            <div className="flex items-center justify-center h-full pb-10">
              <i className="iconfont icon-loading animate-spin text-[#6254FF]" style={{ fontSize: '40px' }} />
            </div>
          </div>

          <div
            className="w-[100%] pb-[50px]"
            style={{
              display: loadingSkeleton ? 'none' : 'block',
            }}
          >
            <div className='flex justify-between px-[16px]'>
              <h2 className="text-[20px] text-[#FFF]">Add a preview</h2>
              <BaseButton
                text="Done"
                width="100%"
                loading={loading}
                className="h-[36px] w-[82px]"
                handler={() => captureFrame()}
              />
            </div>

            {videoUrl && (
              <div className="pt-[26px]">
                {/* Video Element */}
                <div className="relative h-[442px] min-h-[100px] overflow-hidden w-[fit-content] rounded-[8px]"
                  style={{
                    padding: landscapeBoll ? "0px" : "0px 24px"
                  }}
                >
                  <video
                    ref={videoRef}
                    src={previewVideoUrl || videoUrl}
                    style={{ width: landscapeBoll ? "100%" : '100%', minHeight: "200px" }}
                    preload="metadata"
                    className='relative top-[50%] left-[50%] transform -translate-x-[50%] -translate-y-[50%]'
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

                <div className="bg-[#080808] rounded-tl-[16px] rounded-tr-[16px] px-[24px]">
                  <p className="text-[#999] pt-[20px] pb-[12px] font-normal">
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

                  {/* <div className="px-[20px] pt-[24px] pb-[20px]">
                  <BaseButton
                    text="Done"
                    width="100%"
                    loading={loading}
                    className="h-[48px]"
                    handler={() => captureFrame()}
                  />
                </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>}
    </>
  )
}

export default AddPreview
