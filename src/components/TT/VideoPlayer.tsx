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
        // 视频源地址
        url: sourceItem.r2,
        // 视频封面图
        poster: sourceItem.thumbnail,
        // 播放器容器元素
        el: elRef.current,
        // 启用行内播放，防止全屏
        playsinline: true,
        autoplay,
        autoplayMuted: true,
        muted: allMuted,
        // 播放器尺寸设置
        width: '100%',
        height: '100%',
        // 循环播放
        loop: true,
        // 视频填充模式：包含
        videoFillMode: 'contain',
        // 显示迷你进度条
        miniprogress: true,
        // 禁用默认控制栏
        controls: false,
        // 使用MP4插件
        plugins: [Mp4Plugin],
        // MP4插件配置
        mp4plugin: {
          // 最大缓冲区长度(秒)
          maxBufferLength: 2,
          // 最小缓冲区长度(秒)
          minBufferLength: 2,
          // 是否禁用缓冲区断开检查
          disableBufferBreakCheck: false,
          // 等待超时时间(秒)
          waitingTimeOut: 10,
          // 缓冲区内等待超时时间(秒)
          waitingInBufferTimeOut: 1,
          // 最大等待跳转缓冲次数
          waitJampBufferMaxCnt: 2,
          // 定时器间隔(秒)
          tickInSeconds: 0.1,
          // 请求配置
          reqOptions: {
            mode: 'cors',
            method: 'GET',
          },
          // 启用Web Worker进行解码
          enableWorker: true,
          // 每个分片的大小(字节)
          chunkSize: 20480,
          // 分段时长(秒)
          segmentDuration: 1,
          // 重试次数
          retryCount: 5,
          // 重试延迟(毫秒)
          retryDelay: 100,
          // 最小处理长度(字节)
          onProcessMinLen: 256,
        },
        // 使用移动端预设配置
        presets: [MobilePreset],
      })
      // playerRef.current.on(Events.ERROR, (err) => {
      //   console.error('视频播放错误:', err)
      //     // 自定义错误文案
      //     let errorMessage = '播放出错，请稍后重试';
      //     if (err.code === 4) {
      //       errorMessage = '网络错误，请检查网络连接';
      //     } else if (err.code === 2) {
      //       errorMessage = '视频格式不支持，请尝试其他视频';
      //     }
      // })
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
