import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useTMAUtils } from '@/hooks/useTMAUtils'

export const AgeGateWrapper = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  useEffect(() => {
    if (location.pathname === '/splash') {
      return
    }

    if (location.pathname.startsWith('/profile')) {
      window.Telegram?.WebApp?.setHeaderColor("#000000")
    } else {
      window.Telegram?.WebApp?.setHeaderColor("#ffffff")
    }

    const isAgeVerified = localStorage.getItem(`ageGate-${current_uid}`) === '1'
    const tempAgeVerified = sessionStorage.getItem(`temp-ageGate-${current_uid}`) === '1'

    if (location.pathname === '/ageGate') {
      if (isAgeVerified || tempAgeVerified) {
        navigate('/home')
      }
      return
    }

    if (!isAgeVerified && !tempAgeVerified) {
      navigate('/ageGate')
    }
  }, [location.pathname, current_uid])

  return <>{children}</>
}
