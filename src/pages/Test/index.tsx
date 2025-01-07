import React, { useRef, useState, useEffect } from "react";

const VideoCoverSelector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // 视频引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas 引用
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // 视频 URL
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null); // 已选封面
  const [duration, setDuration] = useState<number>(0); // 视频总时长
  const [currentTime, setCurrentTime] = useState<number>(0); // 当前播放时间

  // 上传视频
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    }
  };

  // 渲染视频帧到 Canvas
  const renderFrameToCanvas = (): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
  };

  // 初始化视频和时长
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setCurrentTime(0); // 确保视频一开始时是从第 0 秒开始
        renderFrameToCanvas(); // 渲染视频的第一帧
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoUrl]);

  // 动态更新 Canvas 内容
  useEffect(() => {
    let animationFrameId: number;

    const updateCanvas = (): void => {
      renderFrameToCanvas(); // 渲染当前帧
      animationFrameId = requestAnimationFrame(updateCanvas); // 持续更新
    };

    if (videoUrl) {
      updateCanvas();
    }

    return () => {
      cancelAnimationFrame(animationFrameId); // 清理动画帧
    };
  }, [videoUrl, currentTime]); // 依赖 currentTime 以确保更新帧

  // 更新播放时间
  const handleSliderChange = (value: number | string): void => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Number(value); // 设置视频播放时间
      setCurrentTime(Number(value)); // 更新当前时间状态
    }
  };

  // 捕获当前帧作为封面
  const captureFrame = (): void => {
    const canvas = canvasRef.current;
    if (canvas) {
      const frameData = canvas.toDataURL("image/png");
      setSelectedFrame(frameData);
    }
  };

  return (
    <div>
      {/* 上传视频 */}
      <input type="file" accept="video/*" onChange={handleVideoUpload} />

      {videoUrl && (
        <div>
          {/* 隐藏的视频元素 */}
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ display: "none" }}
            onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          />

          {/* 显示视频帧的 Canvas */}
          <canvas
            className="w-[100%]"
            ref={canvasRef}
            width={640}
            height={360}
            style={{
              border: "1px solid black",
              marginTop: "10px",
              display: "block",
            }}
          ></canvas>

          {/* 时间滑块 */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={(e) => handleSliderChange(e.target.value)}
            />
          </div>

          {/* 捕获按钮 */}
          <button onClick={captureFrame}>选择当前帧作为封面</button>
        </div>
      )}

      {/* 显示选定的封面 */}
      {selectedFrame && (
        <div style={{ marginTop: "20px" }}>
          <h3>选定的封面</h3>
          <img src={selectedFrame} alt="Selected Frame" style={{ width: "200px" }} />
        </div>
      )}
    </div>
  );
};

export default VideoCoverSelector;
