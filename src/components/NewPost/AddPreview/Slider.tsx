import React, { useState, useRef, RefObject, useEffect } from 'react';

interface Frame {
  url: string
  time: number
  height: number
  width: number
}

interface SliderProps {
  duration: number
  handleSliderChange: (value:any)=>void
  setStartTime:(num:number)=>void
  setEndTime:(num:number)=>void
  trailerBoll: boolean
  setTrailerBoll: (boll:boolean)=>void
  videoRef: RefObject<HTMLVideoElement>
  setLoadingSkeleton: (boll:boolean)=>void
  setPreviewVideoUrl: (str:string)=>void
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
  setPreviewVideoUrl
}) => {
  const [selectedTime, setSelectedTime] = useState(0);
  const [frames, setFrames] = useState<Frame[]>([])
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false); // 判断是否正在拖动

  const videoDuration = duration; // 视频总时长（秒）

  // 计算滑块当前的时间
  const getSelectedTime = (clientX: number) => {
    const slider = sliderRef.current;
    if (slider) {
      const rect = slider.getBoundingClientRect();
      const offsetX = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      return (offsetX / rect.width) * videoDuration;
    }
    return 0;
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!isDraggingRef.current) return;

    const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
    const time = getSelectedTime(clientX);
    handleSliderChange(time.toFixed(1))
    console.log(time)
    setSelectedTime(time);
    // 设置视频时长
    // console.log(time)
    if(time+6 >= videoDuration){
      setStartTime(videoDuration-6)
      setEndTime(videoDuration)
    }else{
      setStartTime(time)
      setEndTime(time + 6)
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if(duration < 5){
      return
    }
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if(duration < 5){
      return
    }
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseUp = () => {
    if(duration < 5){
      return
    }
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    if(duration < 5){
      return
    }
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleClick = (e: React.MouseEvent) => {
    if(duration < 5){
      return
    }
    const clientX = e.clientX;
    const time = getSelectedTime(clientX);
    setSelectedTime(time);
    setTrailerBoll(false)
  };

  const extractFramesFromVideo = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const framesArray: Frame[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const videoDuration = video.duration;
    const frameInterval = videoDuration / 20; // 每帧的时间间隔
    let frameCount = 0; // 记录已提取的帧数

    // 每次视频更新时提取一帧
    const extractFrame = () => {
      if (frameCount >= 20 || video.currentTime >= videoDuration) {
        video.ontimeupdate = null; // 停止事件监听
        video.pause(); // 停止视频播放
        console.log('所有帧已提取完成:', framesArray);
        setFrames(framesArray)
        setLoadingSkeleton(false)
        return;
      }

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        framesArray.push({
          url: canvas.toDataURL('image/png'),
          time: video.currentTime,
          height: canvas.height,
          width: canvas.width,
        });
        frameCount++; // 增加帧计数
        console.log(`帧 ${frameCount} 提取完成`);
      }

      video.currentTime += frameInterval; // 跳到下一帧时间点
    };

    video.ontimeupdate = extractFrame; // 绑定事件
    video.play(); // 开始播放视频以触发 ontimeupdate
  };



  useEffect(() => {
    if (videoRef && videoRef.current) {
      const timer = setTimeout(() => {
        setLoadingSkeleton(true)
        extractFramesFromVideo()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [videoRef])

  // useEffect(()=>{
  //   if(videoRef){
  //     extractFramesFromVideo()
  //   }
  // },[videoRef])

  return (
    <div className='w-[100%]' onClick={()=>{setPreviewVideoUrl("");setTrailerBoll(false)}}>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick} // 点击区域直接跳到时间
        style={{
          position: 'relative',
          width: '100%',
          height: '64px',
          background: 'rgba(0, 0, 0, 0.2)', // 背景改为黑色
          borderRadius: '5px',
          // margin: '20px auto',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        {frames.length >=1 && <div className='w-[1000%]'>
          {
            frames.map((item, key)=>(
              <img key={key} className='w-[auto] h-[64px] float-left' src={item.url}/>
            ))
          }
        </div>}
        {/* 滑块 */}
        {(!trailerBoll && duration > 5) && <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${(selectedTime / videoDuration) * 100}%`,
            width: '107px',
            height: '60px',
            border: '2px solid #FFF', // 边框颜色保持不变
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // 背景色改为黑色
            borderRadius: '8px',
            transform: 'translate(-50%, -50%)',
            // boxShadow: '0 0 10px rgba(0, 0, 255, 0.5)',
            pointerEvents: 'none',
          }}
        >
          <p className='text-[18px] text-[#fff] text-center h-[60px] leading-[60px]'>5S</p>
        </div>
        }
      </div>
      {/* <p style={{ color: '#000' }}>{selectedTime.toFixed(1)}</p> */}
    </div>
  );
};

export default TransparentSlider;
