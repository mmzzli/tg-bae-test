'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ChakraProvider } from '@chakra-ui/react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual, Mousewheel } from 'swiper/modules'
import Player from 'xgplayer'

import 'swiper/css'

import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
const VideoPlayer = dynamic(() => import('@/components/TT/VideoPlayer'), { ssr: false })

export interface TVideo {
  url: string
  poster?: string
}



const TTPlayer: React.FC = () => {
  const videoRefs = useRef<Array<Player | null>>([])
  const { list, hasMore, fetchMoreData, page, refresh, isLoading } = useRecommendList()
  const [globalMuted, setGlobalMuted] = useState(() => true)
  const [isTouched, setIsTouched] = useState(() => false)

  const setAllMuted = useCallback((muted: boolean) => {
    if (!isTouched) setIsTouched(true)
    setGlobalMuted(muted)
  }, [])

  const handleVideoRef = (index: number) => (ref: Player | null) => {
    if (videoRefs.current) videoRefs.current[index] = ref
  }

  console.log(list, '=======jacob')

  return (
      <Swiper
        className="h-full w-full z-[10] fixed top-0 left-0"
        grabCursor
        shortSwipes={false}
        longSwipesRatio={0.33}
        threshold={0}
        touchReleaseOnEdges
        preventInteractionOnTransition
        direction="vertical"
        virtual={{
          enabled: true,
          cache: false,
          addSlidesBefore: 1,
          addSlidesAfter: 1,
        }}
        modules={[Virtual, Mousewheel]}
        // onSwiper={(swiper) => (window.swiper = swiper)}
        slidesPerView={1}
        spaceBetween={10}
        mousewheel={{
          enabled: true,
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true,
          thresholdDelta: 80,
          thresholdTime: 300,
        }}
        navigation={false}
        pagination={false}
        onReachEnd={(swiper) => {
          console.log('swiper:', swiper)
        }}
      >
        {list.map((item, index) => (
          <SwiperSlide key={`${index}`}>
            <VideoPlayer
              key={index}
              sourceItem={item}
              setVideoRef={handleVideoRef(index)}
              autoplay={index === 0}
              allMuted={globalMuted}
              setAllMuted={setAllMuted}
              isTouched={isTouched}
            />
          </SwiperSlide>
        ))}
      </Swiper>
  )
}

export default TTPlayer
