import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';


interface TrailerVideoProps {
  trailer: string | null
  setTrailer:(url:string)=>void
  previewVideoUrl: string
  videoUrl: string
}
const TrailerVideo: React.FC<TrailerVideoProps> = ({
  trailer,
  setTrailer,
  previewVideoUrl,
  videoUrl
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null); // 确定 videoRef 的类型

  // useEffect(() => {
  //   if (videoRef.current && trailer) {
  //     if (Hls.isSupported()) {
  //       const hls = new Hls();
  //       hls.loadSource(
  //         trailer
  //       );
  //       hls.attachMedia(videoRef.current);
  //       return () => {
  //         hls.destroy(); // 在组件卸载时销毁 HLS 实例
  //       };
  //     } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
  //       videoRef.current.src = trailer
  //     }
  //   }
  // }, [trailer]);

  return (
    <div className='relative'>
      <div className='w-[20px] h-[20px] right-[-6px] top-[-6px] z-10 rounded-[50px] bg-[#666] absolute flex items-center justify-center'
        onClick={()=>setTrailer("")}
      >
        <i className="iconfont icon-icon_close text-[#fff] dark:text-[#E0E2F6] text-[16px]"></i>
      </div>

      <video
        ref={videoRef}
        src={previewVideoUrl || videoUrl}
        preload="auto"
        playsInline
        className='min-w-[64px] max-w-[64px] h-[64px] bg-[#F7F9FC] rounded-md'
        style={{
          objectFit: "cover"
        }}
      />
    </div>
  );
};

export default TrailerVideo;
