import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useSwiperSlide } from 'swiper/react'

import { HStack, Image } from '@chakra-ui/react'
import { VolumeMuteIcon, VolumeSpeakerIcon } from '@/assets/icons'
import { followPreview, FormatterListItem } from '@/store/slices/resourceListSlice'
import Player, { Events } from 'xgplayer'
import HlsPlugin from 'xgplayer-hls'
import MobilePreset from 'xgplayer/es/presets/mobile'
import 'xgplayer/dist/index.min.css'

type VideoPlayerProps = {
  sourceItem: FormatterListItem
  setVideoRef: (ref: Player | null) => void
  autoplay: boolean
  allMuted: boolean
  setAllMuted: (muted: boolean) => void
  isTouched: boolean
}
const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { sourceItem, setVideoRef, allMuted, setAllMuted, autoplay } = props

  const swiperSlide = useSwiperSlide()
  const elRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<Player | null>(null)

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

    return () => {}
  }, [swiperSlide.isVisible, playerRef.current])

  useEffect(() => {
    if (elRef.current) {
      if (HlsPlugin.isSupported()) {
        // playerRef.current = new Player({
        //     plugins: [HlsPlugin],
        //     // url: 'https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/510dd4fa54144dd9a43d17ef9b5f6697/manifest/video.m3u8',
        //     // url: '/xgplayer-demo.m3u8',
        //     url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        //     el: elRef.current,
        //     useHls: true,
        //     // fluid: true,
        //     // type: 'hls',
        //     // mediaType: 'video/m3u8',
        //     hlsConfig: {
        //       enableWorker: true,  // 启用Web Worker以提高性能
        //       maxBufferLength: 30, // 最大缓冲区长度(秒)
        //       maxMaxBufferLength: 60, // 最大最大缓冲区长度(秒)
        //       startLevel: -1,     // 自动选择最佳清晰度
        //       debug: false,    // 生产环境关闭调试
        //       progressive: true,  // 启用渐进式加载
        //       manifestLoadingTimeOut: 10000, // manifest加载超时时间
        //       manifestLoadingMaxRetry: 3,    // manifest加载重试次数
        //       levelLoadingTimeOut: 10000,    // 分片加载超时时间
        //       levelLoadingMaxRetry: 3,        // 分片加载重试次数
        //       enableSoftwareAES: true,  // 启用软件 AES 解密
        //       abrEwmaDefaultEstimate: 500000, // 默认带宽估计值
        //       abrBandWidthFactor: 0.95,      // 带宽因子
        //       abrBandWidthUpFactor: 0.7,     // 带宽上升因子
        //       abrMaxWithRealBitrate: true,   // 使用实际比特率
        //       capLevelToPlayerSize: true,    // 根据播放器大小限制质量
        //       enableDateRangeMetadataCues: true, // 支持日期范围元数据
        //       enableEmsgMetadataCues: true,      // 支持 EMSG 元数据
        //       enableID3MetadataCues: true,       // 支持 ID3 元数据
        //       enableWebVTT: true,                // 支持 WebVTT 字幕
        //       enableIMSC1: true,                 // 支持 IMSC1 字幕
        //       enableCEA708Captions: true,        // 支持 CEA-708 隐藏式字幕
        //       stretchShortVideoTrack: true,      // 拉伸短视频轨道以匹配
        //       maxAudioFramesDrift: 1,            // 音频帧漂移容差
        //       forceKeyFrameOnDiscontinuity: true // 强制关键帧在不连续点
        //     },
        //     autoplay: autoplay,
        //     autoplayMuted: autoplay,
        //     width: '100%',
        //     height: '100%',
        //     loop: true,
        //     videoFillMode: 'contain',
        //     miniprogress: true,
        //     controls: false,
        //     // presets: [MobilePreset],
        //     cors: true,
        //     isLive: false,
        //     defaultPlaybackRate: 1.0,
        //     retry: 3,
        //     retryCount: 3,
        //     retryDelay: 1000,
        //     // enableWorker: true,
        //     // maxBufferHole: 0.5,
        //     // lowLatencyMode: true,
        //     hls: {
        //         retryCount: 5,
        //         retryDelay: 2000,
        //         loadTimeout: 15000,
        //         fetchOptions: {
        //             mode: 'cors',
        //             headers: {
        //                 'Access-Control-Allow-Origin': '*'
        //             }
        //         },
        //         recovery: {
        //             enabled: true,
        //             maxRetries: 3,
        //             skipAfter: 10
        //         },
        //         enableHardwareAcceleration: true, // 启用硬件加速
        //         preferHardwareDecoding: true,     // 优先使用硬件解码
        //     }
        // })

        playerRef.current = new Player({
          el: elRef.current,
          plugins: [null],
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          isLive: false,
          startTime: 0,
          autoplay: false,
          autoplayMuted: false,
          hls: {
            url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
            isLive: false,
            autoplay: false,
            autoplayMuted: false,
            retryTimes: 3,
            retryCount: 3,
            retryDelay: 1000,
            loadTimeout: 10000,
            preloadTime: 180,
            bufferBehind: 10,
            maxJumpDistance: 3,
            startTime: 0,
            fixerConfig: { forceFixLargeGap: true, largeGapThreshold: 5 },
            fetchOptions: { referrer: 'no-referrer', referrerPolicy: 'no-referrer' },
          },
        })

        playerRef.current?.on(Events.ERROR, (err) => {
          console.error('视频加载失败:', err)
          // if (playerRef.current) {
          //     playerRef.current.destroy()
          //     setTimeout(() => {
          //         playerRef.current?.play()
          //     }, 1000)
          // }
        })

        playerRef.current?.on(Events.LOADED_DATA, () => {
          console.log('视频数据加载完成')
        })

        playerRef.current?.on(Events.CANPLAY, () => {
          console.log('视频可以开始播放')
        })

        setVideoRef(playerRef.current)
      }
    }
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [])

  return (
    <>
      <div
        onClick={onVideoPress}
        ref={(ref) => {
          elRef.current = ref
        }}
      />
      <HStack
        position="absolute"
        bottom="3rem"
        right="1.25rem"
        p="0.5rem"
        gap="0.5rem"
        rounded="full"
        zIndex={10}
        bg="rgba(0, 0, 0, 0.40)"
        cursor="pointer"
        onClick={() => {
          if (playerRef.current) {
            playerRef.current.muted = !allMuted
          }
          setAllMuted(!allMuted)
          return false
        }}
      >
        {playerRef.current?.muted ? (
          <Image src={VolumeMuteIcon} className="w-[26px] h-[26px] text-white" />
        ) : (
          <Image src={VolumeSpeakerIcon} className="w-[26px] h-[26px] text-white" />
        )}
      </HStack>
    </>
  )
}

export default VideoPlayer
