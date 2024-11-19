import { FC, useMemo } from 'react'
import {
  createStandaloneToast,
  useToast
} from '@chakra-ui/react'
import BaseButton from '../BaseButton/BaseButton'
import { follow, getSomeoneProfile } from '@/api'
import { useRequest } from 'ahooks'
import { useStore } from '@/store'
import { CustomToast, typeOptions } from '../comm/Toast'

// Object is Follow, I Follow Someone, so fansid is current user id
const FollowButton: FC<{
  fansid: number
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
  const toast = useToast()

  const { runAsync: followHandler, loading: followLoading } = useRequest(follow, {
    manual: true,
    onSuccess: () => {
      toast({
        position: 'top',
        status: 'success',
        containerStyle: {
          marginTop: '50vh',
          transform: 'translateY(-50%)',
        },
        render: () => {
          return <CustomToast title="success" type={typeOptions.success} />
        },
      })
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
      className={`bg-transparent border border-white ${className}`}
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
