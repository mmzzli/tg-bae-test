import { FC, useMemo } from 'react'
import BaseButton from '../BaseButton/BaseButton'
import { follow, getSomeoneProfile } from '@/api'
import { useRequest } from 'ahooks'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
const FollowButton: FC<{
  // tg_id username avatar is others user info
  tgid: number
  avatar: string
  username: string
  className?: string
  followButtonClassName?: string
  followingButtonClassName?: string
}> = ({ tgid, avatar, username, className, followButtonClassName, followingButtonClassName }) => {
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()

  const {
    userInfo,
    myFollow,
    setMyFollow,
    setUserInfo,
    othersUserInfo,
    setOthersUserInfo,
    loadRecommendList,
    resetRecommendList,
  } = useStore((state) => ({
    userInfo: state.userInfo,
    myFollow: state.myFollow,
    setMyFollow: state.setMyFollow,
    setUserInfo: state.setUserInfo,
    othersUserInfo: state.othersUserInfo,
    setOthersUserInfo: state.setOthersUserInfo,
    loadRecommendList: state.loadRecommendList,
    resetRecommendList: state.resetRecommendList,
  }))

  const isFollowing = useMemo(() => {
    return myFollow.some((item) => item.tg_id === tgid)
  }, [myFollow, tgid])

  const { runAsync: followHandler, loading: followLoading } = useRequest(follow, {
    manual: true,
    onSuccess: () => {
      if (isFollowing) {
        setMyFollow(myFollow.filter((item) => item.tg_id !== tgid))
      } else {
        setMyFollow([...myFollow, { avatar, tg_id: tgid, tgname: username }])
      }
      setTimeout(() => {
        updateUserFollowInfo()
        resetRecommendList()
        loadRecommendList(1)
      }, 500)
    },
  })

  const doFollow = async () => {
    await followHandler({
      tgid,
      fansid: currentUid,
    })
  }

  const updateUserFollowInfo = () => {
    getSomeoneProfile(currentUid).then((res) => {
      setUserInfo({ ...userInfo, fans: res.fans, follower: res.follower })
    })
    if (othersUserInfo.uid !== -1) {
      getSomeoneProfile(othersUserInfo.uid).then((res) => {
        setOthersUserInfo({ ...othersUserInfo, fans: res.fans, follower: res.follower })
      })
    }
  }
  if (tgid === currentUid) {
    return <></>
  }
  return isFollowing ? (
    <BaseButton
      text="Following"
      loading={followLoading}
      handler={doFollow}
      className={`bg-transparent border text-[#333333] border-[#CDCDD4] w-[104px] ${followingButtonClassName} ${className}`}
      loadingColor="border-t-[#999]"
    />
  ) : (
    <BaseButton
      text="Follow"
      handler={doFollow}
      className={`w-[104px] ${followButtonClassName} ${className}`}
      loading={followLoading}
    />
  )
}
export default FollowButton
