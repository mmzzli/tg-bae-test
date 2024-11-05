import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/utils/utils'
import { X } from 'lucide-react'

interface TouchPosition {
  x: number
  y: number
}

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onClick'> {
  wrapperClassName?: string
  loaderClassName?: string
  errorClassName?: string
  previewClassName?: string
  previewOverlayClassName?: string
  enablePreview?: boolean
  images?: NonNullable<string>[]
  currentIndex?: number
  rect?: boolean
  onIndexChange?: (index: number) => void
  onClick?: (event: React.MouseEvent<HTMLImageElement>, index: number) => void
}

const SWIPE_THRESHOLD = 25
const TRANSITION_DURATION = 800

const Image = React.memo(
  ({
    src,
    alt = 'Image',
    className,
    wrapperClassName,
    loaderClassName,
    errorClassName,
    previewClassName,
    previewOverlayClassName,
    enablePreview = false,
    rect = false,
    images = [],
    currentIndex = 0,
    onIndexChange,
    onClick,
    ...props
  }: ImageProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)
    const [previewIndex, setPreviewIndex] = useState(currentIndex)
    const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
    const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null)
    const [isInitialRender, setIsInitialRender] = useState(true)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)

    const imageRef = useRef<HTMLImageElement>(null)
    const previewRef = useRef<HTMLImageElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const preloadedImages = useRef<HTMLImageElement[]>([])
    const windowWidth = useRef(typeof window !== 'undefined' ? window.innerWidth : 0)

    const imageList = useMemo(
      () =>
        images?.length > 0
          ? images.filter((img): img is string => typeof img === 'string' && img.length > 0)
          : [src].filter((img): img is string => typeof img === 'string' && img.length > 0),
      [images, src]
    )

    const imageSources = useMemo(
      () => ({
        currentSrc: imageList[previewIndex] ?? src,
        prevSrc: previewIndex > 0 ? imageList[previewIndex - 1] : null,
        nextSrc: previewIndex < imageList.length - 1 ? imageList[previewIndex + 1] : null,
      }),
      [imageList, previewIndex, src]
    )

    const getTransitionStyle = useCallback(
      (offset: number) => ({
        transform: `translateX(${offset}px)`,
        transition: isDragging
          ? 'none'
          : `all ${TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      }),
      [isDragging]
    )

    const getImageStyle = useCallback(
      (baseOffset: number) => {
        const offset = dragOffset + baseOffset
        const opacity = Math.min(Math.abs(dragOffset) / (windowWidth.current * 0.2), 1)

        return {
          ...getTransitionStyle(offset),
          opacity: isDragging || isTransitioning ? opacity : 0,
        }
      },
      [dragOffset, isDragging, isTransitioning, getTransitionStyle]
    )

    const preventScroll = useCallback((e: TouchEvent) => {
      e.preventDefault()
    }, [])

    useEffect(() => {
      if (isPreviewOpen) {
        const timer = setTimeout(() => {
          setIsInitialRender(false)
        }, 300)
        return () => clearTimeout(timer)
      } else {
        setIsInitialRender(true)
      }
    }, [isPreviewOpen])

    useEffect(() => {
      if (isTransitioning) {
        const timer = setTimeout(() => {
          setIsTransitioning(false)
        }, TRANSITION_DURATION)
        return () => clearTimeout(timer)
      }
    }, [isTransitioning])

    const preloadImages = useCallback(() => {
      imageList.forEach((imgSrc, index) => {
        if (index !== previewIndex) {
          const img = new window.Image()
          img.src = imgSrc
          preloadedImages.current[index] = img
        }
      })
    }, [imageList, previewIndex])

    useEffect(() => {
      if (isPreviewOpen) {
        preloadImages()
      }
    }, [isPreviewOpen, preloadImages])

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (imageList.length <= 1 || isTransitioning) return

        setIsDragging(true)
        setTouchEnd(null)
        setTouchStart({
          x: e.targetTouches[0].clientX,
          y: e.targetTouches[0].clientY,
        })
        setDragOffset(0)
      },
      [imageList.length, isTransitioning]
    )

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (!touchStart || !isDragging || imageList.length <= 1 || isTransitioning) return

        const currentTouch = {
          x: e.targetTouches[0].clientX,
          y: e.targetTouches[0].clientY,
        }
        setTouchEnd(currentTouch)

        const distanceX = touchStart.x - currentTouch.x
        const distanceY = touchStart.y - currentTouch.y
        const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

        if (isHorizontalSwipe) {
          e.preventDefault()
          e.stopPropagation()
          let offset = -distanceX

          if (previewIndex === 0 && offset > 0) {
            offset = offset * 0.3
          }

          if (previewIndex === imageList.length - 1 && offset < 0) {
            offset = offset * 0.3
          }

          setDragOffset(offset)
        } else {
          e.preventDefault()
          e.stopPropagation()
        }
      },
      [touchStart, isDragging, imageList.length, isTransitioning, previewIndex]
    )

    const handleTouchEnd = useCallback(() => {
      if (!touchStart || !touchEnd || !isDragging || isTransitioning) return

      const distanceX = touchStart.x - touchEnd.x
      const swipePercentage = (Math.abs(distanceX) / windowWidth.current) * 100

      if (swipePercentage > SWIPE_THRESHOLD) {
        if (distanceX > 0 && previewIndex < imageList.length - 1) {
          setIsTransitioning(true)
          handleNext()
        } else if (distanceX < 0 && previewIndex > 0) {
          setIsTransitioning(true)
          handlePrevious()
        }
      }

      setTouchStart(null)
      setTouchEnd(null)
      setDragOffset(0)
      setIsDragging(false)
    }, [touchStart, touchEnd, isDragging, isTransitioning, previewIndex, imageList.length])

    const handlePrevious = useCallback(() => {
      if (previewIndex > 0) {
        const newIndex = previewIndex - 1
        setPreviewIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }, [previewIndex, onIndexChange])

    const handleNext = useCallback(() => {
      if (previewIndex < imageList.length - 1) {
        const newIndex = previewIndex + 1
        setPreviewIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }, [previewIndex, imageList.length, onIndexChange])

    const handlePreviewClose = useCallback(() => {
      setIsPreviewOpen(false)
      document.body.style.overflow = 'unset'
    }, [])

    useEffect(() => {
      if (isPreviewOpen) {
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.addEventListener('touchmove', preventScroll, { passive: false })
        return () => {
          document.body.style.overflow = ''
          document.body.style.position = ''
          document.body.style.width = ''
          document.body.style.height = ''
          document.removeEventListener('touchmove', preventScroll)
        }
      }
    }, [isPreviewOpen, preventScroll])

    const imageClassNames = useMemo(
      () =>
        cn(
          'transition-opacity duration-300',
          isLoading && 'opacity-0',
          !isLoading && !hasError && 'opacity-100',
          enablePreview && !hasError && 'cursor-pointer',
          className
        ),
      [isLoading, hasError, enablePreview, className]
    )

    const previewClassNames = useMemo(
      () =>
        cn(
          'fixed inset-0 z-[9999]',
          'flex items-center justify-center',
          'bg-black/70 backdrop-blur-sm',
          'transition-all duration-300',
          'isolate',
          !isDragging && 'touch-none',
          previewOverlayClassName
        ),
      [isDragging, previewOverlayClassName]
    )

    const handleImageClick = useCallback(
      (event: React.MouseEvent<HTMLImageElement>) => {
        if (!enablePreview) {
          onClick?.(event, currentIndex)
          return
        }

        if (imageRef.current && previewRef.current) {
          const rect = imageRef.current.getBoundingClientRect()
          previewRef.current.style.setProperty('--initial-x', `${rect.left}px`)
          previewRef.current.style.setProperty('--initial-y', `${rect.top}px`)
          previewRef.current.style.setProperty('--initial-width', `${rect.width}px`)
          previewRef.current.style.setProperty('--initial-height', `${rect.height}px`)
        }
        setPreviewIndex(currentIndex)
        setIsPreviewOpen(true)
        document.body.style.overflow = 'hidden'
      },
      [enablePreview, onClick, currentIndex]
    )

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (!isPreviewOpen) return

        switch (event.key) {
          case 'ArrowLeft':
            if (!isTransitioning && previewIndex > 0) {
              setIsTransitioning(true)
              handlePrevious()
            }
            break
          case 'ArrowRight':
            if (!isTransitioning && previewIndex < imageList.length - 1) {
              setIsTransitioning(true)
              handleNext()
            }
            break
        }
      },
      [isPreviewOpen, isTransitioning, previewIndex, imageList.length, handlePrevious, handleNext]
    )

    useEffect(() => {
      if (isPreviewOpen) {
        window.addEventListener('keydown', handleKeyDown)
        return () => {
          window.removeEventListener('keydown', handleKeyDown)
        }
      }
    }, [isPreviewOpen, handleKeyDown])

    return (
      <>
        <div className={cn('relative flex overflow-hidden', wrapperClassName)}>
          {rect ? (
            <div
              className="rounded-[4px] overflow-hidden"
              style={{
                width: props.width ? props.width : '',
                height: props.height ? props.height : '',
              }}
            >
              <img
                ref={imageRef}
                src={src}
                alt={alt}
                className={cn('w-full h-full object-cover', imageClassNames)}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
                onClick={(e) => !hasError && handleImageClick(e)}
                {...props}
              />
            </div>
          ) : (
            <img
              ref={imageRef}
              src={src}
              alt={alt}
              className={imageClassNames}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false)
                setHasError(true)
              }}
              onClick={(e) => !hasError && handleImageClick(e)}
              {...props}
            />
          )}

          {isLoading && (
            <div
              className={cn(
                'absolute inset-0',
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
                loaderClassName
              )}
            />
          )}

          {hasError && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400',
                errorClassName
              )}
            >
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <p className="mt-2">Failed to load image</p>
              </div>
            </div>
          )}
        </div>

        {isPreviewOpen && !hasError && enablePreview && (
          <div className={previewClassNames} onClick={handlePreviewClose}>
            <button
              onClick={handlePreviewClose}
              className="absolute top-4 right-4 p-2 text-white opacity-60 hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute bottom-[91px] text-white text-sm opacity-60 z-10">
              {previewIndex + 1} / {imageList.length}
            </div>

            <div
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {imageSources.prevSrc && (
                <img
                  src={imageSources.prevSrc}
                  alt={`Previous ${alt}`}
                  className="absolute max-h-[90vh] max-w-[90vw] object-contain select-none"
                  style={getImageStyle(-windowWidth.current)}
                  draggable="false"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              <img
                ref={previewRef}
                src={imageSources.currentSrc}
                alt={alt}
                style={
                  {
                    ...getTransitionStyle(dragOffset),
                    '--initial-x': '0px',
                    '--initial-y': '0px',
                    '--initial-width': '0px',
                    '--initial-height': '0px',
                  } as React.CSSProperties
                }
                className={cn(
                  'max-h-[90vh] max-w-[90vw] object-contain select-none',
                  isInitialRender && !isDragging && 'origin-top-left animate-zoom-in',
                  previewClassName
                )}
                onClick={(e) => e.stopPropagation()}
                draggable="false"
                onDragStart={(e) => e.preventDefault()}
              />

              {imageSources.nextSrc && (
                <img
                  src={imageSources.nextSrc}
                  alt={`Next ${alt}`}
                  className="absolute max-h-[90vh] max-w-[90vw] object-contain select-none"
                  style={getImageStyle(windowWidth.current)}
                  draggable="false"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>
        )}
      </>
    )
  }
)

Image.displayName = 'Image'

export default Image
