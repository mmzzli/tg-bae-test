import React, { useState, useRef } from 'react';

const TransparentSlider = () => {
  const [selectedTime, setSelectedTime] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false); // 判断是否正在拖动

  const videoDuration = 120; // 视频总时长（秒）

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
    setSelectedTime(time);
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
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        background: 'url(https://via.placeholder.com/800x400) no-repeat center',
        backgroundSize: 'cover',
        height: '400px',
      }}
    >
      <h1 style={{ color: '#333' }}>视频封面选择器</h1>
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick} // 点击区域直接跳到时间
        style={{
          position: 'relative',
          width: '80%',
          height: '10px',
          background: 'rgba(0, 0, 0, 0.2)', // 背景改为黑色
          borderRadius: '5px',
          margin: '20px auto',
          cursor: 'pointer',
        }}
      >
        {/* 滑块 */}
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            left: `${(selectedTime / videoDuration) * 100}%`,
            width: '50px',
            height: '50px',
            border: '2px solid #00f', // 边框颜色保持不变
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // 背景色改为黑色
            borderRadius: '10px',
            transform: 'translate(-50%, 0)',
            boxShadow: '0 0 10px rgba(0, 0, 255, 0.5)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <p style={{ color: '#333' }}>选中时间：{selectedTime.toFixed(1)} 秒</p>
    </div>
  );
};

export default TransparentSlider;
