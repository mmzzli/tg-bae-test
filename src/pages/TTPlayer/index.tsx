'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Virtual, Pagination } from 'swiper/modules'
import Player from 'xgplayer'
import { useLocation } from 'react-router-dom'
import type { Swiper as SwiperType } from 'swiper'

import ImagePreview from '@/components/TT/ImageReview'
import useCacheVideo, { useRecommendList } from '@/store/hook/useResourceList'
import { destroyVideo, isIOS } from '@/utils/utils'
import VideoIosPlayer from '@/components/TT/VideoIosPlayer'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/virtual'
import './index.css'
export interface TVideo {
  url: string
  poster?: string
}

const VideoPlayer = dynamic(() => import('@/components/TT/VideoPlayer'), { ssr: false })
const TTPlayer: React.FC = () => {
  const videoRefs = useRef<{ [key: number]: Player | null }>({})
  const swiperRef = useRef<SwiperType>()
  // const { fetchMoreData } = useRecommendList()
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()
  const { list: rawList, isLoading, page, hasMore } = useStore((state) => state.recommendList)
  const setRecommendPage = useStore((state) => state.setRecommendPage)
  const list = rawList.filter((item) => item.price === 0 || item.is_pay === true || item.uid === currentUid)
  const [globalMuted, setGlobalMuted] = useState(() => false)
  const [isTouched, setIsTouched] = useState(() => false)
  const [activeIndex, setActiveIndex] = useState(0)

  const { state } = useLocation()

  const setAllMuted = useCallback((muted: boolean) => {
    if (!isTouched) setIsTouched(true)
    setGlobalMuted(muted)
  }, [])


  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setRecommendPage(page + 1)
    }
  }

  const handleVideoRef = (index: number) => (ref: Player | null) => {
    if (videoRefs.current) videoRefs.current[index] = ref
  }

  useEffect(() => {
    window.Telegram?.WebApp?.setHeaderColor(isIOS ? '#ffffff' : '#000000')

    return () =>{
      destroyVideo()
      setGlobalMuted(false)
    }
  }, [])

  useEffect(() => {
    if (list?.length && activeIndex + 2 > list?.length) {
      fetchMoreData()
    }
  }, [activeIndex])

  useEffect(() => {
    if (state?.id && list?.length > 0) {
      const index = list.findIndex((item) => item.id === state.id)
      if (index !== -1) {
        setActiveIndex(index)
        // 使用 swiperRef 来访问 Swiper 实例
        if (swiperRef.current) {
          swiperRef.current.slideTo(index, 0)
        }
      }
    }
  }, [state?.id])

  return (
    <Swiper
      className="h-full w-full z-[10] fixed top-0 left-0 bg-[#000]"
      grabCursor
      shortSwipes={true}
      longSwipesRatio={0.1} // 调整滑动切换的幅度
      threshold={20} // 调整滑动切换的幅度
      touchReleaseOnEdges
      preventInteractionOnTransition
      direction="vertical"
      virtual={{
        enabled: true,
        cache: false,
        addSlidesBefore: 1,
        addSlidesAfter: 1,
      }}
      modules={[Virtual, Pagination]}
      slidesPerView={1}
      spaceBetween={10}
      navigation={false}
      pagination={{
        type: 'progressbar',
      }}
      initialSlide={activeIndex}
      onSwiper={(swiper) => {
        swiperRef.current = swiper
      }}
      onSlideChange={(swiper) => {
        setActiveIndex(swiper.activeIndex)
      }}
    >
      {list.map((item, index) => (
        <SwiperSlide key={item.id} virtualIndex={index}>
          <>
            {item.type === 0 ? (
              <VideoIosPlayer
                key={index}
                sourceItem={item}
                setVideoRef={handleVideoRef(index)}
                autoplay={index === activeIndex}
                allMuted={globalMuted}
                setAllMuted={setAllMuted}
                isTouched={isTouched}
                index={index}
                activeIndex={activeIndex}
              />
            ) : (
              <ImagePreview
                index={index}
                activeIndex={activeIndex}
                isOpen={true}
                images={item?.media || []}
                currentIndex={0}
              />
            )}
          </>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default TTPlayer
