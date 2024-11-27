import { useCallback, useRef } from 'react'

interface TouchInfo {
  startX: number
  startY: number
  startTime: number
}
interface ClickInfo {
  startX: number
  startY: number
  startTime: number
  isMoving: boolean
}

interface TouchOptions {
  clickThreshold?: number
  timeThreshold?: number
  preventDefault?: boolean
  stopPropagation?: boolean
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
    stopPropagation = true,
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

  const clickInfo = useRef<ClickInfo>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isMoving: false,
  })

  const preventDefaultIfNeeded = (e: React.TouchEvent | React.MouseEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
  }

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      onTouchStartProp?.(e)

      const touch = e.touches[0]
      touchInfo.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      }

      preventDefaultIfNeeded(e)
    },
    [preventDefault, onTouchStartProp]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      onTouchMoveProp?.(e)

      preventDefaultIfNeeded(e)
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
      stopPropagation && e.stopPropagation()

      if (
        deltaTime < timeThreshold &&
        Math.abs(deltaX) < clickThreshold &&
        Math.abs(deltaY) < clickThreshold
      ) {
        onTap?.()
      }

      preventDefaultIfNeeded(e)
    },
    [clickThreshold, timeThreshold, preventDefault, onTap, onTouchEndProp]
  )
  const handleMouseDown = (e: React.MouseEvent) => {
    clickInfo.current.startX = e.clientX
    clickInfo.current.startY = e.clientY
    clickInfo.current.startTime = Date.now()
    clickInfo.current.isMoving = false
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const currentX = e.clientX
    const currentY = e.clientY
    const distance = Math.sqrt(
      (currentX - clickInfo.current.startX) ** 2 + (currentY - clickInfo.current.startY) ** 2
    )

    if (distance > clickThreshold) {
      clickInfo.current.isMoving = true
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const endTime = Date.now()
    const duration = endTime - clickInfo.current.startTime

    if (!clickInfo.current.isMoving && duration < timeThreshold) {
      onTap?.()
    }
  }

  return {
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  }
}
