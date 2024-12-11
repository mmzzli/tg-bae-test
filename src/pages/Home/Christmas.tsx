import { type FC, useEffect, useMemo, useRef, useState } from 'react'
import ChristmasList from '@/components/ChristmasList/index'

import { useStore } from '@/store'
import { CardRecommendProvider } from '@/utils/constants'
import { debounce, throttle } from '@/utils/chat/schedulers'
import {featured, allFeatured} from '@/api'

const Christmas: FC = () => {
  const userInfo = useStore((state) => state.userInfo)

  const [videoOpen, setVideoOpen] = useState(false)

  const [scrollPosition, setScrollPosition] = useState(0)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const initialTitlePosition = useRef({ top: 0, left: 0 })


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

    const handleScroll = throttle(() => {
      if (!scrollDiv) return
      setScrollPosition(scrollDiv.scrollTop >= 0 ? scrollDiv.scrollTop : 0)
      console.log(scrollDiv.scrollTop)
    }, 30)

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
      transform: `translateZ(0)`,
      opacity: progress < 0.1 || scrollPosition > 90 ? 1 : 0.2,
    }
  }

  const lastTapTime = useRef<number>(0);

  // 双击触发的逻辑
  const handleDoubleTap = (): void => {
    console.log("Double-tap detected!");
    const element = document.getElementById("recommendScrollableDiv");
    if (element) {
      element.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleSingleClick = (): void => {
    const currentTime = Date.now();
    if (currentTime - lastTapTime.current < 300) {
      handleDoubleTap();
    }
    lastTapTime.current = currentTime;
  };

  const handleDoubleClick = (): void => {
    handleDoubleTap();
  };



  const christma = async()=>{
    // await allFeatured({
    //   type: 1,
    //   page_num: 1,
    //   records: 10
    // })
    // await featured({
    //   type: 1,
    //   acttype: 1,
    //   title: "321",
    //   media: "https://imgdev.bae.boo/1733024672609-0-IMG_1055.jpeg",
    //   // sortorder: "",
    //   width: "4284",
    //   height: "5712",
    //   currency: 0,
    //   price: 0
    // })
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

        <h3
          ref={titleRef}
          style={getTitleStyle()}
          className="fixed text-black dark:text-[#E0E2F6] text-[20px] flex items-center transition-all duration-100 ease-in-out"
          onClick={christma}
        >
          {`Christmas Collection`}
        </h3>

      </div>
      <CardRecommendProvider.Provider value={{ recommend: true, setVideoOpen }}>
        <div
          className={`${userInfo.user_id !== -1 && userInfo.fans === 0 ? '' : 'mt-[68px]'}  relative ${videoOpen ? 'z-[112]' : ''}`}
        >
          <ChristmasList />
        </div>
      </CardRecommendProvider.Provider>
    </div>
  )
}
export default Christmas
