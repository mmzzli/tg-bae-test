import { getUnreadNotificationCount } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'
import { IUserInfo } from '@/types'
import { useRequest } from 'ahooks'
import { memo, useEffect } from 'react'

const WsHandler = memo(() => {
  let rewardInterval: NodeJS.Timeout | null = null
  const { setNeedUpdateEarnings } = useStore((state) => ({
    setNeedUpdateEarnings: state.setNeedUpdateEarnings,
  }))

  const { onMessage, isConnected, connect, token, setUnreadNotificationCount, setUserInfo } =
    useStore((state) => ({
      onMessage: state.onMessage,
      isConnected: state.isConnected,
      connect: state.connect,
      token: state.token,
      setUnreadNotificationCount: state.setUnreadNotificationCount,
      setUserInfo: state.setUserInfo,
    }))

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const updateRewardInterval = () => {
    if (rewardInterval) {
      clearInterval(rewardInterval)
    }
    rewardInterval = setInterval(() => {
      setNeedUpdateEarnings()
    }, 30000)
  }

  const handleMessage = (data: any) => {
    console.warn('ws msg', data)
    if (data.startsWith('unread')) {
      const amount = parseInt(data.split(':')[1], 10) || 0
      setUnreadNotificationCount(amount)
    } else if (data.startsWith('fan')) {
      const following = JSON.parse(data.split(':')[1])
      const follower = JSON.parse(data.split(':')[2])
      setUserInfo({ follower, fans: following } as IUserInfo)
    }
  }

  const { run: runGetUnreadNotificationCount, cancel: cancelPolling } = useRequest(
    getUnreadNotificationCount,
    {
      pollingInterval: 100000,
      manual: true,
      pollingWhenHidden: false,
      pollingErrorRetryCount: 6,
      onSuccess({ amount }) {
        setUnreadNotificationCount(amount)
      },
    }
  )
  useEffect(() => {
    updateRewardInterval()
    const cleanup = onMessage(handleMessage)
    return () => {
      cleanup()
    }
  }, [])

  useEffect(() => {
    if (token) {
      connect()
      getUnreadNotificationCount(current_uid).then((res) => {
        if (res.amount) {
          setUnreadNotificationCount(res.amount)
        }
      })
    }
  }, [token])

  useEffect(() => {
    if (isConnected && token) {
      cancelPolling()
    } else {
      const timer = setTimeout(() => {
        if (token && !isConnected) {
          runGetUnreadNotificationCount(current_uid)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isConnected, token])

  return null
})

export default memo(WsHandler)
