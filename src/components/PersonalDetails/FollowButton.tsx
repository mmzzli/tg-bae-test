import { FC, useMemo } from 'react'
import BaseButton from '../BaseButton/BaseButton'
import { follow } from '@/api'
import { useRequest } from 'ahooks'
import { useStore } from '@/store'

const FollowButton: FC<{
  fansid: number
  tgid: number
  avatar: string
  username: string
  className?: string
}> = ({ fansid, tgid, avatar, username, className }) => {
  const { myFollow, setMyFollow } = useStore((state) => ({
    myFollow: state.myFollow,
    setMyFollow: state.setMyFollow,
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
    },
  })

  const doFollow = async () => {
    await followHandler({
      tgid,
      fansid,
    })
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
