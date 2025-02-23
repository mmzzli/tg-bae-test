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
import {getDeviceType, isIOS} from "@/utils/utils";
import {VideoPlayerProps} from "@/components/TT/VideoPlayer";
type VideoPlayerPropsAndIndex = VideoPlayerProps & {
  index: number
}
const VideoPlayer: React.FC<VideoPlayerPropsAndIndex> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay,activeIndex,index } = props
  const { r2: mp4Url } = sourceItem

  const swiperSlide = useSwiperSlide()
  const elRef = useRef<HTMLDivElement | null>(null)

  const playerRef = useRef<HTMLVideoElement | null>(null)

  const { bottom } = useSafeArea()

  const handleClose = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pause()
    }
  }, [])

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted = allMuted
    }
  }, [allMuted, playerRef.current])

  const onVideoPress = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.paused) {
        playerRef.current.play()
        console.log('play:')
      } else {
        playerRef.current.pause()
        console.log('pause:')
      }
    }
  }, [playerRef.current])

  useEffect(() => {
    if (!swiperSlide.isVisible && playerRef.current && (activeIndex !== index)) {
      playerRef.current.pause()
    }

    if (swiperSlide.isVisible && playerRef.current && activeIndex === index) {
      if (playerRef.current) {
        console.log('can play:', playerRef.current)
        setTimeout(() => {
          playerRef.current?.play()
        }, 1000)
      }
    }

    return () => {
      if (playerRef.current) {
        console.log('pause:')
        playerRef.current.pause()
      }
    }
  }, [swiperSlide.isVisible, playerRef.current,activeIndex,index])

  useEffect(() => {
    if (playerRef.current) {
      if (autoplay) {
        playerRef.current?.play()
      } else {
        playerRef.current.pause()
      }
    }
  }, [autoplay, playerRef.current])


  return (
    <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
      <div onClick={onVideoPress} className="h-[89vh] text-white">
        <video
          ref={playerRef}
          src={mp4Url}
          autoPlay={autoplay}
          muted={true}
          controls={true}
          loop={true}
        ></video>
      </div>

  <div className="pt-3" style={{height: '11vh'}}>
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
