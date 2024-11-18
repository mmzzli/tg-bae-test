import { useState, useEffect } from 'react'

export const useSafeArea = () => {
  const [safeArea, setSafeArea] = useState({ bottom: 0 })

  useEffect(() => {
    const getSafeAreaBottom = () => {
      // 1. 先尝试 Telegram WebApp API
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp
        const bottom = tg.viewportHeight - tg.viewportStableHeight
        if (bottom > 0) return bottom
      }

      // 2. 尝试 CSS env 变量
      const envBottom = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          'env(safe-area-inset-bottom)'
        ) || '0'
      )
      if (envBottom > 0) return envBottom

      // 3. 检测设备类型和系统
      const isIphone = /iPhone/.test(navigator.userAgent)
      if (isIphone && window.innerHeight >= 812) {
        return 34 // iPhone X 及以上机型的安全距离
      }

      return 0
    }

    const updateSafeArea = () => {
      setSafeArea({ bottom: getSafeAreaBottom() })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)

    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}
