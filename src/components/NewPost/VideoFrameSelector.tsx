import React, { useRef, useEffect, useState, RefObject } from 'react';
import BaseButton from '@/components/BaseButton/BaseButton'

interface Frame {
  url: string;
  time: number;
}
interface VideoPlayerProps {
  videoRef: RefObject<HTMLVideoElement>;
}

const VideoFrameSelector: React.FC<VideoPlayerProps> = ({ videoRef }) => {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);

  const extractFramesFromVideo = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    console.log(videoRef)
    console.log(video)

    const framesArray: Frame[] = [];
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth / 4;
    canvas.height = video.videoHeight / 4;

    const videoDuration = video.duration;

    const frameInterval = videoDuration / 20;

    video.currentTime = 0;

    const extractFrame = () => {
      if (video.currentTime >= videoDuration) {
        video.ontimeupdate = null;
        return;
      }

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        framesArray.push({
          url: canvas.toDataURL('image/png'),
          time: video.currentTime,
        });
        setFrames([...framesArray]);
      }

      video.currentTime += frameInterval;
    };

    video.ontimeupdate = extractFrame;

    video.play();
  };

  const handleSelectFrame = (frame: Frame) => {
    setSelectedFrame(frame);
  };
  useEffect(()=>{
    extractFramesFromVideo()
  },[videoRef])
  useEffect(()=>{
    if(frames.length === 1){
      setSelectedFrame(frames[0]);
    }
  },[frames])


  return (
    <div className='fixed w-[100%] h-[100vh] top-[0px] left-[0px] bg-[#0d0d0d] px-[16px] pt-[16px]'>
      <h2 className='text-[20px] text-[#E0E2F6]'>Select cover</h2>
      <div className='rounded-[5px] mt-[20px] overflow-hidden'>
        {selectedFrame && <img src={selectedFrame.url} alt={`Selected Frame at ${selectedFrame.time}s`} width="100%" />}
      </div>
      <div className='w-[100%] fixed bottom-[0px] left-[0px] bg-[#1C1C1C] rounded-tl-[16px] rounded-tr-[16px]'>
        <div className='px-[16px]'>
          <p className='text-center text-[#808080] pt-[28px] pb-[24px]'>Swipe left and right to choose the best cover</p>
          <div className='flex overflow-auto'>
            {frames.map((frame, index) => (
              <img
                key={index}
                src={frame.url}
                alt={`Frame at ${frame.time}s`}
                onClick={() => handleSelectFrame(frame)}
                style={{
                  cursor: 'pointer',
                  border: selectedFrame?.time === frame.time ? '2px solid #FFF' : 'none',
                }}
                width="100px"
              />
            ))}
          </div>
          <div className='px-[26px] pt-[24px] pb-[41px]'>
            <BaseButton
              text="Done"
              width="100%"
              handler={()=>{}}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFrameSelector;
