import { useNavigate } from 'react-router-dom'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useCallback } from 'react'

export function useProfileNavigation() {
  const navigate = useNavigate()
  const { launchParams } = useTMAUtils()
  const currentUid = launchParams.initData?.user?.id ?? 0

  const jumpToProfilePage = useCallback(
    (uid: number) => {
      if (uid === currentUid) {
        navigate(`/profile`)
      } else {
        navigate(`/profile/${uid}`)
      }
    },
    [currentUid, navigate]
  )

  return jumpToProfilePage
}
