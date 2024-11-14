import { FC, useEffect } from 'react'
import { Menu } from '@/components/Menu'
import UserProfile from '@/components/PersonalDetails/UserProfile'

import ViewList from '@/components/ViewList/ViewList'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'
import { getFollowingList } from '@/api'

const Profile: FC = () => {
  const { launchParams } = useTMAUtils()
  const { token, myFollow, setMyFollow } = useStore((state) => ({
    token: state.token,
    myFollow: state.myFollow,
    setMyFollow: state.setMyFollow,
  }))

  useEffect(() => {
    if (token && myFollow.length === 0) {
      const current_uid = launchParams.initData?.user?.id ?? 0
      getFollowingList(current_uid).then((res) => setMyFollow(res))
    }
  }, [token])
  return (
    <>
      <UserProfile />
      <ViewList />
    </>
  )
}

export default Profile
