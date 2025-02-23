import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useSwiperSlide } from 'swiper/react'

import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Player, { Events } from 'xgplayer'
import Mp4Plugin from 'xgplayer-mp4'
import MobilePreset from 'xgplayer/es/presets/mobile'
import 'xgplayer/dist/index.min.css'
import { UserInfo } from '@/components/ResourceList/VideoDialog'
import { useSafeArea } from '@/hooks/useSafeArea'
import ResourceFooter from '@/components/ResourceList/ResourceFooter'
import {createVideoElement, getDeviceType, isIOS} from '@/utils/utils'
import { VideoPlayerProps } from '@/components/TT/VideoPlayer'
type VideoPlayerPropsAndIndex = VideoPlayerProps & {
  index: number
}
const VideoPlayer: React.FC<VideoPlayerPropsAndIndex> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay, activeIndex, index } = props
  const { r2: mp4Url } = sourceItem

  const swiperSlide = useSwiperSlide()

  const videoWrapperRef = useRef<HTMLDivElement | null>(null)

  const { bottom } = useSafeArea()

  const videoPlayerInit = () => {

    const playerInstance = createVideoElement();
    playerInstance.src = mp4Url;
    // playerInstance.poster = coverBaseUrl.value;
    console.log(`PLAYER.SRC => `, mp4Url);

    const videoWrapperEl = videoWrapperRef.current;
    if (videoWrapperEl) {
      const firstChild = videoWrapperEl.firstChild;

      videoWrapperEl.insertBefore(playerInstance, firstChild);
    }

  };


  const handleClose = useCallback(() => {

  }, [])



  useEffect(() => {
    if (index === activeIndex){
      videoPlayerInit()
    }
  }, [swiperSlide.isVisible, index, activeIndex])

  return (
    <div className="fixed w-full h-full object-contain z-10 bg-black inset-0" ref={videoWrapperRef}>
      <div className="pt-3" style={{ height: '11vh' }}>
        <UserInfo
          id={sourceItem?.id}
          avatar={sourceItem?.avatar}
          username={sourceItem?.username}
          content={sourceItem?.title}
          uid={sourceItem?.uid}
          info={sourceItem}
          bottom={bottom}
          is_follow={sourceItem?.is_follow}
          created_at={sourceItem?.created_at}
          onClose={handleClose}
        />
        <ResourceFooter data={sourceItem}></ResourceFooter>
      </div>
    </div>
  )
}

export default VideoPlayer
