import React, { useState, useRef } from 'react';


interface SliderProps {
  duration: number
  handleSliderChange: (value:any)=>void
  setStartTime:(num:number)=>void
  setEndTime:(num:number)=>void
}

const TransparentSlider: React.FC<SliderProps> = ({
  duration,
  handleSliderChange,
  setStartTime,
  setEndTime
}) => {
  const [selectedTime, setSelectedTime] = useState(0);
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
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleClick = (e: React.MouseEvent) => {
    const clientX = e.clientX;
    const time = getSelectedTime(clientX);
    setSelectedTime(time);
  };

  return (
    <div className='w-[100%]'>
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
        {/* 滑块 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${(selectedTime / videoDuration) * 100}%`,
            width: '107px',
            height: '50px',
            border: '2px solid #FFF', // 边框颜色保持不变
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // 背景色改为黑色
            borderRadius: '8px',
            transform: 'translate(-50%, -50%)',
            // boxShadow: '0 0 10px rgba(0, 0, 255, 0.5)',
            pointerEvents: 'none',
          }}
        />
      </div>
      {/* <p style={{ color: '#000' }}>{selectedTime.toFixed(1)}</p> */}
    </div>
  );
};

export default TransparentSlider;
