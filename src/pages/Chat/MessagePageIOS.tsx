import { useState, useEffect, useRef, memo } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
// import { MessageList } from '@/components/Chat/NewMessageListOrigin'
// import MessageInput from '@/components/Chat/MessageInput'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'
import { OthersUserInfo } from '@/types'
import Image from '@/components/Image/Image'
import { cn } from '@/utils/utils'
import SendMediaModal from '@/components/Chat/SendMediaModal'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import { useDailyTaskActions } from '@/hooks/useDailyTask'
import { debounce } from '@/utils/chat/schedulers'
import RewardButton from '@/components/Wallet/RewardButton'
import { ImagePreviewIcon, VideoPreviewIcon } from '@/components/Chat/MessageRender'
// const PAGE_SIZE = 20
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}
const defaultMessages: WrappedMessage[] = []

const MemoizedMessageList = memo(MessageList)
const MessagePageIOS = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [message, setMessage] = useState('')
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  const { formatMessage } = useFormatMessage()
  const { sendMessage, getMessageWindow, getChatPeopleInfo } = useIM()
  const messageWindow = getMessageWindow(uid || '')
  const messageWindowList = useStore((state) => state.messageWindowList)
  const replyMessage = useStore((state) => state.replyMessage)
  const setReplyMessage = useStore((state) => state.setReplyMessage)
  const [showInput, setShowInput] = useState(false)
  const jumpToProfilePage = useProfileNavigation()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [zIndex, setZIndex] = useState(98)
  const isIOSDevice = isIOS()

  const [initTgViewportHeight, setInitTgViewportHeight] = useState(0)
  const [initVisualViewportHeight, setInitVisualViewportHeight] = useState(0)

  const { runDailyChat } = useDailyTaskActions()

  useEffect(() => {
    if (messageWindow) {
      setMessages(messageWindow.messages)
    }
  }, [messageWindow, messageWindowList])

  useEffect(() => {
    if (uid) {
      const getUserInfo = (times: number) => {
        const user = getChatPeopleInfo(Number(uid))
        if (user) {
          setChatPeople(user)
        } else if (times > 0) {
          setTimeout(() => {
            getUserInfo(times - 1)
          }, 300)
        }
      }
      getUserInfo(10)
    }
  }, [uid])

  const closeReply = () => {
    setReplyMessage(null)
  }

  const handleSend = ({ type, text }: { type: MessageType; text?: string }) => {
    const newMessage = formatMessage({
      type,
      text,
      to: Number(uid),
      reply: replyMessage || undefined,
    })
    sendMessage(newMessage)
    setReplyMessage(null)
    setTimeout(() => {
      window.dispatchEvent(new Event('message-scroll-to-bottom'))
    }, 200)
  }

  const handleSendText = () => {
    const text = message.trim()
    if (text === '##debug##') {
      console.log('###### debug ######', text)
      if (window.vConsoleInstance) {
        if (window.vConsoleInstance.compInstance.showSwitchButton) {
          window.vConsoleInstance.hideSwitch()
        } else {
          window.vConsoleInstance.showSwitch()
        }
      }
      return
    }
    if (text) {
      runDailyChat()
      handleSend({ type: MessageType.TEXT, text })
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendText()
    }
  }

  // mobile submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSendText()
  }

  const stopMove = (e: any) => {
    const messageList = document.querySelector('.message-list-scroll-trigger')
    if (messageList && messageList.contains(e.target)) {
      return
    }
    e.preventDefault()
    window.scrollTo(0, 0)
  }

  const scroll = () => {
    window.scrollTo(0, 0)
  }

  const keyboardUp = () => {
    window.scrollTo(0, 0)
    document.body.addEventListener('touchmove', stopMove, {
      passive: false,
    })
    document.addEventListener('touchend', scroll)
  }

  const keyboardDown = () => {
    document.body.removeEventListener('touchmove', stopMove)
    document.addEventListener('touchend', scroll)
  }

  const initTgViewportHeightRef = useRef(0)
  const initVisualViewportHeightRef = useRef(0)

  useEffect(() => {
    initTgViewportHeightRef.current = initTgViewportHeight
    initVisualViewportHeightRef.current = initVisualViewportHeight
  }, [initTgViewportHeight, initVisualViewportHeight])

  useEffect(() => {
    if (!containerRef.current) return
    const tg = window.Telegram?.WebApp
    setInitTgViewportHeight(tg.viewportStableHeight)

    // 这个函数在视口变化时立即执行 可以提前确定布局
    const handleViewportChange = debounce(() => {
      if (useStore.getState().virtualRoutePage?.name === 'SendRewardPage') return
      // console.log('###### TG viewportChanged ######')
      // console.log('tg.viewportStableHeight', tg.viewportStableHeight)
      // console.log('initTgViewportHeightRef', initTgViewportHeightRef.current)
      // console.log('initVisualViewportHeightRef', initVisualViewportHeightRef.current)
      // console.log('###### TG viewportChanged ######')
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up 1')
        containerRef.current!.style.height = `${isIOSDevice ? tg.viewportStableHeight : tg.viewportStableHeight - 26}px`
        keyboardUp()
        setShowInput(true)
      } else {
        console.log('keyboard down 1')
        // containerRef.current!.style.height = `${initVisualViewportHeightRef.current - 84}px`
        containerRef.current!.style.height = `100vh`
        keyboardDown()
        setShowInput(false)
      }
    }, 100)

    // 这个函数在视口稳定后执行 可以在这个之后稳定real input位置
    const handleVisualViewportResize = debounce(() => {
      if (useStore.getState().virtualRoutePage?.name === 'SendRewardPage' || !window.visualViewport)
        return
      // const currentHeight = window.visualViewport.height

      // console.log('###### window visualViewport ######')
      // console.log('visualViewport.height', currentHeight)
      // console.log('tg.viewportStableHeight', tg.viewportStableHeight)
      // console.log('###### window visualViewport ######')

      // 这个有时候会获取不到初始的高度
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up 2')
        containerRef.current!.style.height = `${isIOSDevice ? tg.viewportStableHeight : tg.viewportStableHeight - 26}px`
        setShowInput(true)
      } else {
        console.log('keyboard down 2')
        // containerRef.current!.style.height = `${currentHeight - 84}px`
        containerRef.current!.style.height = `100vh`
        setShowInput(false)
        setTimeout(() => {
          document.body.scrollIntoView()
        }, 100)
      }
    }, 100)

    tg?.onEvent('viewportChanged', handleViewportChange)
    handleVisualViewportResize()
    // 记录window 的高度 方便tg视窗改变时能正确设置聊天div的高度 如果使用tg的viewport height会不准确，可能需要结合safe area 的高度和content safe area的高度
    setInitVisualViewportHeight(window.visualViewport?.height || 0)
    window.visualViewport?.addEventListener('resize', handleVisualViewportResize)
    window.visualViewport?.addEventListener('scroll', handleVisualViewportResize)

    return () => {
      tg?.offEvent('viewportChanged', handleViewportChange)
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize)
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportResize)
      keyboardDown()
    }
  }, [])

  useEffect(() => {
    if (replyMessage && replyMessage.channel === messageWindow?.channel.channelID) {
      inputRef.current?.focus()
    }
  }, [replyMessage])

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 right-0 flex flex-col dark:bg-[#000000] bg-[#F5F7FC] z-[10] overflow-hidden slide-in-from-right"
      style={{
        WebkitOverflowScrolling: 'touch',
        transition: isIOS() ? 'height 0.3s ease-in-out' : '',
        paddingTop: `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 66px)`,
      }}
    >
      <div
        className="absolute flex items-center left-0 right-0 top-0 px-[16px]"
        style={{
          paddingTop: `calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 24px)`,
        }}
      >
        <div className="w-[32px] h-[32px]">
          <Image
            type="avatar"
            rect
            src={chatPeople?.avatar}
            alt="avatar"
            className="w-[32px] h-[32px] rounded-full"
            onClick={() => {
              if (chatPeople) {
                jumpToProfilePage(chatPeople)
              }
            }}
          />
        </div>
        <span
          onClick={() => {
            if (chatPeople) {
              jumpToProfilePage(chatPeople)
            }
          }}
          className="dark:text-white text-[#333] text-lg ml-2"
        >
          {chatPeople?.username}
        </span>
      </div>

      <MemoizedMessageList
        messages={messages}
        channelInfo={chatPeople}
        channelId={messageWindow?.channel.channelID || ''}
        className="flex-1 message-list-scroll-trigger"
        style={{
          marginBottom:
            replyMessage && replyMessage.channel === messageWindow?.channel.channelID
              ? showInput
                ? '107px'
                : '134px'
              : showInput
                ? '49px'
                : '76px',
        }}
      />

      {/* Reply Message */}
      <div
        className={cn(
          'items-center h-[58px] absolute left-0 right-0 dark:bg-black bg-[#ffffff] pl-6 pr-3',
          replyMessage && replyMessage.channel === messageWindow?.channel.channelID
            ? 'border-t border-t-[#EBEBF4] dark:border-t-black'
            : 'border-t-transparent',
          showInput ? 'bottom-[49px]' : 'bottom-[76px]'
        )}
        style={{
          display:
            replyMessage && replyMessage.channel === messageWindow?.channel.channelID
              ? 'flex'
              : 'none',
        }}
      >
        <div
          className="h-8 bg-[#6254FF]"
          style={{
            width: '2px',
            marginRight: '12px',
          }}
        ></div>

        {/* Media Message Preview */}
        {replyMessage?.messageType === MessageType.IMAGE && (
          <ImagePreviewIcon url={replyMessage?.message} />
        )}
        {replyMessage?.messageType === MessageType.VIDEO && (
          <VideoPreviewIcon url={replyMessage?.message} />
        )}

        <div className="flex flex-col flex-1 overflow-hidden text-sm">
          {/* Reply To */}
          <div className="font-medium text-[#6254FF]">Reply to {replyMessage?.toUsername}</div>
          {/* Reply Content */}
          <div className="text-nowrap text-ellipsis overflow-hidden font-normal">
            <span className="text-[#999999]">
              {replyMessage?.messageType === MessageType.REWARD && 'Tips'}
              {replyMessage?.messageType === MessageType.IMAGE && 'Image'}
              {replyMessage?.messageType === MessageType.VIDEO && 'Video'}
            </span>
            <span className="text-[#333]">
              {replyMessage?.messageType === MessageType.TEXT && replyMessage.message}
            </span>
          </div>
        </div>

        {/* Close Icon */}
        <div className="w-6 h-6 flex items-center justify-center ml-[18px]" onClick={closeReply}>
          <i className="iconfont icon-icon_close text-[24px] text-[#707579]"></i>
        </div>
      </div>

      {/* FAKE INPUT */}
      <div
        className={`'flex h-[76px] absolute border-t bottom-0 left-0 right-0 dark:bg-black bg-white pl-[48px]
          ${showInput ? 'hidden ' : 'block '}
          ${replyMessage && replyMessage.channel === messageWindow?.channel.channelID ? 'border-t-transparent ' : 'border-t-[#EBEBF4] dark:border-t-black '}
        `}
      >
        <div className="relative flex items-center w-full h-[46px] box-border">
          <div
            onClick={() => {
              inputRef.current?.focus()
            }}
            className="flex items-center flex-1 h-[36px] text-sm dark:bg-black bg-[#F5F3F3] border-[1px]
        dark:border-[#4B4B4D] border-[#F5F3F3] rounded-full pl-3 pr-[60px] overflow-hidden"
            style={{
              color: message ? '#333333' : '#999999',
            }}
          >
            <span className="flex-1 overflow-hidden whitespace-nowrap">
              {message ? message : 'Type a Message....'}
            </span>
          </div>

          <div className="flex items-center justify-center h-[28px] min-w-[48px] overflow-hidden"></div>

          <div
            onClick={handleSubmit}
            className="absolute items-center justify-center top-[10px] rounded-full h-[26px] w-[48px] right-[54px] cursor-pointer bg-[#6761FF] z[999]"
            style={{
              display: message ? 'flex' : 'none',
            }}
          >
            <i
              className="iconfont icon-a-Frame2085661744 text-white mt-[2px]"
              style={{ fontSize: '20px' }}
            ></i>
          </div>
        </div>
      </div>

      {/* REAL INPUT */}
      <div
        className={cn(
          'flex absolute h-[49px] left-0 right-0 dark:bg-black bg-[#ffffff] border-t dark:border-none overflow-hidden pl-[48px]',
          showInput ? 'bottom-0 opacity-100' : '-top-32 opacity-0',
          replyMessage && replyMessage.channel === messageWindow?.channel.channelID
            ? 'border-t-transparent '
            : 'border-t-[#EBEBF4] dark:border-t-black'
        )}
      >
        <div className="relative flex h-[46px] items-center w-full">
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            type="text"
            className="flex-1 h-[36px] leading-[36px] pb-[1px] pl-[13px] text-sm dark:border-[1px] dark:bg-black
           dark:border-[#4B4B4D] dark:focus:border-[#4B4B4D] focus:border-[#F5F3F3] bg-[#F5F3F3] rounded-full outline-none
            dark:text-white dark:placeholder:text-[#5D5D60] placeholder:text-[#999999] pr-[60px]"
            placeholder="Type a Message..."
          />
          <div className="flex items-center justify-center h-[28px] w-[48px] overflow-hidden"></div>
          <div
            onClick={handleSubmit}
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onTouchEnd={handleSubmit}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onMouseUp={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="absolute items-center justify-center rounded-full top-[10px] h-[26px] w-[48px] right-[54px] cursor-pointer bg-[#6761FF] z[999]"
            style={{
              display: message ? 'flex' : 'none',
            }}
          >
            <i
              className="iconfont icon-a-Frame2085661744 text-white mt-[2px]"
              style={{ fontSize: '20px' }}
            ></i>
          </div>
        </div>
      </div>

      {/* SEND MEDIA */}
      <div
        className="absolute left-[10px] w-[28px]"
        style={{ zIndex, bottom: showInput ? '8px' : '36px' }}
      >
        <SendMediaModal
          tgid={Number(uid)}
          beforeOpen={() => {
            setZIndex(101)
            inputRef.current?.blur()
          }}
          beforeClose={() => {
            setZIndex(98)
          }}
        />
      </div>
      <div
        className="absolute right-[2px] w-[48px]  flex items-center justify-center h-[36px] z-[98]"
        style={{ bottom: showInput ? '8px' : '35px' }}
      >
        <RewardButton userInfo={chatPeople || ({} as OthersUserInfo)} />
      </div>
    </div>
  )
}

export default MessagePageIOS
