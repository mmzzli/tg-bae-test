import React, { useState } from 'react';
import { Text, Image } from '@chakra-ui/react';
import { VideoSwitchIcon } from '@/assets/icons';

interface VideoPlayerProps {
  src: string;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, style, videoRef }) => {
  const [isHovered, setIsHovered] = useState(false);

  const togglePlayPause = () => {
    if (videoRef?.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div
      style={{ position: 'relative', width: '100%' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        width="100%"
        src={src}
        style={style}
        autoPlay
        playsInline
      />
      {isHovered && (
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
