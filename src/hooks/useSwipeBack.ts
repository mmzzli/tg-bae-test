import { useSpring } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { useNavigate } from 'react-router-dom'
import { RefObject, useEffect, useCallback } from 'react'

interface UseSwipeBackOptions {
  scrollRef: RefObject<HTMLElement>
  swipeThreshold?: number
  velocityThreshold?: number
  minSwipeDistance?: number
}

export const useSwipeBack = ({
  scrollRef,
  swipeThreshold = 100,
  velocityThreshold = 0.5,
  minSwipeDistance = 50
}: UseSwipeBackOptions) => {
  const navigate = useNavigate()
  const [{ x }, api] = useSpring(() => ({
    x: 0,
    config: {
      tension: 250,
      friction: 25,
      mass: 1,
      clamp: true
    }
  }))

  const preventScroll = useCallback((e: TouchEvent) => {
    // 只在右滑时阻止滚动
    if (x.get() > 0) {
      e.preventDefault()
    }
  }, [x])

  useEffect(() => {
    return () => {
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [preventScroll])

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity, cancel }) => {
      const scrollElement = scrollRef.current
      if (!scrollElement || scrollElement.scrollLeft > 0) {
        document.removeEventListener('touchmove', preventScroll)
        cancel()
        return
      }

      if (down) {
        // 只在开始右滑时添加阻止滚动
        if (mx > 0) {
          document.addEventListener('touchmove', preventScroll, { passive: false })
        }

        api.start({
          x: Math.max(0, mx), // 确保不会出现负值
          immediate: true,
          config: {
            tension: 250,
            friction: 25
          }
        })
      } else {
        document.removeEventListener('touchmove', preventScroll)

        const shouldGoBack =
          (xDir > 0 && mx > swipeThreshold) || // 右滑
          (velocity > velocityThreshold && mx > minSwipeDistance) // 快速右滑

        if (shouldGoBack) {
          api.start({
            x: window.innerWidth,
            immediate: false,
            config: {
              tension: 200,
              friction: 25,
              duration: 180
            },
            onRest: () => {
              navigate(-1)
            }
          })
        } else {
          api.start({
            x: 0,
            immediate: false,
            config: {
              tension: 200,
              friction: 20
            }
          })
        }
      }
    },
    {
      axis: 'x',
      bounds: { left: 0, right: window.innerWidth },
      rubberband: true,
    }
  )

  return { bind, x }
}
