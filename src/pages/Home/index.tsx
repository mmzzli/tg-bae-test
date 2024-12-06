import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'

import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import NewPostButton from '@/components/NewPost/NewPostButton'
import { debounce, throttle } from '@/utils/chat/schedulers'

const HomePage: FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Following')
  const [fadeClass, setFadeClass] = useState('fade-in')
  const [fullscreen, setFullscreen] = useState(false)
  const userInfo = useStore((state) => state.userInfo)

  const [videoOpen, setVideoOpen] = useState(false)

  const [scrollPosition, setScrollPosition] = useState(0)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const initialTitlePosition = useRef({ top: 0, left: 0 })

  const styles = {
    fadeIn: {
      opacity: 1,
      transition: 'opacity 0.3s ease-in',
    },
    fadeOut: {
      opacity: 0,
      transition: 'opacity 0.3s ease-out',
    },
  }

  const animation = useMemo(() => {
    if (userInfo.user_id !== -1 && userInfo.fans === 0) {
      return {
        animation: `slide 600ms forwards 300ms`,
      }
    }
    return {}
  }, [userInfo.user_id, userInfo.fans])

  useEffect(() => {
    const scrollDiv = document.getElementById('recommendScrollableDiv')
    if (!titleRef.current) return
    const safeAreaTop = document.documentElement.style.getPropertyValue('--tg-safe-area-inset-top')
    const contentSafeAreaTop = document.documentElement.style.getPropertyValue(
      '--tg-content-safe-area-inset-top'
    )
    initialTitlePosition.current = {
      top: 18 + parseInt(safeAreaTop) + parseInt(contentSafeAreaTop),
      left: 16,
    }

    const handleScroll = debounce(() => {
      if (!scrollDiv) return
      setScrollPosition(scrollDiv.scrollTop)
      console.log(scrollDiv.scrollTop)
    }, 50)

    scrollDiv?.addEventListener('scroll', handleScroll)
    return () => scrollDiv?.removeEventListener('scroll', handleScroll)
  }, [])

  const getTitleStyle = () => {
    if (!titleRef.current) return {}

    const maxScroll = 100
    const progress = Math.min(scrollPosition / maxScroll, 1)
    const safeAreaTop = document.documentElement.style.getPropertyValue('--tg-safe-area-inset-top')
    const targetTop = parseInt(safeAreaTop, 10)
    const targetLeft = window.innerWidth / 2 - titleRef.current.offsetWidth / 2

    const currentTop = Math.max(initialTitlePosition.current.top - scrollPosition, targetTop)
    const currentLeft =
      initialTitlePosition.current.left +
      (targetLeft - initialTitlePosition.current.left) * progress

    return {
      top: `${currentTop}px`,
      left: `${currentLeft}px`,
    }
  }

  return (
    <div
      className="relative w-full h-full overflow-auto scrollbar-hide"
      id="recommendScrollableDiv"
    >
      <div
        className="flex p-[10px_16px] fixed w-full z-[111]"
        style={{
          top: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 bg-white dark:bg-black -z-1"
          style={{
            height: `${
              parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                  '--tg-safe-area-inset-top'
                )
              ) > 0 ||
              parseInt(
                getComputedStyle(document.documentElement).getPropertyValue(
                  '--tg-content-safe-area-inset-top'
                )
              ) > 0
                ? '0'
                : '68px'
            }`,
          }}
        ></div>
        <h3
          ref={titleRef}
          style={getTitleStyle()}
          className="fixed text-black dark:text-[#E0E2F6] text-[20px] flex items-center transition-all"
        >
          {title}
        </h3>

        <div className="ml-auto flex gap-[13px] z-10">
          <div
            className="w-[48px] h-[48px] p-[12px] bg-[#F5F3F3] rounded-[50px] flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/home/searching')}
          >
            <i className="iconfont icon-search-line text-[#333333] text-[24px]"></i>
          </div>
          <NewPostButton />
        </div>
      </div>

      <div className="overflow-hidden" style={{ height: '0px', opacity: 0, ...animation }}>
        <FollowingList />
      </div>
      <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
        <div
          className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : 'mt-[68px]'}  relative ${videoOpen ? 'z-[112]' : ''}`}
        >
          <RecommendList />
        </div>
      </CardRecommendProvider.Provider>
    </div>
  )
}
export default HomePage
