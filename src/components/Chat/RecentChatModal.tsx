import { FC, useEffect, useState } from 'react'
import { BaseModal } from '@/components/Modal/BaseModal'
import SimpleChatList from './SimpleChatList'
import { useStore } from '@/store'
import BaeimSDK from '@/components/SDK/BaeimSDK'
import { getConversationSync } from '@/api'
import { sortConversations } from '@/utils/chat/util'
import ChatSkeleton from '@/components/Skeketon/ChatSkeleton'
import Empty from '@/components/comm/Empty'
import Icon from '@/components/comm/Icon'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect?: (channelId: string) => void
}

let sdk: BaeimSDK

const RecentChatModal: FC<Props> = ({ isOpen, onClose, onSelect }) => {
  const {
    userInfo,
    token,
    conversationIds,
    setConversation,
    isChatListLoaded,
    setIsChatListLoaded,
    setConnection,
  } = useStore((state) => ({
    userInfo: state.userInfo,
    token: state.token,
    conversationIds: state.conversationIds,
    setConversation: state.setConversation,
    isChatListLoaded: state.isChatListLoaded,
    setIsChatListLoaded: state.setIsChatListLoaded,
    setConnection: state.setConnection,
  }))

  useEffect(() => {
    if (isOpen && userInfo.user_id && token && !isChatListLoaded) {
      const initIM = async () => {
        sdk = new BaeimSDK({
          token,
          userUid: String(userInfo.user_id),
          serverAddr: import.meta.env.VITE_APP_IM_WS_URL,
          syncConversationsCallback: async () => {
            const resp = await getConversationSync({
              uid: String(userInfo.user_id),
              msg_count: 20,
            })
            return resp
          },
        })

        sdk.start()
        setConnection(sdk)

        try {
          const res = await sdk.getAllConversation()
          setConversation(sortConversations(res))
          setIsChatListLoaded(true)
        } catch (error) {
          console.warn('getAllConversation error', error)
        }
      }

      initIM()
    }

    return () => {
      if (sdk) {
        sdk.stop()
      }
    }
  }, [isOpen, token, userInfo.user_id])

  const handleSelect = (channelId: string) => {
    onSelect?.(channelId)
    onClose()
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      usePortal={true}
      height="500px"
      theme={{
        darkBackgroundColor: 'rgba(26, 26, 26, 0.3)',
        lightBackgroundColor: '#ffffff',
        handleColor: '#d1d5db',
      }}
      showHandle={false}
    >
      <div className="w-full h-[400px]">
        <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333] dark:text-white">
          Recent Chats
        </h3>
        <div className="min-h-[200px]">
          {isChatListLoaded && conversationIds.length > 0 && (
            <SimpleChatList ids={conversationIds} onSelect={handleSelect} maxHeight="380px" />
          )}

          {isChatListLoaded && conversationIds.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <Empty
                icon={
                  <Icon name="icon-a-Frame2085662446" style={{ width: '80px', height: '80px' }} />
                }
                title="No Chat History"
              />
            </div>
          )}

          {!isChatListLoaded && (
            <div className="py-4">
              <ChatSkeleton />
              <ChatSkeleton />
              <ChatSkeleton />
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  )
}

export default RecentChatModal
