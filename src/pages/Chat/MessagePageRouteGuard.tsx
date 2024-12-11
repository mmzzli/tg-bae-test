import { useStore } from '@/store'
import { useIM } from '@/store/hook/userIM'
import { Spinner } from '@chakra-ui/react'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MessagePage from './MessagePage'
import MessagePageIOS from './MessagePageIOS'

const MessagePageRouteGuard: FC = () => {
  const [ready, setReady] = useState(false)
  const { uid } = useParams()
  const { getMessageWindow } = useIM()
  const connection = useStore((state) => state.connection)

  const { addChatListItem, addMessageWindowListItem } = useStore((state) => ({
    addChatListItem: state.addChatListItem,
    addMessageWindowListItem: state.addMessageWindowListItem,
  }))

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
              const repeat = useStore
                .getState()
                .chatList.some((item) => item.channel.channelID === res.channel.channelID)
              if (!repeat) {
                addChatListItem(res)
                addMessageWindowListItem({
                  channel: res.channel,
                  messages: [],
                })
              }
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
      <div className="fixed inset-0 w-screen flex items-center justify-center dark:bg-[#0D0D0D] bg-white z-10 top-0 bottom-[84px]">
        <i
          className="iconfont icon-loading animate-spin text-[#6254FF]"
          style={{ fontSize: '40px' }}
        ></i>
      </div>
    )
  }

  return <MessagePageIOS />
}

export default MessagePageRouteGuard
