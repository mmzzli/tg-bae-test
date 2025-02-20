import { FC, useEffect, useState, useRef } from 'react'
import { useStore } from '@/store'
import { useParams } from 'react-router-dom'
import { getFollowerList, getFollowingList } from '@/api'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import Image from '@/components/Image/Image'
import FollowButton from '@/components/PersonalDetails/FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { Follow } from '@/types'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import Empty from '../../components/comm/Empty'
import Icon from '../../components/comm/Icon'
import { useSwipeBack } from '@/hooks/useSwipeBack'
import { animated } from 'react-spring/web'

const FollowPage: FC = () => {
  const { uid } = useParams()
  const searchParams = new URLSearchParams(window.location.search)
  const type = searchParams.get('type')
  const title = type === 'follower' ? 'Followers' : 'Following'

  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0
  const jumpToProfilePage = useProfileNavigation()
  const [loading, setLoading] = useState(true)
  const {
    token,
    myFollow,
    follower,
    following,
    setFollowerList,
    setFollowingList,
    setMyFollow,
    resetFollowerList,
    resetFollowingList,
  } = useStore((state) => ({
    myFollow: state.myFollow,
    token: state.token,
    follower: state.follower,
    following: state.following,
    setMyFollow: state.setMyFollow,
    setFollowerList: state.setFollowerList,
    setFollowingList: state.setFollowingList,
    resetFollowerList: state.resetFollowerList,
    resetFollowingList: state.resetFollowingList,
  }))

  const scrollRef = useRef<HTMLDivElement>(null)
  const { bind, x } = useSwipeBack({ scrollRef })

  useEffect(() => {
    if (uid && token) {
      if (type === 'follower') {
        getFollowerList(Number(uid))
          .then((res) => setFollowerList(res))
          .then(() => setLoading(false))
      } else {
        getFollowingList(Number(uid))
          .then((res) => setFollowingList(res))
          .then(() => setLoading(false))
      }
    }
  }, [uid, token])

  useEffect(() => {
    return () => {
      resetFollowerList()
      resetFollowingList()
    }
  }, [])

  const FollowItem = ({ item }: { item: Follow }) => {
    return (
      <div key={item.tg_id} className="flex items-center h-[60px] my-3">
        <div className="rounded-full overflow-hidden">
          <Image
            src={item.avatar}
            alt={item.tgname}
            width={44}
            height={44}
            rect
            type="avatar"
            onClick={() => {
              jumpToProfilePage({
                avatar: item.avatar,
                uid: item.tg_id,
                username: item.tgname,
                fans: 0,
                follower: 0,
              })
            }}
            className="rounded-full"
          />
        </div>
        <div
          onClick={() => {
            jumpToProfilePage({
              avatar: item.avatar,
              uid: item.tg_id,
              username: item.tgname,
              fans: 0,
              follower: 0,
            })
          }}
          className="flex-1 ml-3 truncate overflow-hidden whitespace-nowrap text-[#333] dark:text-black text-base"
        >
          {item.tgname}
          <p className="text-[#999] text-[12px] font-normal">{item.fans_num} followers</p>
        </div>
        {item.tg_id !== currentUid && (
          <FollowButton
            className="ml-[32px]"
            tgid={item.tg_id}
            avatar={item.avatar}
            username={item.tgname}
          />
        )}
      </div>
    )
  }

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        touchAction: 'pan-y',
      }}
      className="dark:bg-black bg-white flex flex-col text-white px-4 z-10 overflow-hidden"
      ref={scrollRef}
    >
      <div
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 24px)`,
        }}
      >
        <h1 className="text-[20px] font-bold text-[#333] dark:text-white">{title}</h1>
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full overflow-auto scrollbar-hide">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <i
                  className="iconfont icon-loading animate-spin text-[#6254FF]"
                  style={{ fontSize: '40px' }}
                ></i>
              </div>
            ) : (
              <>
                {type === 'follower' &&
                  (follower.list.length ? (
                    <InfiniteScroll
                      dataLength={follower.list.length}
                      next={() => {}}
                      hasMore={false}
                      loader={
                        <div className="flex items-center justify-center">
                          <Spinner color="#4A3AFF" />
                        </div>
                      }
                    >
                      {follower.list.map((item) => (
                        <FollowItem key={item.tg_id} item={item} />
                      ))}
                      <div className="h-[40px]"></div>
                    </InfiniteScroll>
                  ) : (
                    <div className="h-full flex items-center justify-center pb-[40px]">
                      <Empty
                        title="No followers yet."
                        icon={
                          <Icon
                            name="icon-Empty_white_follow"
                            style={{ width: '164px', height: '164px' }}
                          ></Icon>
                        }
                      ></Empty>
                    </div>
                  ))}

                {type !== 'follower' &&
                  (following.list.length ? (
                    <InfiniteScroll
                      dataLength={following.list.length}
                      next={() => {}}
                      hasMore={false}
                      loader={
                        <div className="flex items-center justify-center">
                          <Spinner color="#4A3AFF" />
                        </div>
                      }
                    >
                      {[...following.list].map((item) => (
                        <FollowItem key={item.tg_id} item={item} />
                      ))}
                      <div className="h-[40px]"></div>
                    </InfiniteScroll>
                  ) : (
                    <div className="h-full flex items-center justify-center pb-[40px]">
                      <Empty
                        title="You haven't followed anyone."
                        icon={
                          <Icon
                            name="icon-Empty_white_follow"
                            style={{ width: '164px', height: '164px' }}
                          ></Icon>
                        }
                      ></Empty>
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </animated.div>
  )
}

export default FollowPage
