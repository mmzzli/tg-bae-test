import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'

import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import { throttle } from '@/utils/chat/schedulers'
import { PullToRefresh } from 'antd-mobile'
import { useToast } from '@chakra-ui/react'
import loadingGif from '@/assets/loading.gif'

interface ChildRef {
  refresh: () => void
  scrollToIndex: (index: number) => void
}

const SCROLL_THRESHOLD = 35

const HomePage: FC = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('Discover') // Following
  const userInfo = useStore((state) => state.userInfo)

  const [videoOpen, setVideoOpen] = useState(false)
  const [showTopTitle, setShowTopTitle] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const childRef = useRef<ChildRef>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const { ttMode, setTtMode } = useStore((state) => ({
    ttMode: state.ttMode,
    setTtMode: state.setTtMode,
  }))

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
      setShowTopTitle(shouldShowTitle)
      // console.log('Title visibility updated to:', shouldShowTitle)
      // if (shouldShowTitle !== showTopTitle) {
      //   setShowTopTitle(shouldShowTitle)
      //   console.log('Title visibility updated to:', shouldShowTitle) // 更新日志输出
      // }
    }, 40)

    scrollDiv?.addEventListener('scroll', handleScroll)
    return () => scrollDiv?.removeEventListener('scroll', handleScroll)
  }, [showTopTitle])

  const lastTapTime = useRef<number>(0)

  // 双击触发的逻辑
  const handleDoubleTap = (): void => {
    console.log('Double-tap detected!')
    // const element = document.getElementById('recommendScrollableDiv')
    // if (element) {
    //   element.scrollTo({
    //     top: 0,
    //     behavior: 'smooth',
    //   })
    // }
    childRef.current?.scrollToIndex(0)
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
  const handleRefresh = async () => {
    childRef.current?.refresh()
  }

  const [clickCount, setClickCount] = useState(0)
  const clickTimeoutRef = useRef<NodeJS.Timeout>()

  const consecutiveHits = () => {
    console.log('env', import.meta.env.PROD)
    if (import.meta.env.MODE === 'production') {
      return
    }
    setClickCount((prev) => prev + 1)
    // 清除之前的定时器
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current)
    }
    // 设置新的定时器，1秒后重置点击次数
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCount + 1 >= 6) {
        setTtMode(!ttMode)
        toast({
          title: !ttMode ? 'Switched to TT mode' : 'Switched to recommendation mode',
          status: 'success',
        })
      }
      setClickCount(0)
    }, 1000)
  }

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="relative w-full overflow-auto scrollbar-hide"
      id="recommendScrollableDiv"
      style={{
        height:
          'calc(100vh - 84px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top))',
      }}
      ref={containerRef}
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
          className="fixed bg-[#fff] z-[111] h-[68px] w-[100%] left-0 top-0"
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
              onClick={(e) => {
                e.stopPropagation()
                consecutiveHits()
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
        <div className="h-[48px] relative">
          <div
            className={`ml-auto flex gap-[13px] z-[111] ${showTopTitle ? 'absolute right-[16px]' : 'fixed right-[16px]'}`}
          >
            <div
              className="w-[48px] h-[48px] p-[12px] flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/searching')}
            >
              <i className="iconfont icon-search-line text-[#333333] text-[24px]"></i>
            </div>
          </div>
        </div>
      </div>

      <PullToRefresh
        onRefresh={handleRefresh}
        renderText={(status) => {
          return (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              {/* <div
                className={`w-5 h-5 border-2 border-t-2 border-transparent rounded-full animate-spin border-t-[#6254FF]`}
              ></div> */}
              <img
                style={{
                  width: '32px',
                  height: '32px',
                }}
                src={loadingGif}
                alt="loading"
              />
            </div>
          )
        }}
      >
        <div className="overflow-hidden" style={{ height: '0px', opacity: 0, ...animation }}>
          <FollowingList />
        </div>
        <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
          <div
            className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : ''}  relative ${videoOpen ? 'z-[112]' : ''}`}
          >
            <RecommendList ref={childRef} containerRef={containerRef} />
          </div>
        </CardRecommendProvider.Provider>
      </PullToRefresh>
    </div>
  )
}
export default HomePage
