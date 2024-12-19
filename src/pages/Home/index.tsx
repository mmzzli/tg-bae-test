import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'

import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import { throttle } from '@/utils/chat/schedulers'

const SCROLL_THRESHOLD = 35

const HomePage: FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Featured') // Following
  const [fadeClass, setFadeClass] = useState('fade-in')
  const [fullscreen, setFullscreen] = useState(false)
  const userInfo = useStore((state) => state.userInfo)

  const [videoOpen, setVideoOpen] = useState(false)
  const [showTopTitle, setShowTopTitle] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

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

    const handleScroll = throttle(() => {
      if (!scrollDiv) return
      const shouldShowTitle = scrollDiv.scrollTop >= SCROLL_THRESHOLD
      if (shouldShowTitle !== showTopTitle) {
        setShowTopTitle(shouldShowTitle)
        console.log('Title visibility updated to:', shouldShowTitle) // 更新日志输出
      }
    }, 40)

    scrollDiv?.addEventListener('scroll', handleScroll)
    return () => scrollDiv?.removeEventListener('scroll', handleScroll)
  }, [showTopTitle])

  const lastTapTime = useRef<number>(0)

  // 双击触发的逻辑
  const handleDoubleTap = (): void => {
    console.log('Double-tap detected!')
    const element = document.getElementById('recommendScrollableDiv')
    if (element) {
      element.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  const handleSingleClick = (): void => {
    const currentTime = Date.now()
    if (currentTime - lastTapTime.current < 300) {
      handleDoubleTap()
    }
    lastTapTime.current = currentTime
  }

  const handleDoubleClick = (): void => {
    handleDoubleTap()
  }

  const checkIfAtTop = () => {
    const element = document.getElementById('view-container');
    if (element) {
      const rect = element.getBoundingClientRect();
      if(rect.top > 0){
        setTitle("Featured")
      }else{
        setTitle("Following")
      }
    }
  };
  useEffect(() => {
    const container = document.getElementById('recommendScrollableDiv');
    if (container) {
      container.addEventListener('scroll', checkIfAtTop);
    }
    return () => {
      const container = document.getElementById('recommendScrollableDiv');
      if (container) {
        container.removeEventListener('scroll', checkIfAtTop);
      }
    };
  }, []);

  return (
    <div
      className="relative w-full overflow-auto scrollbar-hide"
      id="recommendScrollableDiv"
      style={{ height: "calc(100vh - 84px)" }}
    >
      <div
        className="flex p-[10px_16px] w-full z-[111]"
        style={{
          top: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
        onClick={handleSingleClick}
        onDoubleClick={handleDoubleClick}
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
        <div
          className="fixed bg-[#fff] z-[111] h-[40px] w-[100%] left-0 top-0"
          style={{
            paddingTop:
              'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
          }}
        >
          <div className="pl-[16px] pt-[18px]">
            <h3
              ref={titleRef}
              className="absolute text-black dark:text-[#E0E2F6] text-[20px] flex items-center duration-100 ease-out"
              style={{
                top: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top)) + 18px',
                opacity: showTopTitle ? 0 : 1,
              }}
            >
              {title}
            </h3>
            <h3
              className="fixed text-black dark:text-[#E0E2F6] text-[20px] flex items-center duration-300 ease-out"
              style={{
                opacity: showTopTitle ? 1 : 0,
                transform: `translateX(-50%)`,
                left: '50%',
                top: `${
                  showTopTitle
                    ? 'calc(var(--tg-safe-area-inset-top) + 10px)'
                    : 'calc(var(--tg-safe-area-inset-top) + 24px)'
                }`,
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        <div className="ml-auto flex gap-[13px] z-[111] relative">
          <div
            className="w-[48px] h-[48px] p-[12px] bg-[#F5F3F3] rounded-[50px] flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/home/searching')}
          >
            <i className="iconfont icon-search-line text-[#333333] text-[24px]"></i>
          </div>
        </div>
      </div>
      <div className="overflow-hidden" style={{ height: '0px', opacity: 0, ...animation }}>
        <FollowingList />
      </div>
      <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
        <div
          className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : ''}  relative ${videoOpen ? 'z-[112]' : ''}`}
        >
          <RecommendList />
        </div>
      </CardRecommendProvider.Provider>
    </div>
  )
}
export default HomePage
