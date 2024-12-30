import React, { useState, useRef, useMemo, useEffect } from 'react'
import { cn } from '@/utils/utils'
import { DefaultAvatarIcon } from '@/assets/icons'

interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onClick'> {
  wrapperClassName?: string
  loaderClassName?: string
  errorClassName?: string
  previewClassName?: string
  previewOverlayClassName?: string
  images?: NonNullable<string>[]
  rect?: boolean
  type?: 'default' | 'avatar'
  onIndexChange?: (index: number) => void
  onClick?: () => void
}

const Image = React.memo(
  ({
    src,
    alt = 'Image',
    type = 'default',
    className,
    wrapperClassName,
    loaderClassName,
    errorClassName,
    previewClassName,
    previewOverlayClassName,
    rect = false,
    onClick,
    ...props
  }: ImageProps) => {
    const [isFirstRender, setIsFirstRender] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)

    const imageRef = useRef<HTMLImageElement>(null)

    const imageClassNames = useMemo(
      () =>
        cn(
          'transition-opacity duration-300',
          // isLoading && 'opacity-0',
          isFirstRender ? 'opacity-100' : isLoading && 'opacity-0',
          !isLoading && !hasError && 'opacity-100',
          className
        ),
      [isLoading, hasError, className, isFirstRender]
    )

    const [retryCount, setRetryCount] = useState(0)
    const maxRetries = 1

    const reloadImage = () => {
      setHasError(false)
      setIsLoading(true)
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = src as string
        } else {
          setIsLoading(false)
          setHasError(true)
        }
      }, 100)
    }

    const handleImageError = (error: any) => {
      console.error('Image load failed:', { src, error })

      if (retryCount < maxRetries) {
        console.log(`Retrying image load (${retryCount + 1}/${maxRetries})...`)
        setRetryCount((prev) => prev + 1)

        setTimeout(() => {
          if (imageRef.current) {
            imageRef.current.src = src as string
            setIsLoading(true)
          }
        }, 500)
      } else {
        setIsLoading(false)
        setHasError(true)
      }
    }

    useEffect(() => {
      if (src) setHasError(false)
    }, [src])

    useEffect(() => {
      const img = imageRef.current
      if (img && img.complete) {
        setIsLoading(false)
        setIsFirstRender(false)
      } else {
        setIsLoading(true)
      }
    }, [])

    if (!src) {
      return (
        <div className={cn('relative flex overflow-hidden', wrapperClassName)}>
          <div
            className={cn(
              'absolute inset-0 opacity-80',
              'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
              loaderClassName
            )}
          />
        </div>
      )
    }

    if (hasError) {
      if (type === 'avatar') {
        return (
          <div className={cn('w-full h-full bg-gray-200 rounded-full', errorClassName)}>
            <div
              className="rounded-[2px] overflow-hidden"
              style={{
                width: props.width ? props.width : '',
                height: props.height ? props.height : '',
              }}
            >
              <img
                ref={imageRef}
                src={DefaultAvatarIcon}
                alt={alt}
                onClick={() => onClick && onClick()}
                className={cn('w-full h-full object-cover', imageClassNames)}
                {...props}
              />
            </div>
          </div>
        )
      }
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-gray-100 text-gray-400 w-full h-full',
            wrapperClassName
          )}
          style={{ aspectRatio: rect ? 1 : '' }}
        >
          <div className={cn(errorClassName)}>
            <div className="flex flex-col items-center justify-center">
              <i
                className="iconfont icon-reset-left-line text-[#ccc] text-[42px]"
                onClick={reloadImage}
              ></i>
              <p className="mt-2">Failed to load image</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        <div
          className={cn('relative flex overflow-hidden mx-auto', wrapperClassName)}
          style={{ aspectRatio: rect ? 1 : '' }}
        >
          {rect ? (
            <div
              className="rounded-[2px] overflow-hidden"
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
                onClick={() => onClick && onClick()}
                onError={handleImageError}
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
              onClick={() => onClick && onClick()}
              onError={handleImageError}
              {...props}
            />
          )}

          {isLoading && (
            <div
              className={cn(
                'absolute inset-0 opacity-80',
                'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200',
                loaderClassName
              )}
            />
          )}
        </div>
      </>
    )
  }
)

Image.displayName = 'Image'

export default Image
