'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { ChakraProvider } from '@chakra-ui/react'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual } from 'swiper/modules'
import Player from 'xgplayer'
import { useLocation } from 'react-router-dom'
import 'swiper/css'
import ImagePreview from '@/components/TT/ImageReview'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
const VideoPlayer = dynamic(() => import('@/components/TT/VideoPlayer'), { ssr: false })

export interface TVideo {
  url: string
  poster?: string
}

const TTPlayer: React.FC = () => {
  const videoRefs = useRef<Array<Player | null>>([])
  const { list, hasMore, fetchMoreData, page, refresh, isLoading } = useRecommendList()
  const [globalMuted, setGlobalMuted] = useState(() => false)
  const [isTouched, setIsTouched] = useState(() => false)
  const [activeIndex, setActiveIndex] = useState(0)

  const { state } = useLocation()

  const setAllMuted = useCallback((muted: boolean) => {
    if (!isTouched) setIsTouched(true)
    setGlobalMuted(muted)
  }, [])

  const handleVideoRef = (index: number) => (ref: Player | null) => {
    if (videoRefs.current) videoRefs.current[index] = ref
  }

  console.log('list...', list)

  // useEffect(() => {
  //   if (list?.length && ((activeIndex + 2) > list?.length)) {
  //     fetchMoreData()
  //   }
  // }, [activeIndex])

  useEffect(() => {
    if (state.id != undefined) {
      console.log('setActiveIndex...', state.id)
      const index = list.findIndex((item) => item.id === state.id)
      console.log('setActiveIndex...', index)
      setActiveIndex(index)
    }
  }, [state])

  return (
    <Swiper
      className="h-full w-full z-[10] fixed top-0 left-0"
      grabCursor
      shortSwipes={false}
      longSwipesRatio={0.33}
      threshold={20}
      touchReleaseOnEdges
      preventInteractionOnTransition
      direction="vertical"
      // initialSlide={2}
      virtual={{
        enabled: true,
        cache: false,
        addSlidesBefore: 1,
        addSlidesAfter: 1,
      }}
      modules={[Virtual]}
      // onSwiper={(swiper) => (window.swiper = swiper)}
      slidesPerView={1}
      spaceBetween={10}
      navigation={false}
      pagination={false}
      onSlideChange={(swiper) => {
        // setActiveIndex(swiper.activeIndex)
      }}
      onReachEnd={(swiper) => {
        // console.log('swiper1111:', swiper.slideTo)
      }}
    >
      {list.map((item, index) => (
        <SwiperSlide key={`${index}`}>
          {item.type === 0 ? (
            <VideoPlayer
              key={index}
              sourceItem={item}
              setVideoRef={handleVideoRef(index)}
              autoplay={index === activeIndex}
              allMuted={globalMuted}
              setAllMuted={setAllMuted}
              isTouched={isTouched}
              activeIndex={activeIndex}
            />
          ) : (
            <ImagePreview
              isOpen={true}
              images={item?.media || []}
              currentIndex={0}
            />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default TTPlayer
