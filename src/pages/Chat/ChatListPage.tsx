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
  Message,
  CMDContent,
  Conversation,
} from '@/components/SDK/BaeimSDK'
import { getConversationSync, getMessagesSync } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { log, error as logError } from 'console'
import ChatSkeleton from '@/components/Skeketon/ChatSkeleton'
import Empty from '@/components/comm/Empty'
import Icon from '@/components/comm/Icon'
import { sortConversations } from '@/utils/chat/util'
import { SendackPacket } from 'wukongimjssdk'
import { useParams } from 'react-router-dom'
import { MessageWindowListItem } from '@/components/Chat/types'

let sdk: BaeimSDK
const MAX_RETRY_COUNT = 12
const RETRY_INTERVAL = 3000

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
  const { getMessageWindow } = useIM()
  const [resetTrigger, setResetTrigger] = useState(0)
  const handleContainerClick = () => {
    setResetTrigger(resetTrigger + 1)
  }
  const [status, setStatus] = useState<ConnectStatus>(ConnectStatus.Disconnect)
  const [retryCount, setRetryCount] = useState(0)
  const { uid } = useParams()
  const getStatusText = () => {
    switch (status) {
      case ConnectStatus.Connected:
        return ''
      case ConnectStatus.ConnectKick:
        return 'kicked'
      case ConnectStatus.Disconnect:
        return 'disconnected'
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

  const handleCMDMessage = (message: Message) => {
    const cmdContent = message.content as CMDContent
    const cmd = cmdContent.cmd // 指令名称
    const param = cmdContent.param // 指令参数
    console.log('handleCMDMessage', cmdContent)
    if (cmd === 'DeleteMessage') {
      if (String(param.channel_id) === String(currentUid)) {
        // 删除聊天窗口消息
        const messageWindow = useStore
          .getState()
          .messageWindowList.filter((item) => item.channel.channelID === String(param.from))
        console.log(messageWindow)
        if (messageWindow.length > 0) {
          const newMessages = messageWindow[0].messages.filter(
            (msg) => msg.messageId !== param.message_id
          )
          useStore
            .getState()
            .updateMessageWindowListItem({ ...messageWindow[0], messages: newMessages })

          setTimeout(() => {
            console.log(
              useStore
                .getState()
                .messageWindowList.filter((item) => item.channel.channelID === String(param.from))
            )
          })
        }
        // 更新会话
        const conversation = useStore.getState().conversationMap[String(param.from)]
        if (conversation) {
          const recents = conversation.recents?.filter(
            (recent) => recent.messageID !== param.message_id
          )
          const newConversation = {
            ...conversation,
            recents,
            lastMessage: recents ? recents[0] : {},
          }
          useStore.getState().updateConversation(newConversation as Conversation)
        }
      }
    }
  }

  const messageStatusListener = (ack: SendackPacket) => {
    console.log(ack)
    console.log(ack.messageID.toString())
    if (uid) {
      const messageWindow = getMessageWindow(uid || '')
      const messages = messageWindow?.messages
      console.log(messages)
      if (messages) {
        messages.forEach((m) => {
          if (m.clientSeq == ack.clientSeq) {
            m.messageId = ack.messageID.toString()
            m.messageSeq = ack.messageSeq
            return
          }
        })
        useStore.getState().updateMessageWindowListItem({
          ...messageWindow,
          messages: [...messages],
        } as MessageWindowListItem)
      }
    }
    // useStore.getState().messageWindowList
    // messages.value.forEach((m) => {
    //   if (m.clientSeq == ack.clientSeq) {
    //     m.status = ack.reasonCode == 1 ? MessageStatus.Normal : MessageStatus.Fail
    //     return
    //   }
    // })
  }

  useEffect(() => {
    if (connection) {
      connection.addMessageListener(handleMessage)
      connection.addCMDMessageListener(handleCMDMessage)
      connection.addMessageStatusListener(messageStatusListener)
    }
    return () => {
      if (connection) {
        connection.removeMessageListener()
        connection.removeCMDMessageListener()
        connection.removeMessageStatusListener()
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

        // setIsChatListLoaded(true)
        // const res = await sdk.getAllConversation()
        // setConversation(sortConversations(res))
        // res.forEach((conversation) => {
        //   addMessageWindowListItem(
        //     {
        //       channel: conversation.channel,
        //       messages: conversation.recents?.map(getWrappedMessage).reverse() ?? [],
        //     },
        //     true
        //   )
        // })

        removeConnectionStatusListener = sdk.addConnectionStatusListener(async (status) => {
          setStatus(status)
          console.warn('-----ConnectionStatusListener------', status)
          const isChatListLoadedStateFormStore = useStore.getState().isChatListLoaded
          if (status === ConnectStatus.Connected) {
            setRetryCount(0)
            try {
              if (!isChatListLoadedStateFormStore) {
                setIsChatListLoaded(true)
                removeSyncConversationListener = sdk.addConversationListener(
                  (conversation, action) => {
                    if (action === ConversationAction.add) {
                      console.warn('addConversationListener add conversation', conversation)
                      const repeat = conversationIds.some(
                        (id) => id === conversation.channel.channelID
                      )
                      if (!repeat) {
                        addConversation(conversation)
                        addMessageWindowListItem(
                          {
                            channel: conversation.channel,
                            messages: conversation.recents?.map(getWrappedMessage) ?? [],
                          },
                          false
                        )
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
              }
              const res = await sdk.getAllConversation()
              setConversation(sortConversations(res))
              res.forEach((conversation) => {
                addMessageWindowListItem(
                  {
                    channel: conversation.channel,
                    messages: conversation.recents?.map(getWrappedMessage).reverse() ?? [],
                  },
                  true
                )
              })
              console.warn('getAllConversation', res)
            } catch (error) {
              console.warn('getAllConversation error', error)
            }
          } else if (
            status === ConnectStatus.ConnectKick ||
            status === ConnectStatus.Disconnect ||
            status === ConnectStatus.ConnectFail
          ) {
            sdk.disconnect()
            if (retryCount < MAX_RETRY_COUNT) {
              setTimeout(() => {
                sdk.reconnect()
                setRetryCount(retryCount + 1)
              }, RETRY_INTERVAL)
            }
          }
        })
      }

      initIM()
    }
    return () => {
      sdk?.stop()
      removeConnectionStatusListener?.()
      removeSyncConversationListener?.()
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
        paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
      }}
    >
      <div
        className="absolute left-0 right-0 h-[32px] text-sm text-gray-400 dark:text-gray-200 bg-white dark:bg-black flex items-center justify-center"
        style={{
          top: 'calc(var(--tg-safe-area-inset-top))',
        }}
      >
        {getStatusText()}
      </div>
      {isChatListLoaded && conversationIds.length > 0 && (
        <div className="flex-1 overflow-auto scrollbar-hide pt-9">
          <ConversationList ids={conversationIds} resetTrigger={resetTrigger} />
          <div className="h-[40px]"></div>
        </div>
      )}
      {isChatListLoaded && conversationIds.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <Empty
            icon={
              <Icon
                name="icon-a-Frame2085662446"
                style={{ width: '120px', height: '120px' }}
              ></Icon>
            }
            title="No Chat History"
          ></Empty>
        </div>
      )}
      {!isChatListLoaded && (
        <div className="flex-1 pb-[80px] pt-[40px]">
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
