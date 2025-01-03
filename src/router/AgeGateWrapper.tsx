import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useTMAUtils } from '@/hooks/useTMAUtils'

export const AgeGateWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  useEffect(() => {
    const isAgeVerified = localStorage.getItem(`ageGate-${current_uid}`) === '1'
    const tempAgeVerified = sessionStorage.getItem(`temp-ageGate-${current_uid}`) === '1'
    // 临时确定和永久勾选存在一个，则可以进入项目，否则跳转到ageGate
    if (!isAgeVerified && !tempAgeVerified) {
      navigate('/ageGate')
    } else {
      if (location.pathname === '/ageGate') {
        navigate('/home')
      }
    }
  }, [location.pathname])

  return <>{children}</>
}
