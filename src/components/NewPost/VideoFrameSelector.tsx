import React, { useRef, useEffect, useState, RefObject, Dispatch, SetStateAction } from 'react'
import { useBoolean, Text } from '@chakra-ui/react'
import axios, { AxiosResponse } from 'axios'

import BaseButton from '@/components/BaseButton/BaseButton'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useStore } from '@/store'
import { uploadImgUrl } from '@/utils/env'
import Slider from '@/components/NewPost/AddPreview/Slider1'
import { SkeletonShine } from '@/components/Skeketon/ChatSkeleton'

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

const VideoFrameSelector: React.FC<VideoPlayerProps> = ({ videoRef, setCover, videoSrc: videoUrl }) => {
  const [frames, setFrames] = useState<Frame[]>([])
  // const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)
  const token = useStore((state) => state.token)
  const [loading, setLoading] = useState(false)
  const [loadingSkeleton, setLoadingSkeleton] = useState(true)
  const [ landscape, setLandscape ] = useState(false)


  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [coverImg, setCoverImg] = useState('')

  const isLandscape =
    selectedFrame?.width && selectedFrame?.height
      ? selectedFrame.width > selectedFrame.height
      : false

  const renderFrameToCanvas = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    console.log(video, canvas, 'talk1')
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Use the original size of the video for the canvas size
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set canvas size to match the video size
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        // Clear the canvas before drawing the new frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the current video frame onto the canvas at its original size
        ctx.drawImage(
          video,
          0, 0, videoWidth, videoHeight, // Original video dimensions
          0, 0, videoWidth, videoHeight  // Draw the frame at the same size as the video
        );
      }
    }
  };



  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        console.log("Metadata loaded");
        setDuration(video.duration);
        setCurrentTime(0);
        renderFrameToCanvas();
      };

      const handleCanPlay = () => {
        console.log("Video can play");
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


  const handleSliderChange = (value: React.FormEvent<HTMLInputElement>, coverImgData: any): void => {
    if (coverImgData) {
      setCoverImg(coverImgData.url)
    }
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
        captureFrame()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [videoRef, videoUrl])

  // 捕获当前帧作为封面
  const captureFrame = async () => {
    const canvas = canvasRef.current;
    off();
    if (canvas) {
      // Get the frame as a PNG image at the video's full size
      // const frameData = canvas.toDataURL("image/png", 1.0);
      const file = base64ToFile(coverImg, 'image.png');
      console.log(file);

      const timestamp: number = new Date().getTime();
      const url = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${timestamp}`;

      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        });
        setCover(response.data);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
      }
    }
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

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      const handleMetadataLoaded = () => {
        const { videoWidth, videoHeight } = videoElement;
        if (videoWidth >= videoHeight) {
          setLandscape(true)
        } else {
          setLandscape(false)
        }
      };
      videoElement.addEventListener("loadedmetadata", handleMetadataLoaded);
      return () => {
        videoElement.removeEventListener("loadedmetadata", handleMetadataLoaded);
      };
    }
  }, []);

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
        // height={isLandscape ? '70vh' : '85vh'}
        style={{
          maxHeight: isLandscape ? '70vh' : '85vh',
          height: 'auto',
          overflow: 'auto',
        }}
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

          <div className='w-[100%]'
            style={{
              display:loadingSkeleton ? 'block' : 'none'
            }}
          >
            <div className="h-[315px] w-[100%] relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727] rounded w-2/3">
              <SkeletonShine />
            </div>
            <div className="h-[100px] w-[100%] mt-8 relative overflow-hidden bg-[#F4F4F4] dark:bg-[#272727] rounded w-2/3">
              <SkeletonShine />
            </div>
          </div>

          {videoUrl && (
            <div
              style={{
                display:loadingSkeleton ? 'none' : 'block'
              }}
            >
              {/* 视频元素 */}
              <div className='overflow-hidden w-[fit-content] bg-[#666]'>
                <video
                  ref={videoRef}
                  // style={{ width: !landscape ? '243px': '100%' }}
                  style={{ width: '243px', display: "none" }}
                  src={videoUrl}
                  preload="metadata"
                  playsInline
                  muted
                />
              </div>
              <canvas
                ref={canvasRef}
                width={243}
                // height={315}
                style={{
                  marginTop: "16px",
                  // display: "none",

                  width: "243px",
                  // height: "315px",
                  display: "none"
                }}
              ></canvas>
              <img
                 style={{
                  marginTop: "16px",
                  // display: "none",
                  width: "243px",
                }}
                src={coverImg}
              />



              <div className="bg-[#fff] rounded-tl-[16px] rounded-tr-[16px]">
                <p className="text-center text-[#999] pt-[32px] pb-[15px]">
                  Swipe left and right to choose the best cover
                </p>

                <div style={{ marginTop: "10px" }}>
                  {/* <input
                    className='w-[100%]'
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onInput={(e: any) => handleSliderChange(e.target.value)}
                  /> */}
                  <Slider duration={duration} handleSliderChange={handleSliderChange} videoRef={videoRef} setLoadingSkeleton={setLoadingSkeleton} isBaseModalOpen={isBaseModalOpen} />
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

              {/* 时间滑块 */}
              {/* <div style={{ marginTop: "10px" }}>
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onInput={(e: any) => handleSliderChange(e.target.value)} // 即时响应滑动
                />
              </div> */}

              {/* 捕获按钮 */}
              {/* <button onClick={captureFrame}>选择当前帧作为封面</button> */}
            </div>
          )}

          {/* 显示选定的封面 */}
          {/* {selectedFrame && (
            <div style={{ marginTop: "20px" }}>
              <h3>选定的封面</h3>
              <img src={selectedFrame} alt="Selected Frame" style={{ width: "200px" }} />
            </div>
          )} */}

        </div>
      </BaseModal>
    </>
  )
}

export default VideoFrameSelector
