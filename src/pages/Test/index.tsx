import React, { useState, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const VideoTrimmer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trimmedVideo, setTrimmedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoFile(e.target.files ? e.target.files[0] : null);
  };

  const trimVideo = async (start: number, duration: number) => {
    if (!videoFile) {
      alert('Please upload a video file first.');
      return;
    }

    setIsProcessing(true);

    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    // Convert the file to a format ffmpeg.js can process
    await ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));

    // Execute the trimming command
    await ffmpeg.run('-i', 'input.mp4', '-ss', `${start}`, '-t', `${duration}`, 'output.mp4');

    // Read the output file
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // Create a URL for the trimmed video
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);

    // Set the trimmed video URL for playback
    setTrimmedVideo(videoUrl);
    setIsProcessing(false);
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
      <video ref={videoRef} hidden />
    </div>
  );
};

export default VideoTrimmer;
