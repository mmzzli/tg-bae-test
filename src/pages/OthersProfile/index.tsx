import { FC, useState, useRef, useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { animated } from '@react-spring/web'
import OtherUserProfile from '@/components/PersonalDetails/OtherUserProfile'
import useCacheVideo, { useOthersViewList } from '@/store/hook/useResourceList'
import PostList from '@/components/PostList/PostList'
import { useStore } from '@/store'
import { throttle } from '@/utils/chat/schedulers'
import { useSwipeBack } from '@/hooks/useSwipeBack'
// import { useTMAUtils } from '@/hooks/useTMAUtils'

const SCROLL_THRESHOLD = 214
const SWIPE_THRESHOLD = 100
const SCROLL_HEADER_THRESHOLD = 120

const OthersProfile: FC = () => {
  const navigate = useNavigate()
  const { list, hasMore, fetchMoreData, page } = useOthersViewList()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const getCacheVideoindex = useStore((state) => state.cacheVideoIndex)
  const updateCacheVideo = useStore((state) => state.updateCacheVideo)
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const { userInfo } = useStore((state) => ({
    userInfo: state.othersUserInfo,
  }))
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showTopTitle, setShowTopTitle] = useState(false)
  const [showHeader, setShowHeader] = useState(false)

  const [scale, setScale] = useState(1) // 控制背景图片的缩放

  const { bind, x } = useSwipeBack({
    scrollRef: scrollDivRef,
  })

  const imgUrl =
    userInfo?.background_img && userInfo?.background_img.url
      ? userInfo?.background_img.url
      : '/src/assets/image/profile/bg-header.png'

  useCacheVideo(
    list,
    page,
    setCacheVideoIndex,
    getCacheVideoindex,
    updateCacheVideo,
    'profileScrollableDiv',
    'video-card'
  )

  useEffect(() => {
    const scrollDiv = scrollDivRef.current
    if (!scrollDiv) return
    if (!titleRef.current) return

    const handleScroll = throttle(() => {
      const scrollTop = scrollDiv.scrollTop
      console.log('scrollTop', scrollTop)

      // 控制标题显示
      const shouldShowTitle = scrollTop >= SCROLL_THRESHOLD
      const shouldShowHeader = scrollTop >= SCROLL_HEADER_THRESHOLD

      setShowTopTitle(shouldShowTitle)
      setShowHeader(shouldShowHeader)
      if (shouldShowHeader) {
        window.Telegram?.WebApp?.setHeaderColor('#ffffff')
      } else {
        window.Telegram?.WebApp?.setHeaderColor('#000000')
      }

      // 下拉放大背景图片
      const pullDownOffset = Math.min(scrollTop, 0) // 限制为负值
      const newScale = 1 - pullDownOffset / 300 // 最大放大到 1.3 倍
      setScale(newScale)
    }, 40)

    scrollDiv.addEventListener('scroll', handleScroll)
    return () => scrollDiv.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <animated.div
      {...bind()}
      className="relative w-full overflow-auto bg-white dark:bg-black scrollbar-hide"
      id="profileScrollableDiv"
      ref={scrollDivRef}
      style={{
        height:
          'calc(100vh - 84px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top))',
        x,
      }}
    >
      <div
        className="fixed top-0 left-0 right-0 bg-white dark:bg-black z-10"
        style={{
          display: showHeader ? 'block' : 'none',
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
        className="bg-area fixed top-0 left-0 "
        style={{
          backgroundImage: `url('${imgUrl}')`,
          display: showHeader ? 'none' : 'block',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `scale(${scale})`,
          transformOrigin: 'center top',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* <div onClick={handleSuccess}>点击成功</div> */}
      </div>
      <h3
        className="fixed text-black dark:text-[#E0E2F6] text-[20px] duration-300 ease-out"
        style={{
          opacity: showTopTitle ? 1 : 0,
          transform: `translateX(-50%)`,
          left: '50%',
          top: `${
            showTopTitle
              ? 'calc(var(--tg-safe-area-inset-top) + 10px)'
              : 'calc(var(--tg-safe-area-inset-top) + 24px)'
          }`,
          width: '170px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          textAlign: 'center',
        }}
      >
        {userInfo?.username}
      </h3>
      <div
        ref={titleRef}
        className="content-area absolute top-[113px] left-0 w-full bg-white dark:bg-black"
      >
        <OtherUserProfile />
        <Box borderTop="1px solid rgba(255, 255, 255, 0.10)">
          <PostList list={list} hasMore={hasMore} fetchMoreData={fetchMoreData} />
        </Box>
      </div>
    </animated.div>
  )
}

export default OthersProfile
