import { getSelectorsByUserAgent } from 'react-device-detect'
import { useEffect, useState } from 'react'
import { useSize } from 'ahooks'

const useMobile = () => {
  const size = useSize(() => document.querySelector('body'))
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const userAgent = window.navigator.userAgent
    const { isMobile } = getSelectorsByUserAgent(userAgent)
    setIsMobile(isMobile)
  }, [size])
  return isMobile
}
export default useMobile
