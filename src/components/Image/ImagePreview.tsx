import React, { useEffect, useState } from 'react'
import { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation } from 'swiper/modules'
import { X } from 'lucide-react'
import { cn } from '@/utils/utils'
import { handleZoomAndPan } from './resizeAndMove'

import 'swiper/css'

interface ImagePreviewProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)

  useEffect(() => {
    if (swiper && swiper.activeIndex !== currentIndex) {
      swiper.slideTo(currentIndex, 0)
    }
  }, [currentIndex, swiper])

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
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white opacity-60 hover:opacity-100 transition-opacity z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="absolute bottom-[91px] text-white text-sm opacity-60 z-10 w-full text-center">
        {currentIndex + 1} / {images.length}
      </div>

      <Swiper
        modules={[FreeMode, Navigation]}
        className="w-full h-full"
        initialSlide={currentIndex}
        onSwiper={setSwiper}
        onSlideChange={(swiper: SwiperType) => onIndexChange(swiper.activeIndex)}
        spaceBetween={30}
        grabCursor
        resistance
        resistanceRatio={0.65}
        speed={300}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} className="flex items-center justify-center">
            <img
              src={src}
              alt={`Image ${index + 1}`}
              className={cn(
                'max-h-[90vh] max-w-[90vw]',
                'object-contain select-none preview-image',
                'transition-transform duration-200'
              )}
              draggable={false}
              style={{ transformOrigin: 'center center' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
