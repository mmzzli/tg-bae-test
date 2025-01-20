import { FC, useEffect, useRef, useState } from 'react'
import UserProfile from '@/components/PersonalDetails/UserProfile'

import ViewList from '@/components/ViewList/ViewList'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { throttle } from '@/utils/chat/schedulers'

import { useStore } from '@/store'
import { getFollowingList } from '@/api'
import './index.css'
// import FireworksAnimation from '../../components/Fireworks'
const SCROLL_THRESHOLD = 110

const Profile: FC = () => {
  const { launchParams } = useTMAUtils()
  const scrollDivRef = useRef<HTMLDivElement>(null)
  const userInfo = useStore((state) => state.userInfo)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showTopTitle, setShowTopTitle] = useState(false)
  const [scale, setScale] = useState(1) // 控制背景图片的缩放

  const { token, myFollow, setMyFollow } = useStore((state) => ({
    token: state.token,
    myFollow: state.myFollow,
    setMyFollow: state.setMyFollow,
  }))
  const imgUrl =
    userInfo?.background_img && userInfo?.background_img.url
      ? userInfo?.background_img.url
      : '/src/assets/image/profile/bg-header.png'

  // const [showFireworks, setShowFireworks] = useState(false)

  useEffect(() => {
    const scrollDiv = scrollDivRef.current
    if (!scrollDiv) return
    if (!titleRef.current) return

    const handleScroll = throttle(() => {
      const scrollTop = scrollDiv.scrollTop
      console.log('scrollTop', scrollTop)

      // 控制标题显示
      const shouldShowTitle = scrollTop >= SCROLL_THRESHOLD
      setShowTopTitle(shouldShowTitle)
      if (shouldShowTitle) {
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

  useEffect(() => {
    if (token && myFollow.length === 0) {
      const current_uid = launchParams.initData?.user?.id ?? 0
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }, [token])

  return (
    <div
      className="relative w-full overflow-auto bg-white dark:bg-black scrollbar-hide"
      id="profileScrollableDiv"
      ref={scrollDivRef}
      style={{
        height:
          'calc(100vh - 84px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top))',
      }}
    >
      <div
        className="bg-area fixed top-0 left-0 "
        style={{
          backgroundImage: `url('${imgUrl}')`,
          display: showTopTitle ? 'none' : 'block',
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
        {userInfo?.username}
      </h3>
      <div
        ref={titleRef}
        className="content-area absolute top-[113px] left-0 w-full h-full  bg-white dark:bg-black"
      >
        <UserProfile />
        <ViewList />
      </div>
    </div>
  )
}

export default Profile
