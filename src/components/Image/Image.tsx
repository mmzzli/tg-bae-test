import React, { useState, useRef, useMemo, useEffect } from 'react'
import { cn, formatImage } from '@/utils/utils'
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

    if (hasError && type === 'avatar') {
      return (
        <div className={cn('w-full h-full bg-gray-200 rounded-full', errorClassName)}>
          <div
            className="rounded-[50%] overflow-hidden"
            style={{
              width: props.width ? props.width : '',
              height: props.height ? props.height : '',
            }}
          >
            <img
              ref={imageRef}
              src={DefaultAvatarIcon}
              alt={alt}
              className={cn('w-full h-full object-cover', imageClassNames)}
              {...props}
            />
          </div>
        </div>
      )
    }

    return (
      <>
        <div
          className={cn(
            'relative flex overflow-hidden',
            wrapperClassName,
            hasError && errorClassName
          )}
          style={{ aspectRatio: rect ? 1 : '' }}
        >
          {rect ? (
            <div
              className="rounded-[50%] overflow-hidden"
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
                onError={() => {
                  setIsLoading(false)
                  setHasError(true)
                }}
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
              onError={() => {
                setIsLoading(false)
                setHasError(true)
              }}
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

          {hasError && (
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 w-full h-full',
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
      </>
    )
  }
)

Image.displayName = 'Image'

export default Image
