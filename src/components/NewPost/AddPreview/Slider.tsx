import React, { useState, useRef, useEffect, RefObject } from 'react';
import { useToast } from '@chakra-ui/react';
import { CustomToast, typeOptions } from '@/components/comm/Toast';

interface Frame {
  url: string;
  time: number;
  height: number;
  width: number;
}

interface SliderProps {
  duration: number;
  handleSliderChange: (value: any) => void;
  setStartTime: (num: number) => void;
  setEndTime: (num: number) => void;
  trailerBoll: boolean;
  setTrailerBoll: (boll: boolean) => void;
  videoRef: RefObject<HTMLVideoElement>;
  setLoadingSkeleton: (boll: boolean) => void;
  setPreviewVideoUrl: (str: string) => void;
  previewVideoUrl:string
  startTime: number
}

const TransparentSlider: React.FC<SliderProps> = ({
  duration,
  handleSliderChange,
  setStartTime,
  setEndTime,
  trailerBoll,
  setTrailerBoll,
  videoRef,
  setLoadingSkeleton,
  setPreviewVideoUrl,
  previewVideoUrl,
  startTime
}) => {
  const toast = useToast();
  const videoRef1 = useRef<HTMLVideoElement | null>(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([]);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false); // 是否正在拖动
  const [sliderWidth, setSliderWidth] = useState(0);

  const videoDuration = duration; // 视频总时长（秒）

  // 获取 slider 宽度，确保实时更新
  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.offsetWidth);
    }
  }, [sliderRef.current, frames]);

  const calculateSelectedTime = (clientX: number) => {
    if (sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect();
      const offsetX = Math.max(0, Math.min(clientX - left, width));
      return (offsetX / width) * videoDuration;
    }
    return 0;
  };

  const updateSliderPosition = (time: number) => {
    setSelectedTime(time);
    const adjustedStart = Math.max(0, time);
    const adjustedEnd = Math.min(videoDuration, time + 6);
    console.log(adjustedStart, adjustedEnd)
    setStartTime(adjustedStart === adjustedEnd ? adjustedStart - 6 : adjustedStart);
    setEndTime(adjustedEnd);
  };

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const time = calculateSelectedTime(clientX);
    handleSliderChange(time.toFixed(1));
    updateSliderPosition(time);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (duration < 5) return;
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (duration < 5) return;
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (duration < 5) return;
    const time = calculateSelectedTime(e.clientX);
    updateSliderPosition(time);
    setTrailerBoll(false);
  };

  const extractFramesFromVideo = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const frameInterval = video.duration / 20; // 每帧间隔
    const framesArray: Frame[] = [];
    let frameCount = 0;

    const extractFrame = () => {
      if (frameCount >= 20 || video.currentTime >= video.duration) {
        video.ontimeupdate = null;
        video.pause();
        setFrames(framesArray);
        setLoadingSkeleton(false);
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      framesArray.push({
        url: canvas.toDataURL('image/png'),
        time: video.currentTime,
        height: canvas.height,
        width: canvas.width,
      });
      frameCount++;
      video.currentTime += frameInterval;
    };

    video.ontimeupdate = extractFrame;
    video.play();
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      const timer = setTimeout(() => {
        setLoadingSkeleton(true);
        extractFramesFromVideo();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [videoRef]);

  useEffect(() => {
    const video = videoRef1.current
    if (video) {
      video.currentTime = startTime // Set the initial time to the start time
    }
  },[startTime])


  return (
    <div className="w-[100%]" onClick={() => { setPreviewVideoUrl(''); setTrailerBoll(false); }}>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '64px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '5px',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
      >
        <div className='absolute left-[0px] top-[0px] w-[100%] h-[100%]'
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        ></div>
        {frames.length > 0 && (
          <div className="w-[1000%]">
            {frames.map((frame, index) => (
              <img key={index} className="w-[auto] h-[64px] float-left" src={frame.url} alt={`Frame ${index}`} />
            ))}
          </div>
        )}
        {duration <= 5 && !trailerBoll && (
          <p className="text-[18px] text-[#fff] text-center h-[60px] leading-[60px] absolute w-[100%]">Video should be over 5s.</p>
        )}
        {duration > 5 && !trailerBoll && (
          <div className='relative h-[100%]'>
          <div
            style={{
              position: 'absolute',
              overflow: 'hidden',
              top: '50%',
              left: `calc(${
                Math.min(
                  Math.max((selectedTime / videoDuration) * 100, (107 / 2) / sliderRef.current!.offsetWidth * 100),
                  100 - (107 / 2) / sliderRef.current!.offsetWidth * 100
                )
              }%)`,
              width: '107px',
              height: '60px',
              border: '2px solid #FFF',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <p className="text-[18px] text-[#fff] text-center h-[60px] leading-[60px] absolute"
              style={{
                transform: 'translate(-50%, -50%)',
                zIndex: 11,
                top: "50%",
                left: "50%"
              }}
            >5S</p>

            <div className='absolute left-[0px] top-[0px] w-[100%] h-[100%]'
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 10,
              }}
            ></div>

            <video
              ref={videoRef1}
              className='object-cover absolute top-[0px] h-[100%] w-[100%]'
              src={previewVideoUrl}
              preload="metadata"
              // autoPlay
              playsInline
              muted
            />
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransparentSlider;
