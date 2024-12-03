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
        <div className="relative ">
          <Box position="relative">
            <Box minH={data.media?.[0] === '' ? '200px' : '130px'}>
              <Box minH={data.media?.[0] === '' ? '200px' : '130px'}>
                <Image
                  src={data.mediaCover}
                  alt={data.title}
                  wrapperClassName=" overflow-hidden"
                  errorClassName="rounded-[0px] h-[150px]"
                  className="object-left w-[100%] m-[auto]"
                  onClick={() => handleVideoClick(data)}
                />
                {data.media?.[0] && <PlayButton onClick={() => handleVideoClick(data)} />}
              </Box>
              <HStack
                borderRadius="4px"
                bg="rgba(0, 0, 0, 0.40)"
                position="absolute"
                top="12px"
                right="12px"
                p="4px 10px"
                gap="4px"
                rounded="20px"
              >
                <i className="iconfont icon-a-Frame2085661742 text-[12px] text-white"></i>
                <Text color="#E0E2F6" fontSize="14px">
                  {formatTime(Number(data.duration))}
                </Text>
              </HStack>

              {data.media?.[0] === '' && (
                <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
              )}
            </Box>
          </Box>
        </div>
      </Box>
    </>
  )
}
export default VideoCard
