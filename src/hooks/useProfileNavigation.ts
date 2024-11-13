import { useNavigate } from 'react-router-dom'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useCallback } from 'react'
import { UserItem } from '@/types'
import { useStore } from '@/store/store'

export function useProfileNavigation() {
  const navigate = useNavigate()
  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0
  const { setOthersUserInfo, othersUserInfo, resetOthersViewList } = useStore((state) => ({
    othersUserInfo: state.othersUserInfo,
    setOthersUserInfo: state.setOthersUserInfo,
    resetOthersViewList: state.resetOthersViewList,
  }))

  const jumpToProfilePage = useCallback(
    (user: UserItem) => {
      if (user.uid === currentUid) {
        navigate(`/profile`)
      } else {
        // next user profile not equal previous user profile
        // reset view list and set new user info
        if (Number(user.uid) !== othersUserInfo.uid) {
          resetOthersViewList()
          setOthersUserInfo({ ...user, user_id: user.uid, bio: '' })
        }
        navigate(`/profile/${user.uid}`)
      }
    },
    [currentUid, navigate]
  )

  return jumpToProfilePage
}
