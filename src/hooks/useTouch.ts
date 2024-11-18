import { useCallback, useRef } from 'react'

interface TouchInfo {
  startX: number
  startY: number
  startTime: number
}

interface TouchOptions {
  clickThreshold?: number
  timeThreshold?: number
  preventDefault?: boolean
  onTap?: () => void
  onTouchStartProp?: (e: React.TouchEvent) => void
  onTouchMoveProp?: (e: React.TouchEvent) => void
  onTouchEndProp?: (e: React.TouchEvent) => void
}

export function useTouch(options: TouchOptions = {}) {
  const {
    clickThreshold = 10,
    timeThreshold = 150,
    preventDefault = false,
    onTap,
    onTouchStartProp,
    onTouchMoveProp,
    onTouchEndProp,
  } = options

  const touchInfo = useRef<TouchInfo>({
    startX: 0,
    startY: 0,
    startTime: 0,
  })

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onTouchStartProp?.(e)

      const touch = e.touches[0]
      touchInfo.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }

      if (preventDefault) {
        e.preventDefault()
      }
    },
    [preventDefault, onTouchStartProp]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      onTouchMoveProp?.(e)

      if (preventDefault) {
        e.preventDefault()
      }
    },
    [preventDefault, onTouchMoveProp]
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      onTouchEndProp?.(e)

      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const endY = touch.clientY
      const endTime = Date.now()

      const { startX, startY, startTime } = touchInfo.current

      const deltaX = endX - startX
      const deltaY = endY - startY
      const deltaTime = endTime - startTime

      e.preventDefault()
      e.stopPropagation()

      if (
        deltaTime < timeThreshold &&
        Math.abs(deltaX) < clickThreshold &&
        Math.abs(deltaY) < clickThreshold
      ) {
        onTap?.()
      }

      if (preventDefault) {
        e.preventDefault()
      }
    },
    [clickThreshold, timeThreshold, preventDefault, onTap, onTouchEndProp]
  )

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}
