import { FC, useMemo } from 'react'
import BaseButton from '../BaseButton/BaseButton'
import { follow, getSomeoneProfile } from '@/api'
import { useRequest } from 'ahooks'
import { useStore } from '@/store'

// Object is Follow, I Follow Someone, so fansid is current user id
const FollowButton: FC<{
  fansid: number
  // tg_id username avatar is other user info
  tgid: number
  avatar: string
  username: string
  className?: string
}> = ({ fansid, tgid, avatar, username, className }) => {
  const { userInfo, myFollow, setMyFollow, setUserInfo, othersUserInfo, setOthersUserInfo } =
    useStore((state) => ({
      userInfo: state.userInfo,
      myFollow: state.myFollow,
      setMyFollow: state.setMyFollow,
      setUserInfo: state.setUserInfo,
      othersUserInfo: state.othersUserInfo,
      setOthersUserInfo: state.setOthersUserInfo,
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
      updateUserFollowInfo()
    },
  })

  const doFollow = async () => {
    await followHandler({
      tgid,
      fansid,
    })
  }

  const updateUserFollowInfo = () => {
    getSomeoneProfile(fansid).then((res) => {
      setUserInfo({ ...userInfo, fans: res.fans, follower: res.follower })
    })
    if (othersUserInfo.uid !== -1) {
      getSomeoneProfile(othersUserInfo.uid).then((res) => {
        setOthersUserInfo({ ...othersUserInfo, fans: res.fans, follower: res.follower })
      })
    }
  }
  return isFollowing ? (
    <BaseButton
      text="Following"
      loading={followLoading}
      width="104px"
      handler={doFollow}
      className={`bg-transparent border text-[#333333] border-[#CDCDD4] ${className}`}
      loadingColor="border-t-[#999]"
      // loadingClassName="bg-transparent border text-[#333333] border-[#333]"
    />
  ) : (
    <BaseButton
      text="Follow"
      width="104px"
      handler={doFollow}
      className={className}
      loading={followLoading}
    />
  )
}
export default FollowButton
