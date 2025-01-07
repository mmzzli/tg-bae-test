import React, { useRef, useState, useEffect } from "react";

const VideoCoverSelector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // 视频引用
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // Canvas 引用
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // 视频 URL
  const [thumbnails, setThumbnails] = useState<string[]>([]); // 存储生成的 20 张缩略图
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
  const renderFrameToCanvas = (time: number): void => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas) {
      video.currentTime = time; // 设置视频播放时间到指定的时间点
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }
  };

  // 生成缩略图
  const generateThumbnails = (): void => {
    const video = videoRef.current;
    if (video) {
      const videoDuration = video.duration;
      const thumbCount = 20; // 生成 20 张缩略图
      const thumbnailsArr: string[] = [];

      // 生成 20 个均匀分布的时间点
      for (let i = 0; i < thumbCount; i++) {
        const time = (i / (thumbCount - 1)) * videoDuration; // 计算时间点
        const canvas = canvasRef.current;
        if (canvas) {
          renderFrameToCanvas(time); // 渲染每个时间点的帧到 canvas
          const frameData = canvas.toDataURL("image/png"); // 转换为图片
          thumbnailsArr.push(frameData);
        }
      }

      setThumbnails(thumbnailsArr); // 保存生成的缩略图
    }
  };

  // 初始化视频和时长
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleLoadedMetadata = () => {
        setDuration(video.duration);
        generateThumbnails(); // 视频加载完成后生成缩略图
      };
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoUrl]);

  // 更新当前时间
  const handleSliderChange = (value: number | string): void => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Number(value); // 设置视频播放时间
      setCurrentTime(Number(value)); // 更新当前时间状态
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

          {/* 生成的缩略图 */}
          <div style={{ marginTop: "10px", display: "flex", overflowX: "auto" }}>
            {thumbnails.map((thumbnail, index) => (
              <img
                key={index}
                src={thumbnail}
                alt={`Thumbnail ${index}`}
                style={{ width: "50px", marginRight: "10px", cursor: "pointer" }}
                onClick={() => handleSliderChange((index / (thumbnails.length - 1)) * duration)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCoverSelector;
