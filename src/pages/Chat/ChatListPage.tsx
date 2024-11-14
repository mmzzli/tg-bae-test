import { FC, useCallback, useEffect } from 'react'
import ChatList from '@/components/Chat/ChatList'
import { Menu } from '@/components/Menu'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Spinner } from '@chakra-ui/react'
import { cn, getWrappedMessage } from '@/utils/utils'
import { useStore } from '@/store'
import { Message } from 'wukongimjssdk/lib/model'
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
import emptyChat from '@/assets/image/chat/nochat.png'
import ChatSkeleton from '@/components/Skeketon/ChatSkeleton'

const ChatListPage: FC<{ className?: string }> = ({ className }) => {
  const {
    chatList,
    connection,
    isChatListLoaded,
    setConnection,
    setIsChatListLoaded,
    setChatList,
    addChatListItem,
    addMessageWindowListItem,
    deleteChatListItem,
    updateChatListItem,
    userInfo,
    token,
  } = useStore((state) => ({
    chatList: state.chatList,
    connection: state.connection,
    isChatListLoaded: state.isChatListLoaded,
    setConnection: state.setConnection,
    setIsChatListLoaded: state.setIsChatListLoaded,
    setChatList: state.setChatList,
    addChatListItem: state.addChatListItem,
    addMessageWindowListItem: state.addMessageWindowListItem,
    deleteChatListItem: state.deleteChatListItem,
    updateChatListItem: state.updateChatListItem,
    userInfo: state.userInfo,
    token: state.token,
  }))
  const { receiveMessage } = useIM()
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()

  // const handleDelete = (id: string) => {
  //   log('Delete chat:', id)
  //   // Implement delete logic
  // }

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
    let sdk: BaeimSDK
    if (userInfo.user_id && token) {
      const initIM = async () => {
        const sdk = new BaeimSDK({
          token,
          userUid: String(currentUid),
          serverAddr: 'wss://chat-dev.anyconn.org:8210',
          syncConversationsCallback: async () => {
            const resp = await getConversationSync({
              uid: String(currentUid),
              msg_count: 30,
            })
            return resp
          },
          syncMessagesCallback: async (channel: Channel, opts: SyncOptions) => {
            const resp = await getMessagesSync({
              uid: String(currentUid),
              channel_id: channel.channelID,
              channel_type: channel.channelType,
              start_message_seq: opts.startMessageSeq,
              end_message_seq: opts.endMessageSeq,
              pull_mode: opts.pullMode,
              limit: 30,
            })
            return resp
          },
        })
        sdk.start()
        setConnection(sdk)

        removeConnectionStatusListener = sdk.addConnectionStatusListener(async (status) => {
          log('-----ConnectionStatusListener------', status)
          if (status === ConnectStatus.Connected && !isChatListLoaded) {
            try {
              const res = await sdk.getAllConversation()
              setIsChatListLoaded(true)
              setChatList(res)
              res.forEach((conversation) => {
                addMessageWindowListItem({
                  channel: conversation.channel,
                  messages: conversation.recents?.map(getWrappedMessage).reverse() ?? [],
                })
              })

              removeSyncConversationListener = sdk.addConversationListener(
                (conversation, action) => {
                  if (action === ConversationAction.add) {
                    console.log('addConversationListener add conversation', conversation)
                    addChatListItem(conversation)
                    addMessageWindowListItem({
                      channel: conversation.channel,
                      messages: conversation.recents?.map(getWrappedMessage) ?? [],
                    })
                  } else if (action === ConversationAction.update) {
                    console.log('addConversationListener update conversation', conversation)
                    updateChatListItem(conversation)
                  } else if (action === ConversationAction.remove) {
                    console.log('addConversationListener remove conversation', conversation)
                    deleteChatListItem(conversation.channel.channelID)
                  }
                }
              )
              log('getAllConversation', res)
            } catch (error) {
              log('getAllConversation error', error)
            }
          } else if (status === ConnectStatus.ConnectKick || status === ConnectStatus.Disconnect) {
            removeSyncConversationListener && removeSyncConversationListener()
          }
        })
      }

      initIM()
    }
    return () => {
      sdk?.stop()
      removeConnectionStatusListener?.()
    }
  }, [userInfo, token])
  console.log('chatListPage render')
  return (
    <div
      className={cn('bg-black min-h-screen pt-[32px] overflow-auto', 'scrollbar-hide', className)}
    >
      {isChatListLoaded && chatList.length > 0 && (
        <InfiniteScroll
          dataLength={chatList.length}
          next={() => {}}
          hasMore={false}
          loader={
            <div className="flex items-center justify-center">
              <Spinner color="#4A3AFF" />
            </div>
          }
        >
          <ChatList chats={chatList} />
        </InfiniteScroll>
      )}
      {isChatListLoaded && chatList.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 pb-[80px]">
          <img src={emptyChat} alt="empty" style={{ width: '164px' }} />
          <span className="text-[#424048] text-sm mt-6">No Chat History</span>
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

export default ChatListPage
