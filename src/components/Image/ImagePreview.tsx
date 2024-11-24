import React, { useEffect, useState } from 'react'
import { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation } from 'swiper/modules'
import { X } from 'lucide-react'
import { cn, formatImage } from '@/utils/utils'
import { handleZoomAndPan } from './resizeAndMove'

import 'swiper/css'
import { useSafeState } from 'ahooks'

interface ImagePreviewProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
}) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)
  const [loading, setLoading] = useSafeState(true)

  useEffect(() => {
    if (swiper && swiper.activeIndex !== currentIndex) {
      swiper.slideTo(currentIndex, 0)
      console.log('333')
    }
  }, [currentIndex, swiper])

  useEffect(()=>{
    loadImage(currentIndex)
  },[currentIndex])

  // load the current image
  const loadImage = (index: number) => {
    try{
      console.log(images)
      const img = new Image()
      img.src = images[index]
      console.log(images[index])

      img.onload = () => {
        console.log('3333')
        setLoading(false)
      }

      img.onerror = () => {
        console.log('444')
        setLoading(false)
      }
    }catch(e){
      console.log(e)
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
      {/* loading */}
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
        onSlideChange={(swiper: SwiperType) => {
          // 加载当前大图
          setLoading(true)
          loadImage(swiper.activeIndex)
          onIndexChange(swiper.activeIndex)
        }}
        spaceBetween={30}
        grabCursor
        resistance
        resistanceRatio={0.65}
        speed={300}
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} className="flex items-center justify-center">
            <img
              src={loading ? formatImage(src,false): src}
              alt={`Image ${index + 1}`}
              className={cn(
                'max-h-[100vh] max-w-[100vw]',
                'object-contain select-none preview-image',
                'touch-none'
              )}
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
