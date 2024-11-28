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
// const PAGE_SIZE = 20

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
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [initTgViewportHeight, setInitTgViewportHeight] = useState(0)

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

  useEffect(() => {
    initTgViewportHeightRef.current = initTgViewportHeight
  }, [initTgViewportHeight])

  useEffect(() => {
    if (!containerRef.current) return
    const tg = window.Telegram?.WebApp
    setInitTgViewportHeight(tg.viewportStableHeight)
    // 这个函数在视口变化时立即执行 可以提前确定布局
    const handleViewportChange = () => {
      console.log(
        'handleViewportChange------------------',
        tg.viewportStableHeight,
        initTgViewportHeightRef.current
      )
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up')
        containerRef.current!.style.height = `${tg.viewportStableHeight}px`
      } else {
        console.log('keyboard down')
        containerRef.current!.style.height = `${tg.viewportStableHeight - 74}px`
      }
    }

    // 这个函数在视口稳定后执行 可以在这个之后稳定real input位置
    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return
      const currentHeight = window.visualViewport.height

      console.log(
        'currentHeight',
        currentHeight,
        tg.viewportStableHeight,
        initTgViewportHeightRef.current
      )

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
      className="absolute top-0 left-0 right-0 flex flex-col bg-[#000000] z-[999] overflow-auto scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
        transition: 'height 0.3s ease-in-out',
        paddingTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? 'var(--tg-safe-area-inset-top) + 100px' : '76px'})`,
      }}
    >
      {/* TEST CODE */}
      {/* <div className="absolute bottom-1/2  left-0 bg-[#f39292] z-[9999] translate-y-20">
        <div>{showInput ? 'showInput true' : 'showInput false'}</div>
        <div>{showInput ? 'bottom-0 bg-slate-100' : '-top-32 bg-slate-200'}</div>
        {vh}/{tgViewportHeight}
        <div>initTgViewportHeight: {initTgViewportHeight}</div>
        {'ios true'}
      </div> */}

      <div
        className="fixed flex items-center left-0 right-0 top-[10px] px-[16px]"
        style={{
          paddingTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? 'var(--tg-safe-area-inset-top) + 54px' : '24px'})`,
        }}
      >
        <Image
          type="avatar"
          rect
          src={chatPeople?.avatar}
          alt="avatar"
          className="w-[32px] h-[32px] rounded-full"
        />
        <span className="text-[#FFFFFF] text-lg ml-2">{chatPeople?.username}</span>
      </div>

      <MemoizedMessageList
        messages={messages}
        channelInfo={chatPeople}
        className="flex-1 mb-[68px]"
      />

      {/* FAKE INPUT */}
      <div
        className={`'flex h-[68px] absolute bottom-0 left-0 right-0 bg-[#000000] pr-[14px] pt-[8px] pl-[42px] ${
          showInput ? 'hidden' : 'block'
        }`}
      >
        <div
          onClick={() => {
            inputRef.current?.focus()
          }}
          className="flex items-center flex-1 h-[36px] text-sm bg-black border-[1px]
        border-[#4B4B4D] rounded-full px-3"
          style={{
            color: message ? '#FFFFFF' : '#5D5D60',
          }}
        >
          {message ? message : 'Type a Message....'}
        </div>
        <div
          onClick={handleSubmit}
          className="absolute items-center justify-center top-[8px] h-[34px] right-[27px] cursor-pointer text-[#6761FF] text-sm z[999]"
          style={{
            display: message ? 'flex' : 'none',
          }}
        >
          Send
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
          'flex h-[68px] absolute left-0 right-0 bg-[#000000] overflow-hidden',
          // isFocused ? 'opacity-100' : 'opacity-0',
          showInput ? 'bottom-0 opacity-100' : '-top-32 opacity-0'
        )}
      >
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          type="text"
          className="absolute left-[42px] right-4 top-[8px] h-[36px] text-sm bg-black border-[1px]
           border-[#4B4B4D] focus:border-[#4B4B4D] rounded-full px-3 outline-none
            text-white placeholder:text-[#5D5D60] pr-[60px]"
          placeholder="Type a Message..."
        />
        <div
          onClick={handleSubmit}
          className="absolute items-center justify-center top-[8px] h-[34px] right-[27px] cursor-pointer text-[#6761FF] text-sm z[999]"
          style={{
            display: message ? 'flex' : 'none',
          }}
        >
          Send
        </div>
      </div>
    </div>
  )
}
export default MessagePageIOS
