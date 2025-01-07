import { FC, memo, useCallback, useEffect, useRef, useState } from 'react'
import ConversationList from '@/components/Chat/ChatList'
import { cn, getWrappedMessage } from '@/utils/utils'
import { useStore } from '@/store'
import { useIM } from '@/store/hook/userIM'
import BaeimSDK, {
  ConnectStatus,
  ConversationAction,
  SyncOptions,
  Channel,
  FormattedMessage,
} from '@/components/SDK/BaeimSDK'
import { getConversationSync, getMessagesSync } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { log, error as logError } from 'console'
import ChatSkeleton from '@/components/Skeketon/ChatSkeleton'
import Empty from '@/components/comm/Empty'
import Icon from '@/components/comm/Icon'
import { sortConversations } from '@/utils/chat/util'

let sdk: BaeimSDK

const ChatListPage: FC<{ className?: string }> = ({ className }) => {
  const {
    connection,
    isChatListLoaded,
    setConnection,
    setIsChatListLoaded,
    addMessageWindowListItem,
    userInfo,
    token,
    conversationIds,
    setConversation,
    addConversation,
    updateConversation,
    deleteConversation,
  } = useStore((state) => ({
    connection: state.connection,
    isChatListLoaded: state.isChatListLoaded,
    setConnection: state.setConnection,
    setIsChatListLoaded: state.setIsChatListLoaded,
    addMessageWindowListItem: state.addMessageWindowListItem,
    conversationIds: state.conversationIds,
    setConversation: state.setConversation,
    addConversation: state.addConversation,
    updateConversation: state.updateConversation,
    deleteConversation: state.deleteConversation,
    userInfo: state.userInfo,
    token: state.token,
  }))
  const { receiveMessage } = useIM()
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()
  const [resetTrigger, setResetTrigger] = useState(0)
  const handleContainerClick = () => {
    setResetTrigger(resetTrigger + 1)
  }
  const [status, setStatus] = useState<ConnectStatus>(ConnectStatus.Disconnect)
  const getStatusText = () => {
    switch (status) {
      case ConnectStatus.Connected:
        return ''
      case ConnectStatus.ConnectKick:
        return 'kick'
      case ConnectStatus.Disconnect:
        return 'connecting...'
      case ConnectStatus.Connecting:
        return 'connecting...'
      case ConnectStatus.ConnectFail:
        return 'network error'
      default:
        return 'Unknown'
    }
  }

  const handleMessage = useCallback(
    (message: FormattedMessage) => {
      log('-------message from server-------- ', message)
      try {
        if (message?.content?.text) {
          receiveMessage(getWrappedMessage(message))
        }
      } catch (error) {
        logError('message from server parse error:', error)
      }
    },
    [receiveMessage]
  )

  useEffect(() => {
    if (connection) {
      connection.addMessageListener(handleMessage)
    }
    return () => {
      if (connection) {
        connection.removeMessageListener()
      }
    }
  }, [connection])

  useEffect(() => {
    let removeConnectionStatusListener: () => void
    let removeSyncConversationListener: () => void
    if (userInfo.user_id && token) {
      const initIM = async () => {
        sdk = new BaeimSDK({
          token,
          userUid: String(currentUid),
          serverAddr: import.meta.env.VITE_APP_IM_WS_URL,
          syncConversationsCallback: async () => {
            const resp = await getConversationSync({
              uid: String(currentUid),
              msg_count: 20,
            })
            return resp
          },
          syncMessagesCallback: async (channel: Channel, opts: SyncOptions) => {
            const resp = await getMessagesSync({
              uid: String(currentUid),
              login_uid: String(currentUid),
              channel_id: channel.channelID,
              channel_type: channel.channelType,
              start_message_seq: opts.startMessageSeq,
              end_message_seq: opts.endMessageSeq,
              pull_mode: opts.pullMode,
              limit: 20,
            })
            return resp.messages || []
          },
        })
        sdk.start()
        setConnection(sdk)

        removeConnectionStatusListener = sdk.addConnectionStatusListener(async (status) => {
          setStatus(status)
          console.warn('-----ConnectionStatusListener------', status)
          const isChatListLoadedStateFormStore = useStore.getState().isChatListLoaded
          if (status === ConnectStatus.Connected && !isChatListLoadedStateFormStore) {
            try {
              const res = await sdk.getAllConversation()
              setIsChatListLoaded(true)
              setConversation(sortConversations(res))
              console.warn('res', res)
              res.forEach((conversation) => {
                addMessageWindowListItem({
                  channel: conversation.channel,
                  messages: conversation.recents?.map(getWrappedMessage).reverse() ?? [],
                })
              })

              removeSyncConversationListener = sdk.addConversationListener(
                (conversation, action) => {
                  if (action === ConversationAction.add) {
                    console.warn('addConversationListener add conversation', conversation)
                    const repeat = conversationIds.some(
                      (id) => id === conversation.channel.channelID
                    )
                    if (!repeat) {
                      addConversation(conversation)
                      addMessageWindowListItem({
                        channel: conversation.channel,
                        messages: conversation.recents?.map(getWrappedMessage) ?? [],
                      })
                    }
                  } else if (action === ConversationAction.update) {
                    console.warn('addConversationListener update conversation', conversation)
                    updateConversation(conversation)
                  } else if (action === ConversationAction.remove) {
                    console.warn('addConversationListener remove conversation', conversation)
                    deleteConversation(conversation.channel.channelID)
                  }
                }
              )
              console.warn('getAllConversation', res)
            } catch (error) {
              console.warn('getAllConversation error', error)
            }
          } else if (
            status === ConnectStatus.ConnectKick ||
            status === ConnectStatus.Disconnect ||
            status === ConnectStatus.ConnectFail
          ) {
            sdk.reconnect()
          }
        })
      }

      initIM()
    }
    return () => {
      sdk?.stop()
      removeConnectionStatusListener?.()
    }
  }, [token])

  useEffect(() => {
    const checkAndBindEvent = (retryCount = 0) => {
      if (window.Telegram?.WebView) {
        window.Telegram.WebView.onEvent(
          'visibility_changed',
          (eventType: string, eventData: { is_visible: boolean }) => {
            if (eventData.is_visible) {
              console.warn('chatListPage visibility_changed is_visible')
            } else {
              console.warn('chatListPage visibility_changed is_hidden')
            }
          }
        )
      } else if (retryCount < 6) {
        setTimeout(() => checkAndBindEvent(retryCount + 1), 1200)
      }
    }

    checkAndBindEvent()
  }, [])
  return (
    <div
      className={cn(
        'absolute top-0 left-0 right-0 bottom-0 dark:bg-black bg-white overflow-auto',
        'flex scrollbar-hide',
        className
      )}
      onClick={handleContainerClick}
      style={{
        paddingTop:
          'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 36px)',
      }}
    >
      <div
        className="absolute left-0 right-0 h-[32px] pl-6 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-black flex items-center justify-center"
        style={{
          top: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        }}
      >
        {getStatusText()}
      </div>
      {isChatListLoaded && conversationIds.length > 0 && (
        <div className="flex-1 overflow-auto scrollbar-hide">
          <ConversationList ids={conversationIds} resetTrigger={resetTrigger} />
          <div className="h-[40px]"></div>
        </div>
      )}
      {isChatListLoaded && conversationIds.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Empty
            icon={
              <Icon name="icon-Empty_white_chat" style={{ width: '164px', height: '164px' }}></Icon>
            }
            title="No Chat History"
          ></Empty>
        </div>
      )}
      {!isChatListLoaded && (
        <div className="flex-1 pb-[80px]">
          <ChatSkeleton />
          <ChatSkeleton />
          <ChatSkeleton />
          <ChatSkeleton />
        </div>
      )}
    </div>
  )
}

export default memo(ChatListPage)
