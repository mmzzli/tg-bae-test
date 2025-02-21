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
        playerRef.current?.play()
      } else {
        playerRef.current.pause()
      }
    }
  }, [autoplay, playerRef.current])

  useEffect(() => {
    if (elRef.current) {
      playerRef.current = new Player({
        // 视频源地址
        url: sourceItem.r2,
        // 视频封面图
        poster: sourceItem.thumbnail,
        thumbnail: {
          urls: [sourceItem.thumbnail || ''],
          pic_num: 1,
          col: 1,
          row: 1,
        },
        // 播放器容器元素
        el: elRef.current,
        // 启用行内播放，防止全屏
        playsinline: true,
        autoplay: autoplay,
        autoplayMuted: true,
        muted: true,
        // 播放器类型设置为H5
        videoType: 'h5',
        // 播放器尺寸设置
        width: '100%',
        height: '100%',
        // 循环播放
        loop: true,
        // 视频填充模式：包含
        videoFillMode: 'contain',
        // 显示迷你进度条
        miniprogress: false,
        // 禁用默认控制栏
        controls: false,
        // 使用MP4插件
        plugins: [Mp4Plugin],
        // MP4插件配置
        mp4plugin: {
          // 增加音频解码配置
          audioObjectType: 2, // 显式设置音频对象类型
          // 减少缓冲区大小以提高兼容性
          maxBufferLength: 1,
          minBufferLength: 0.5,
          // 是否禁用缓冲区断开检查
          disableBufferBreakCheck: false,
          // 等待超时时间(秒)
          waitingTimeOut: 10,
          // 缓冲区内等待超时时间(秒)
          waitingInBufferTimeOut: 5,
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
          // 调整分片大小
          chunkSize: 10240, // 减小分片大小
          // 分段时长(秒)
          segmentDuration: 1,
          // 增加重试次数
          retryCount: 10,
          // 重试延迟(毫秒)
          retryDelay: 200,
          // 最小处理长度(字节)
          onProcessMinLen: 256,
          // 添加错误处理选项
          errorHandling: {
            ignoreDecodeError: true,
            skipUntilKeyframe: true
          },
          // 设置预加载为自动
          preload: 'auto'
        },
        // 使用移动端预设配置
        presets: [MobilePreset],
      })

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
