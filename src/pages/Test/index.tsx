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
        // 获取 Canvas 的显示区域宽高
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // 获取视频的宽高
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // 计算保持视频比例的缩放因子
        const scale = Math.min(displayWidth / videoWidth, displayHeight / videoHeight);

        // 计算渲染到 Canvas 上的视频尺寸
        const renderWidth = videoWidth * scale;
        const renderHeight = videoHeight * scale;

        // 清空画布并渲染视频帧
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, renderWidth, renderHeight); // 绘制视频帧到 Canvas
      }
    }
  };

  // 初始化视频和时长
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        setCurrentTime(0);
      };

      const handleCanPlay = () => {
        renderFrameToCanvas(); // 渲染视频的第一帧
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("canplay", handleCanPlay);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [videoUrl]);

  // 同步滑块和视频播放时间
  const handleSliderChange = (value: React.FormEvent<HTMLInputElement>): void => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Number(value);
      setCurrentTime(Number(value));
      renderFrameToCanvas(); // 渲染当前帧
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
          {/* 视频元素 */}
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ display: "none", width: "243px", height: "315px" }} // 固定尺寸
            preload="auto" // 改为 'auto' 以便加载完整视频数据
            playsInline // 移动端内联播放
          />

          {/* 显示视频帧的 Canvas */}
          <canvas
            ref={canvasRef}
            width={243} // 固定宽度
            height={315} // 固定高度
            style={{
              border: "1px solid black",
              marginTop: "10px",
              display: "block",
              backgroundColor: "#000", // 提供黑色背景
              width: "243px", // 固定宽度
              height: "315px", // 固定高度
            }}
          ></canvas>

          {/* 时间滑块 */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={currentTime}
              onInput={(e: any) => handleSliderChange(e.target.value)} // 即时响应滑动
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
