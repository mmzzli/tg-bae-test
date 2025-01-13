import React, { useState, useRef } from "react";

interface Frame {
  url: string;
  time: number;
  height: number;
  width: number;
}

const MobileFrameSelector: React.FC<{ frames: Frame[]; onFrameSelect: (frame: Frame) => void }> = ({
  frames,
  onFrameSelect,
}) => {
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;

    // 计算用户手指位置对应的帧索引
    const frameIndex = Math.floor((touchX / rect.width) * frames.length);

    if (frameIndex >= 0 && frameIndex < frames.length) {
      const frame = frames[frameIndex];
      setSelectedFrame(frame);
      onFrameSelect(frame);
    }
  };

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // 计算用户点击位置对应的帧索引
    const frameIndex = Math.floor((clickX / rect.width) * frames.length);

    if (frameIndex >= 0 && frameIndex < frames.length) {
      const frame = frames[frameIndex];
      setSelectedFrame(frame);  // 设置选中的帧
      onFrameSelect(frame);  // 调用传入的回调函数
    }
  };

  return (
    <div
      ref={containerRef}
      className="random-frames"
      style={{
        display: "flex",
        overflow: "hidden",
        position: "relative",
        touchAction: "none",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      {frames.map((frame, index) => (
        <img
          key={index}
          src={frame.url}
          alt={`Frame ${index}`}
          style={{
            width: "50px",
            height: "50px",
            border: selectedFrame === frame ? "2px solid #fff" : "none",  // 高亮显示选中的帧
          }}
        />
      ))}
    </div>
  );
};

export default MobileFrameSelector;
