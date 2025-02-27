import React, { useState, useEffect } from 'react';
import { Text, Image } from '@chakra-ui/react';
import { VideoSwitchIcon } from '@/assets/icons';

interface VideoPlayerProps {
  src: string;
  style?: React.CSSProperties;
  videoRef?: React.RefObject<HTMLVideoElement>;
  videoRefCover?: React.RefObject<HTMLVideoElement>;
  setScreenBoll:(boll:boolean)=>void
  setDurationData: (data:any)=>void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, style, videoRef, videoRefCover, setScreenBoll, setDurationData }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleVideoClick = () => {
    if(videoRef){
      const video = videoRef.current
      if (video) {
        if (isHovered) {
          video.pause()
        } else {
          video.muted = false
          video.play()
        }
      }
    }
  }

  useEffect(() => {
    if(videoRef){
      const video = videoRef.current;
      if (video) {
        const handlePlay = () => setIsHovered(true);
        const handlePause = () => setIsHovered(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
          video.removeEventListener('play', handlePlay);
          video.removeEventListener('pause', handlePause);
        };
      }
    }
  }, []);

  useEffect(() => {
    if(!videoRef) return
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDurationData({
        duration: video.duration,
        height: video.videoHeight,
        width: video.videoWidth
      })
      if(video.videoWidth < video.videoHeight){
        setScreenBoll(true)
      }else{
        setScreenBoll(false)
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [src]);

  return (
    <div
      // style={{ position: 'relative', width: '100%' }}
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      onClick={handleVideoClick}
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
      {(!isHovered) && (
        <Text
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          cursor="pointer"
          // onClick={()=>handleVideoClick()}
        >
          <Image src={VideoSwitchIcon} />
        </Text>
      )}
    </div>
  );
};

export default VideoPlayer;
