import React, { useState } from 'react';
import { Text, Image } from '@chakra-ui/react';
import { VideoSwitchIcon } from '@/assets/icons';

interface VideoPlayerProps {
  src: string;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
  videoRefCover?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, style, videoRef, videoRefCover }) => {
  const [isHovered, setIsHovered] = useState(false);

  const togglePlayPause = () => {
    const videoElement = videoRef?.current;

    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play();
      setTimeout(() => setIsHovered(false), 100);
    } else {
      videoElement.pause();
    }
  };
  const videoEve = () => {
    setIsHovered((prev) => !prev);
  }

  return (
    <div
      // style={{ position: 'relative', width: '100%' }}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      onClick={videoEve}
    >
      <video
        ref={videoRef}
        width="100%"
        src={src}
        style={style}
        autoPlay
        playsInline
      />
      <div style={{'display':'none'}}>
      <video
        ref={videoRefCover}
        width="100%"
        src={src}
        style={style}
        autoPlay
        playsInline
        muted
      />
      </div>
      {(isHovered || videoRef?.current?.paused) && (
        <Text
          onClick={togglePlayPause}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          cursor="pointer"
        >
          <Image src={VideoSwitchIcon} />
        </Text>
      )}
    </div>
  );
};

export default VideoPlayer;
