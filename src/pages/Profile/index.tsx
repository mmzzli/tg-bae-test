import { FC, useEffect } from 'react'
import UserProfile from '@/components/PersonalDetails/UserProfile'

import ViewList from '@/components/ViewList/ViewList'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'
import { getFollowingList } from '@/api'
import ProfileSkeleton from '@/components/Skeketon/ProfileSkeleton'
import { useSafeState } from 'ahooks'
import { useViewList } from '@/store/hook/useResourceList'

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
  const { list, isLoading } = useViewList()
  const [loading, setLoading] = useSafeState(true)
  useEffect(() => {
    setLoading(!list.length && isLoading)
  }, [list, isLoading])
  return (
    <div className="relative w-full h-full overflow-auto" id="profileScrollableDiv">
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <>
          <UserProfile />
          <ViewList />
        </>
      )}
    </div>
  )
}

export default Profile
