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

type VideoPlayerProps = {
  sourceItem: FormatterListItem
  setVideoRef: (ref: Player | null) => void
  autoplay: boolean
  allMuted: boolean
  setAllMuted: (muted: boolean) => void
  isTouched: boolean
  activeIndex: number
}
const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay } = props

  const swiperSlide = useSwiperSlide()
  const elRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<Player | null>(null)
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

  useEffect(() => {
    if (autoplay && playerRef.current) {
      playerRef.current.play()
    }
  }, [autoplay, playerRef.current])

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
    if (!swiperSlide.isVisible && playerRef.current) {
      playerRef.current.pause()
    }

    if (swiperSlide.isVisible && playerRef.current && playerRef.current.isCanplay) {
      playerRef.current.play()
    }

    return () => {
      if (playerRef.current) {
        console.log('pause:')
        playerRef.current.pause()
      }
    }
  }, [swiperSlide.isVisible, playerRef.current])

  useEffect(() => {
    if (playerRef.current) {
      if (autoplay) {
        playerRef.current.play()
      } else {
        playerRef.current.pause()
      }
    }
  }, [autoplay])

  useEffect(() => {
    if (elRef.current) {
      playerRef.current = new Player({
        url: sourceItem.r2,
        poster: sourceItem.avatar,
        el: elRef.current,
        playsinline: true,
        autoplay: false,
        autoplayMuted: false,
        width: '100%',
        height: '100%',
        loop: true,
        videoFillMode: 'contain',
        miniprogress: true,
        controls: false,
        plugins: [Mp4Plugin],
        mp4plugin: {
          maxBufferLength: 2,
          minBufferLength: 2,
          disableBufferBreakCheck: false,
          waitingTimeOut: 10,
          waitingInBufferTimeOut: 1,
          waitJampBufferMaxCnt: 2,
          tickInSeconds: 0.1,
          reqOptions: {
            mode: 'cors',
            method: 'GET',
          },
          enableWorker: true,
          chunkSize: 20480,
          segmentDuration: 1,
          retryCount: 5,
          retryDelay: 100,
          onProcessMinLen: 256,
        },
        presets: [MobilePreset],
      })
      setVideoRef(playerRef.current)
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.pause()
        playerRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="fixed w-full h-full object-contain z-10 bg-black inset-0">
      <div
        onClick={onVideoPress}
        ref={(ref) => {
          elRef.current = ref
        }}
        className="h-[89vh]"
      >
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
      </div>
      <div className="pt-3" style={{ height: '11vh' }}>
        <ResourceFooter data={sourceItem}></ResourceFooter>
      </div>
    </div>
  )
}

export default VideoPlayer
