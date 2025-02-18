import { useSpring } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { useNavigate } from 'react-router-dom'
import { RefObject } from 'react'

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

  const preventScroll = (e: TouchEvent) => {
    e.preventDefault()
  }

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity, cancel }) => {
      const scrollElement = scrollRef.current
      if (!scrollElement || scrollElement.scrollLeft > 0) {
        cancel()
        return
      }

      if (down) {
        // 开始滑动时禁止页面滚动
        document.body.style.overflow = 'hidden'
        document.addEventListener('touchmove', preventScroll, { passive: false })

        api.start({
          x: mx,
          immediate: true,
          config: {
            tension: 250,
            friction: 25
          }
        })
      } else {
        // 结束滑动时恢复页面滚动
        document.body.style.overflow = ''
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
            onRest: () => navigate(-1)
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
