import { FC, useEffect } from 'react'
import { useStore } from '@/store'
import { useParams } from 'react-router-dom'
import { getFollowerList, getFollowingList } from '@/api'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import Image from '@/components/Image/Image'
import FollowButton from '@/components/PersonalDetails/FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { Follow } from '@/types'
const FollowPage: FC = () => {
  const { uid } = useParams()
  const searchParams = new URLSearchParams(window.location.search)
  const type = searchParams.get('type')
  const title = type === 'follower' ? 'Followers' : 'Following'

  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0

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

  useEffect(() => {
    if (uid && token) {
      if (type === 'follower') {
        getFollowerList(Number(uid)).then((res) => setFollowerList(res))
      } else {
        getFollowingList(Number(uid)).then((res) => setFollowingList(res))
      }
    }
    if (token && myFollow.length === 0) {
      const current_uid = launchParams.initData?.user?.id ?? 0
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }, [uid, token, myFollow])

  useEffect(() => {
    return () => {
      resetFollowerList()
      resetFollowingList()
    }
  }, [])

  const FollowItem = ({ item }: { item: Follow }) => {
    return (
      <div key={item.tg_id} className="flex items-center h-[80px] my-3">
        <Image
          src={item.avatar}
          alt={item.tgname}
          width={56}
          height={56}
          rect
          className="rounded-full"
        />
        <div className="flex-1 ml-3 truncate overflow-hidden whitespace-nowrap">{item.tgname}</div>
        <FollowButton
          className="ml-[32px]"
          fansid={currentUid}
          tgid={item.tg_id}
          avatar={item.avatar}
          username={item.tgname}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full text-white px-4 py-[30px]">
      <h1 className="text-[24px] font-bold">{title}</h1>
      <InfiniteScroll
        dataLength={type === 'follower' ? follower.list.length : following.list.length}
        next={() => {}}
        hasMore={false}
        loader={
          <div className="flex items-center justify-center">
            <Spinner color="#4A3AFF" />
          </div>
        }
      >
        {type === 'follower'
          ? follower.list.map((item) => <FollowItem key={item.tg_id} item={item} />)
          : following.list.map((item) => <FollowItem key={item.tg_id} item={item} />)}
      </InfiniteScroll>
    </div>
  )
}

export default FollowPage
