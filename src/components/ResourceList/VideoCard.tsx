import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { Box, HStack, Text } from '@chakra-ui/react'
import { formatImage, formatTime } from '@/utils/utils'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import Image from '../Image/Image'
import { PlayButton } from '@/components/ResourceList/ResourceList'
import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useDailyTaskActions } from '@/hooks/useDailyTask'
import { VolumeMuteIcon, VolumeSpeakerIcon } from '@/assets/icons'

interface VideoCardProps {
  data: FormatterListItem
  resourcesEve: (post_id: number, url: string, is_pay?: boolean) => void
}
const VideoCard: React.FC<VideoCardProps> = ({ data, resourcesEve }) => {
  const videoCardContainer = useRef<HTMLDivElement>(null)
  const homeVideoMuted = useStore((state) => state.homeVideoMuted)
  const setHomeVideoMuted = useStore((state) => state.setHomeVideoMuted)
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const cacheVideoIndex = useStore((state) => state.cacheVideoIndex)
  const setVideoResource = useStore((state) => state.setVideoResource)
  const { runDailyWatch } = useDailyTaskActions()

  const handleVideoClick = useCallback((video: FormatterListItem) => {
    const videoDom = videoCardContainer?.current?.querySelector('video')
    runDailyWatch(video.id)
    setCacheVideoIndex(video.id)
    setVideoResource(video)
    if (videoDom) {
      videoDom.pause()
      videoDom.muted = false
    }
  }, [])
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null)

  const [playVideoTime, setPlayVideoTime] = useState(data.duration)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const handleTimeUpdate = () => {
      // 获取它的播放时间
      // videoPlayerRef.current.
      const lostTime = Number(data.duration) - (videoPlayerRef.current?.currentTime || 0)
      setPlayVideoTime(lostTime < 0 ? 0 : lostTime)
    }

    const findVideoPlayer = () => {
      videoPlayerRef.current = document.querySelector('#default-video-player')

      if (cacheVideoIndex === data.id) {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.addEventListener('timeupdate', handleTimeUpdate)

          return () => {
            if (videoPlayerRef.current) {
              videoPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate)
            }
          }
        } else {
          timeoutId = setTimeout(findVideoPlayer, 100)
        }
      } else {
        if (playVideoTime !== data.duration) {
          setPlayVideoTime(data.duration)
        }
      }
    }

    findVideoPlayer()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (videoPlayerRef.current) {
        videoPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [cacheVideoIndex])

  const { getCurrentUid } = useTMAUtils()

  const cardValue = useContext(CardRecommendProvider)

  const firImageHeight = useMemo(() => {
    const { width } = document.body.getBoundingClientRect()
    const pic_width = Number(data.width)
    const pic_height = Number(data.height)
    return (pic_height * width) / pic_width
  }, [data])
  return (
    <>
      <Box className="video-card" data-id={data.id} ref={videoCardContainer}>
        <div className="relative ">
          <Box position="relative">
            <Box>
              <div
                style={{
                  height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                  maxHeight: 'calc(62.8vh)',
                }}
                className={
                  'flex items-center overflow-hidden relative object-contain video-container z-[1]'
                }
              >
                <Image
                  src={data.mediaCover ? formatImage(data.mediaCover, false) : ''}
                  alt={data.title}
                  wrapperClassName=" overflow-hidden z-[3]"
                  errorClassName="rounded-[0px] h-[150px]"
                  className="object-left w-[100%] m-[auto]"
                  onClick={() => handleVideoClick(data)}
                />
                {data.media?.[0] && <PlayButton onClick={() => handleVideoClick(data)} />}
              </div>
              <HStack
                borderRadius="4px"
                bg="rgba(0, 0, 0, 0.40)"
                position="absolute"
                top="12px"
                right="12px"
                p="4px 10px"
                gap="4px"
                rounded="20px"
                zIndex={2}
              >
                <i className="iconfont icon-a-Frame2085661742 text-[12px] text-white"></i>
                <Text color="white" fontSize="14px">
                  {formatTime(Number(playVideoTime))}
                </Text>
              </HStack>
              <HStack
                position="absolute"
                bottom="20px"
                right="16px"
                p="5px"
                gap="4px"
                rounded="full"
                zIndex={2}
                bg="rgba(0, 0, 0, 0.40)"
                cursor="pointer"
                onClick={() => {
                  setHomeVideoMuted(!homeVideoMuted)
                }}
              >
                {homeVideoMuted ? (
                  <Image src={VolumeMuteIcon} className="w-[22px] h-[22px] text-white" />
                ) : (
                  <Image src={VolumeSpeakerIcon} className="w-[22px] h-[22px] text-white" />
                )}
              </HStack>
              {data.uid !== getCurrentUid() && data.price > 0 && !data.is_pay && (
                <>
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="100%"
                    zIndex={3}
                    style={{
                      height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                      maxHeight: 'calc(62.8vh)',
                    }}
                    overflow="hidden"
                  >
                    <Image
                      className="h-[100%] w-[100%]"
                      style={{
                        height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                        maxHeight: 'calc(62.8vh)',
                      }}
                      src={data.media[0]}
                    />
                  </Box>
                  <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
                </>
              )}
            </Box>
          </Box>
        </div>
      </Box>
    </>
  )
}
export default VideoCard
