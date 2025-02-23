import React, { useEffect, useState } from 'react'
import { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation } from 'swiper/modules'
import { cn, formatImage } from '@/utils/utils'
import { handleZoomAndPan } from '@/components/Image/resizeAndMove'

import 'swiper/css'
import { useSafeState } from 'ahooks'
import {useSwiperSlide} from "swiper/swiper-react";

interface ImagePreviewProps {
  isOpen: boolean
  images: string[]
  currentIndex: number
  index:number
  activeIndex:number
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  images,
  currentIndex,
  activeIndex:wrapperActiveIndex,
  index
}) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [loading, setLoading] = useSafeState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const swiperSlide = useSwiperSlide()

  useEffect(() => {
    if (swiper && swiper.activeIndex !== currentIndex) {
      swiper.slideTo(currentIndex, 0)
      setLoading(true)
    }
  }, [currentIndex, swiper])

  useEffect(() => {
    window?.videoElement?.pause();
  }, [swiperSlide.isVisible,index,wrapperActiveIndex]);

  useEffect(() => {
    loadImage(currentIndex)
  }, [currentIndex, images])

  // load the current image
  const loadImage = (index: number) => {
    try {
      setLoading(true)
      const img = new Image()
      img.src = images[index]
      console.log(images[index])

      img.onload = () => {
        setLoading(false)
      }

      img.onerror = () => {
        console.log('444')
        setLoading(false)
      }
    } catch (e) {
      console.log(e)
      setLoading(false)
    } finally {
      // setLoading(false)
    }
  }

  // prevent scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`

      let cleanupFns: (() => void)[] = []
      if (swiper) {
        const images = document.querySelectorAll('.preview-image')
        cleanupFns = Array.from(images).map((img) =>
          handleZoomAndPan(img as HTMLImageElement, swiper)
        )
      }

      return () => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
        cleanupFns.forEach((cleanup) => cleanup())
      }
    }
  }, [isOpen, swiper])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-9 bg-black/90 backdrop-blur-sm"
    >
      {images.length > 0 && (
        <div className="absolute top-[91px] text-white text-sm opacity-80 z-10 w-full text-right pr-4">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {loading && (
        <div
          className="absolute w-full h-full flex items-center justify-center  z-100 "
          style={{ zIndex: '9', background: 'rgba(0,0,0,.15)' }}
        >
          <i className="iconfont icon-loading text-white text-[30px] animate-spin"></i>
        </div>
      )}

      <Swiper
        modules={[FreeMode, Navigation]}
        className="w-full h-full"
        initialSlide={currentIndex}
        onSwiper={setSwiper}
        spaceBetween={30}
        grabCursor
        resistance
        resistanceRatio={0.65}
        speed={300}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.activeIndex)
        }}
      >
        {images.map((src, index) => (
          <SwiperSlide
            key={index}
            className="flex items-center justify-center"
          >
            <img
              src={loading ? formatImage(src, false) : src}
              alt={`Image ${index + 1}`}
              className={cn(
                'max-h-[100vh] max-w-[100vw]',
                'object-contain select-none preview-image',
                'touch-none'
              )}
              onClick={(e) => {
                e.stopPropagation()
              }}
              draggable={false}
              style={{
                transformOrigin: 'center center',
                userSelect: 'none',
                touchAction: 'none',
                willChange: 'transform',
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default ImagePreview
