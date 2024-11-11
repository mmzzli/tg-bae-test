import { useStore } from '@/store'
import { useIM } from '@/store/hook/userIM'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ConnectStatus } from 'wukongimjssdk'

interface MessagePageRouteGuardProps {
  children: React.ReactNode
}

const MessagePageRouteGuard: FC<MessagePageRouteGuardProps> = ({ children }) => {
  const [ready, setReady] = useState(false)
  const { uid } = useParams()
  const token = useStore((state) => state.token)
  const connection = useStore((state) => state.connection)
  const { initMessageWindow, initChatListItem } = useIM()
  const prepare = () => {
    try {
      initMessageWindow(Number(uid))
      initChatListItem(Number(uid))
      setReady(true)
    } catch (error) {
      console.error('message page preparation failed:', error)
      setReady(true)
    }
  }
  useEffect(() => {
    if (token && connection) {
      prepare()
    }
  }, [token, connection])

  if (!ready) {
    return null
  }

  return <>{children}</>
}

export default MessagePageRouteGuard
