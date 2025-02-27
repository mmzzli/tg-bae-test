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
import { getDeviceType } from '@/utils/utils'
const platform = getDeviceType()
export type VideoPlayerProps = {
  sourceItem: FormatterListItem
  setVideoRef: (ref: Player | null) => void
  autoplay: boolean
  allMuted: boolean
  setAllMuted: (muted: boolean) => void
  isTouched: boolean
  activeIndex: number
  index: number
}
const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay, activeIndex, index } = props

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
    if (!swiperSlide.isVisible && playerRef.current && index !== activeIndex) {
      playerRef.current.pause()
    }

    if (
      swiperSlide.isVisible &&
      playerRef.current &&
      playerRef.current.isCanplay &&
      index === activeIndex
    ) {
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
  }, [swiperSlide.isVisible, playerRef.current, index, activeIndex])

  useEffect(() => {
    if (playerRef.current) {
      if (autoplay) {
        playerRef.current?.play()
      } else {
        playerRef.current.pause()
      }
    }
  }, [autoplay, playerRef.current])

  useEffect(() => {
    if (elRef.current) {
      const playerConfig: any = {
        el: elRef.current,
        url: sourceItem.media[0],
        poster: sourceItem.thumbnail,
        playsinline: true,
        autoplay: autoplay,
        autoplayMuted: true,
        videoInit: true,
        width: '100%',
        height: '100%',
        lang: 'en',
        loop: true,
        miniprogress: false,
        controls: false,
        closePauseVideoFocus: true,
        closePlayVideoFocus: true,
        inactive: 0,
        presets: [MobilePreset],
      }

      if (platform == 'Android') {
        playerConfig.plugins = [Mp4Plugin] // 使用 Mp4Plugin
        playerConfig.mp4plugin = {
          maxBufferLength: 3,
          minBufferLength: 3,
          disableBufferBreakCheck: true,
          waitingTimeOut: 1,
          waitingInBufferTimeOut: 1,
          waitJampBufferMaxCnt: 2,
          tickInSeconds: 0.1,
          reqOptions: {
            mode: 'cors',
            method: 'GET',
          },
          enableWorker: true,
          chunkSize: 15625,
          segmentDuration: 1,
          retryCount: 2,
          retryDelay: 100,
          onProcessMinLen: 256,
        }
      }

      console.log(playerConfig, '=====playerConfig====jacobi')

      playerRef.current = new Player(playerConfig)

      // 增加更多错误处理
      playerRef.current.on(Events.ERROR, (err) => {
        console.error('视频播放错误:', err)
        if (playerRef.current) {
          playerRef.current.destroy()
          setTimeout(() => {
            // 重新初始化播放器
            playerRef.current?.play()
          }, 2000)
        }
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
