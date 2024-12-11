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
  const [showInput, setShowInput] = useState(false)
  const jumpToProfilePage = useProfileNavigation()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const handleSend = ({ type, text }: { type: MessageType; text?: string }) => {
    const newMessage = formatMessage({
      type,
      text,
      to: Number(uid),
    })
    sendMessage(newMessage)
  }

  const handleSendText = () => {
    if (message.trim()) {
      runDailyChat()
      handleSend({ type: MessageType.TEXT, text: message.trim() })
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
    handleSendText()
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

    const handleViewportChange = () => {
      console.log('###### TG viewportChanged ######')
      console.log('tg.viewportStableHeight', tg.viewportStableHeight)
      console.log('initTgViewportHeightRef', initTgViewportHeightRef.current)
      console.log('initVisualViewportHeightRef', initVisualViewportHeightRef.current)
      console.log('###### TG viewportChanged ######')
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up')
        containerRef.current!.style.height = `${tg.viewportStableHeight}px`
      } else {
        console.log('keyboard down')
        containerRef.current!.style.height = `${initVisualViewportHeightRef.current - 84}px`
        document.body.scrollIntoView()
      }
    }

    // 这个函数在视口稳定后执行 可以在这个之后稳定real input位置
    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return
      const currentHeight = window.visualViewport.height

      console.log('###### window visualViewport ######')
      console.log('visualViewport.height', currentHeight)
      console.log('tg.viewportStableHeight', tg.viewportStableHeight)
      console.log('###### window visualViewport ######')

      // 这个有时候会获取不到初始的高度
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up 2')
        containerRef.current!.style.height = `${currentHeight}px`
        setShowInput(true)
      } else {
        console.log('keyboard down 2')
        containerRef.current!.style.height = `${currentHeight - 84}px`
        setShowInput(false)
        document.body.scrollIntoView()
      }
    }

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
    }
  }, [])

  console.log('MessagePage render', messageWindow)
  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 right-0 flex flex-col dark:bg-[#000000] bg-white z-[999] overflow-hidden slide-in-from-right"
      style={{
        WebkitOverflowScrolling: 'touch',
        transition: isIOS() ? 'height 0.3s ease-in-out' : '',
        paddingTop: `calc(${
          window
            .getComputedStyle(document.documentElement)
            .getPropertyValue('--tg-safe-area-inset-top') &&
          parseInt(
            window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--tg-safe-area-inset-top'),
            10
          ) !== 0
            ? 'var(--tg-safe-area-inset-top) + 100px'
            : '76px'
        })`,
      }}
    >
      <div
        className="fixed flex items-center left-0 right-0 top-[10px] px-[16px]"
        style={{
          paddingTop: `calc(${
            window
              .getComputedStyle(document.documentElement)
              .getPropertyValue('--tg-safe-area-inset-top') &&
            parseInt(
              window
                .getComputedStyle(document.documentElement)
                .getPropertyValue('--tg-safe-area-inset-top'),
              10
            ) !== 0
              ? 'var(--tg-safe-area-inset-top) + 54px'
              : '24px'
          })`,
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
        className="flex-1 mb-[68px]"
      />

      {/* FAKE INPUT */}
      <div
        className={`'flex h-[68px] absolute border-t border-t-[#EBEBF4] dark:border-t-black bottom-0 left-0 right-0 dark:bg-black bg-white pr-[14px] pt-[5px] pl-[42px] ${
          showInput ? 'hidden' : 'block'
        }`}
      >
        <div
          onClick={() => {
            inputRef.current?.focus()
          }}
          className="flex items-center flex-1 h-[36px] text-sm dark:bg-black bg-[#F5F3F3] border-[1px]
        dark:border-[#4B4B4D] border-[#F5F3F3] rounded-full px-3"
          style={{
            color: message ? '#333333' : '#999999',
          }}
        >
          {message ? message : 'Type a Message....'}
        </div>
        <div
          onClick={handleSubmit}
          className="absolute items-center justify-center top-[10px] rounded-full h-[26px] w-[48px] right-[20px] cursor-pointer bg-[#6761FF] z[999]"
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

      <div className="absolute left-[10px] bottom-[28px] w-[28px] z-[99]">
        <SendMediaModal
          tgid={Number(uid)}
          beforeOpen={() => {
            inputRef.current?.blur()
          }}
        />
      </div>

      {/* REAL INPUT */}
      <div
        className={cn(
          'flex h-[68px] absolute left-0 right-0 dark:bg-black bg-[#ffffff] border-t dark:border-none border-t-[#F5F3F3] overflow-hidden',
          showInput ? 'bottom-0 opacity-100' : '-top-32 opacity-0'
        )}
      >
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          type="text"
          className="absolute left-[42px] right-[14px] top-[5px] h-[36px] text-sm dark:border-[1px] dark:bg-black
           dark:border-[#4B4B4D] dark:focus:border-[#4B4B4D] focus:border-[#F5F3F3] bg-[#F5F3F3] rounded-full px-3 outline-none
            dark:text-white dark:placeholder:text-[#5D5D60] placeholder:text-[#999999] pr-[60px]"
          placeholder="Type a Message..."
        />
        <div
          onClick={handleSubmit}
          className="absolute items-center justify-center rounded-full top-[10px] h-[26px] w-[48px] right-[20px] cursor-pointer bg-[#6761FF] z[999]"
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
  )
}
export default MessagePageIOS
