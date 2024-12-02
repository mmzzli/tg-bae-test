import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { Box, HStack, Text } from '@chakra-ui/react'
import { formatTime } from '@/utils/utils'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import Image from '../Image/Image'
import { VideoIcon } from '@/assets/icons'
import { PlayButton } from '@/components/ResourceList/ResourceList'
import { useStore } from '@/store'
import VideoDialog from '@/components/ResourceList/VideoDialog'
import ReactPlayer from 'react-player'
import { CardRecommendProvider } from '@/utils/constants'

interface VideoCardProps {
  data: FormatterListItem
  resourcesEve: (post_id: number, url: string) => void
}
const VideoCard: React.FC<VideoCardProps> = ({ data, resourcesEve }) => {
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const setVideoResource = useStore((state) => state.setVideoResource)

  const handleVideoClick = useCallback((video: FormatterListItem) => {
    setCacheVideoIndex(video.id)
    setVideoResource(video)
  }, [])

  const cardValue = useContext(CardRecommendProvider)

  return (
    <>
      <Box className="video-card" data-id={data.id}>
        <div className="relative px-4">
          <Box position="relative">
            <Box minH={data.media?.[0] === '' ? '200px' : '130px'}>
              <Box minH={data.media?.[0] === '' ? '200px' : '130px'}>
                <Image
                  src={data.mediaCover}
                  alt={data.title}
                  wrapperClassName="rounded-[4px] overflow-hidden"
                  errorClassName="rounded-[4px] h-[150px]"
                  className="object-left w-[100%] rounded-[4px] m-[auto]"
                  onClick={() => handleVideoClick(data)}
                />
                {data.media?.[0] && <PlayButton onClick={() => handleVideoClick(data)} />}
              </Box>
              <HStack
                borderRadius="4px"
                bg="rgba(0, 0, 0, 0.20)"
                position="absolute"
                top="18px"
                left="18px"
                p="4px 8px"
                gap="4px"
              >
                <Image src={VideoIcon} />
                <Text color="#E0E2F6" fontSize="12px">
                  {formatTime(Number(data.duration))}
                </Text>
              </HStack>

              {data.media?.[0] === '' && (
                <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
              )}
            </Box>
            <HStack
              borderRadius="4px"
              bg="rgba(0, 0, 0, 0.20)"
              position="absolute"
              top="18px"
              left="18px"
              p="4px 8px"
              gap="4px"
            >
              <Image src={VideoIcon} />
              <Text color="#E0E2F6" fontSize="12px">
                {formatTime(Number(data.duration))}
              </Text>
            </HStack>
            {data.media?.[0] === '' && (
              <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
            )}
          </Box>
        </div>
      </Box>
      {/*<VideoDialog*/}
      {/*  info={data}*/}
      {/*  open={isVideoPreviewOpen}*/}
      {/*  onClose={() => setIsVideoPreviewOpen(false)}*/}
      {/*/>*/}
    </>
  )
}
export default VideoCard
