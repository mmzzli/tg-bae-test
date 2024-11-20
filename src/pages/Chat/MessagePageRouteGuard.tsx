import { useStore } from '@/store'
import { useIM } from '@/store/hook/userIM'
import { Spinner } from '@chakra-ui/react'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MessagePage from './MessagePage'
import MessagePageIOS from './MessagePageIOS'

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

const MessagePageRouteGuard: FC = () => {
  const [ready, setReady] = useState(false)
  const { uid } = useParams()
  const { getMessageWindow } = useIM()
  const connection = useStore((state) => state.connection)

  const isChatListLoaded = useStore((state) => state.isChatListLoaded)

  useEffect(() => {
    const prepare = () => {
      try {
        if (!uid) {
          throw new Error('uid is required')
        }
        const messageWindow = getMessageWindow(uid)
        if (!messageWindow) {
          connection
            ?.createEmptyConversation(uid)
            .then((res) => {
              console.log('createEmptyConversation', res)
              setReady(true)
            })
            .catch((error) => {
              console.error('createEmptyConversation failed:', error)
            })
        } else {
          setReady(true)
        }
      } catch (error) {
        console.error('message page preparation failed:', error)
      }
    }
    if (isChatListLoaded) {
      prepare()
    }
  }, [isChatListLoaded])

  if (!ready) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#0D0D0D] z-10">
        <Spinner />
      </div>
    )
  }

  return <>{isIOS() ? <MessagePageIOS /> : <MessagePage />}</>
}

export default MessagePageRouteGuard
