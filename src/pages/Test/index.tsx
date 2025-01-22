import React, { useState, ChangeEvent } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const VideoTrimmer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trimmedVideo, setTrimmedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const ffmpeg = createFFmpeg({ log: true });

  // 加载 FFmpeg 库
  const loadFFmpeg = async (): Promise<void> => {
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }
  };

  // 处理文件上传
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files ? e.target.files[0] : null;
    setVideoFile(file);
  };

  // 视频裁剪函数
  const trimVideo = async (start: number, duration: number): Promise<void> => {
    if (!videoFile) {
      alert("Please upload a video file first.");
      return;
    }

    setIsProcessing(true);

    try {
      await loadFFmpeg();
      const fileName = videoFile.name;

      // 将视频文件写入 FFmpeg 文件系统
      ffmpeg.FS('writeFile', fileName, await fetchFile(videoFile));

      // 执行裁剪命令
      await ffmpeg.run(
        '-i', fileName,
        '-ss', start.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        'output.mp4'
      );

      // 读取输出文件
      const data:any = ffmpeg.FS('readFile', 'output.mp4');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));

      setTrimmedVideo(url);
    } catch (err) {
      console.error("Error trimming video:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h1>Video Trimmer</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <div>
        <button onClick={() => trimVideo(10, 5)} disabled={isProcessing || !videoFile}>
          Trim (Start: 10s, Duration: 5s)
        </button>
      </div>
      {isProcessing && <p>Processing...</p>}
      {trimmedVideo && (
        <div>
          <h2>Trimmed Video:</h2>
          <video src={trimmedVideo} controls width="400"></video>
        </div>
      )}
    </div>
  );
};

export default VideoTrimmer;
