import React, { useEffect, useState } from 'react'
import { Swiper as SwiperType } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation } from 'swiper/modules'
import { X } from 'lucide-react'
import { cn, formatImage } from '@/utils/utils'
import { handleZoomAndPan } from './resizeAndMove'

import 'swiper/css'
import { useSafeState } from 'ahooks'
import { useStore } from '@/store'
import { useDrag } from 'react-use-gesture'

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
  const isExpanded = useStore((state) => state.expand)

  const [translateY, setTranslateY] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (swiper && swiper.activeIndex !== currentIndex) {
      swiper.slideTo(currentIndex, 0)
      setLoading(true)
    }
  }, [currentIndex, swiper])

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

  const handlerClose = () => {
    onClose()
    setTranslateY(0)
  }

  const bind = useDrag(
    ({ down, movement: [mx, my], direction: [xDir, yDir], velocity }) => {
      setIsDragging(down)
      if (down) {
        // 实时更新位置和透明度
        setTranslateY(Math.max(0, my))
        setOpacity(Math.max(0, 1 - my / 400))
      } else if (yDir > 0 && my > 100 && velocity > 0.2) {
        // 向下滑动超过阈值时，触发关闭动画
        setTranslateY(window.innerHeight)
        setOpacity(0)
        setTimeout(handlerClose, 200)
      } else {
        // 未达到关闭阈值，回弹到原位
        setTranslateY(0)
        setOpacity(1)
      }
    },
    {
      filterTaps: true,
      from: () => [0, translateY],
    }
  )

  const bindProps = bind()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
      {...bindProps}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {!isExpanded && (
        <button
          onClick={onClose}
          className="absolute right-4 p-2 text-white opacity-60 hover:opacity-100 transition-opacity z-10"
          style={{
            top: `calc(${
              window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--tg-safe-area-inset-top') &&
              parseInt(
                window
                  .getComputedStyle(document.documentElement)
                  .getPropertyValue('--tg-safe-area-inset-top'),
                10
              ) !== 0
                ? 'var(--tg-safe-area-inset-top) + 54px'
                : '16px'
            })`,
            // paddingTop: 'var(--tg-safe-area-inset-top)',
          }}
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-[91px] text-white text-sm opacity-60 z-10 w-full text-center">
          {currentIndex + 1} / {images.length}
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
        onSlideChange={(swiper: SwiperType) => {
          // 加载当前大图
          // setLoading(true)
          onIndexChange(swiper.activeIndex)
        }}
        spaceBetween={30}
        grabCursor
        resistance
        resistanceRatio={0.65}
        speed={300}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        {images.map((src, index) => (
          <SwiperSlide
            key={index}
            className="flex items-center justify-center"
            onClick={handlerClose}
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
