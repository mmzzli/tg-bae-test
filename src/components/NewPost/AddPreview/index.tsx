import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'

import BaseButton from '@/components/BaseButton/BaseButton'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useStore } from '@/store'
import { uploadImgUrl } from '@/utils/env'

import Trailer from '@/components/NewPost/AddPreview/Trailer'
import Slider from '@/components/NewPost/AddPreview/Slider'

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
  setTrailer: (url:string)=>void
}

const AddPreview: React.FC<VideoPlayerProps> = ({ videoRef, setCover, videoSrc: videoUrl, setTrailer }) => {
  const [frames, setFrames] = useState<Frame[]>([])
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const token = useStore((state) => state.token)
  const [loading, setLoading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // New state to track if video is playing
  // 设置播放时间
  const [startTime, setStartTime] = useState<number>(0); // Set the start time for the video (in seconds)
  const [endTime, setEndTime] = useState<number>(6);  // Set the end time for the video (in seconds)

  const isLandscape =
    selectedFrame?.width && selectedFrame?.height
      ? selectedFrame.width > selectedFrame.height
      : false

  const renderFrameToCanvas = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
          video,
          0, 0, videoWidth, videoHeight,
          0, 0, videoWidth, videoHeight
        );
      }
    }
  };

  const handleVideoClick = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying); // Toggle the playing state
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setCurrentTime(0);
        renderFrameToCanvas();
      };

      const handleCanPlay = () => {
        renderFrameToCanvas();
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleCanPlay);

      if (video.readyState >= 3) {
        handleCanPlay();
      } else {
        video.play().then(() => video.pause()).catch(console.error);
      }

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleCanPlay);
      };
    }
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = startTime; // Set the initial time to the start time

      const handleTimeUpdate = () => {
        if (video.currentTime >= endTime) {
          video.currentTime = startTime; // Reset to start time if it exceeds the end time
        }
        setCurrentTime(video.currentTime);
        renderFrameToCanvas();
      };

      video.addEventListener("timeupdate", handleTimeUpdate);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [startTime, endTime, videoRef]);

  const handleSliderChange = (value: React.FormEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Number(value);
      setCurrentTime(Number(value));
      renderFrameToCanvas();
    }
  };

  useEffect(() => {
    if (videoRef) {
      const timer = setTimeout(() => {
        // captureFrame();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [videoRef, videoUrl]);

  const captureFrame = async () => {

    if (!videoRef.current) return;
    setLoading(true)

    const video = videoRef.current;
    video.currentTime = startTime; // 设置视频开始时间
    const stream = video.captureStream(); // 捕获视频流
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    // 处理录制数据
    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    // 录制结束后生成 Blob URL
    recorder.onstop = async() => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const clipUrl = URL.createObjectURL(blob);
      console.log(chunks, clipUrl)
      const formData = new FormData();
      const videoFile = new File([clipUrl], "asdsadsdaasssa.mp4", { type: "video/mp4" });
      console.log(videoFile)
      formData.append("file", blob); // 添加文件
      formData.append("name", videoFile.name); // 添加文件名
      formData.append("type", "bae"); // 添加类型

      // 添加 meta 数据
      formData.append(
        "meta",
        JSON.stringify({
          name: videoFile.name,
          type: "bae",
        })
      );
      console.log(formData)

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
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          const percentCompleted = Math.round((current * 100) / total)
          console.log(percentCompleted)
          if(percentCompleted>=100){
            console.log(response.data)
            const id = response.data.split('/').pop();
            setTrailer(`https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`)
            off();
            setLoading(false)
          }
        },
      })

    };
    recorder.start();

    // 播放视频并自动停止录制
    video.play();
    setTimeout(() => {
      video.pause();
      recorder.stop();
    }, (endTime - startTime) * 1000); // 按秒设置时长

    // off();
    //  startTime endTime

    // if (canvas) {
    //   const frameData = canvas.toDataURL("image/png", 1.0);
    //   const file = base64ToFile(frameData, 'image.png');

    //   const timestamp: number = new Date().getTime();
    //   const url = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${timestamp}`;

    //   const formData = new FormData();
    //   formData.append('file', file);
    //   try {
    //     const response = await axios.put(url, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });
    //     setCover(response.data);
    //   } catch (error) {
    //     console.error(`Error uploading ${file.name}:`, error);
    //   }
    // }

  };

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
      <div className="fixed bottom-[120px] left-0 w-[100%]" onClick={() => toggle()}>
        <div className="px-7 flex justify-between gap-2 flex-none">
          <div>
            <p className="text-[16px] text-[#000]">Add a preview</p>
            <p className="text-[12px] text-[#8E8E92]">You can add a preview to your locked video to entice viewers to unlock it.</p>
          </div>
          <p className='h-[64px] w-[64px] bg-[#F7F9FC] rounded-md flex-none'></p>
        </div>
      </div>

      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height={isLandscape ? '70vh' : '85vh'}
        animation={{ duration: 400, timingFunction: 'ease-in-out' }}
        theme={{ darkBackgroundColor: '#1a1a1a', lightBackgroundColor: '#ffffff', handleColor: '#d1d5db' }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="w-[100%]">
          <h2 className="text-[24px] text-[#333] mt-[24px]">Add a preview</h2>

          {videoUrl && (
            <div>
              {/* Video Element */}
              <video
                ref={videoRef}
                src={videoUrl}
                style={{ display: "block", width: "243px", height: "315px" }}
                preload="auto"
                playsInline
                onClick={handleVideoClick} // Add click handler to toggle play/pause
              />
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
                <p className="text-center text-[#999] pt-[62px] pb-[15px]">
                  Select a clip from the video to use as a preview, or upload a video from album.
                </p>

                <div className='mt-2 flex items-center gap-2'>
                  <Trailer />
                  <Slider duration={duration} handleSliderChange={handleSliderChange} setStartTime={setStartTime} setEndTime={setEndTime}/>
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
