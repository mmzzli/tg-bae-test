import { useState, useEffect, useRef, memo } from 'react'
import { MessageList } from '@/components/Chat/MessageList'
// import MessageInput from '@/components/Chat/MessageInput'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'
import { OthersUserInfo } from '@/types'
import Image from '@/components/Image/Image'
import { cn } from '@/utils/utils'
// const PAGE_SIZE = 20

const defaultMessages: WrappedMessage[] = []

const MemoizedMessageList = memo(MessageList)
const MessagePageIOS = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [message, setMessage] = useState('')
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  // const [page, setPage] = useState(1)
  // const [hasMore, setHasMore] = useState(true)
  const { formatMessage } = useFormatMessage()
  const { sendMessage, getMessageWindow, getChatPeopleInfo } = useIM()
  const messageWindow = getMessageWindow(uid || '')
  const messageWindowList = useStore((state) => state.messageWindowList)
  const [isFocused, setIsFocused] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [vh, setVh] = useState(0)
  const [tgViewportHeight, setTgViewportHeight] = useState('')
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

  const isFocusedRef = useRef(isFocused)
  const initTgViewportHeightRef = useRef(0)

  useEffect(() => {
    isFocusedRef.current = isFocused
  }, [isFocused])

  useEffect(() => {
    initTgViewportHeightRef.current = initTgViewportHeight
  }, [initTgViewportHeight])

  useEffect(() => {
    if (!containerRef.current) return
    const tg = window.Telegram?.WebApp
    setInitTgViewportHeight(tg.viewportStableHeight)
    const handleViewportChange = () => {
      console.log(
        'handleViewportChange------------------',
        tg.viewportStableHeight,
        initTgViewportHeight
      )
      if (tg.viewportStableHeight < initTgViewportHeight) {
        console.log('keyboard up')
      } else {
        console.log('keyboard down')
      }
      setTgViewportHeight(tg.viewportStableHeight)
    }

    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return
      const currentHeight = window.visualViewport.height

      // if (containerRef.current && isFocusedRef.current) {
      //   containerRef.current.style.height = `${currentHeight}px`
      // } else if (containerRef.current) {
      //   containerRef.current.style.height = `${currentHeight - 84}px`
      // }

      console.log('currentHeight', tg.viewportStableHeight, initTgViewportHeightRef.current)
      // 这个有时候会获取不到初始的高度
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up 2')
        containerRef.current!.style.height = `${currentHeight}px`
      } else {
        console.log('keyboard down 2')
        containerRef.current!.style.height = `${currentHeight - 84}px`
        setIsFocused(false)
        document.body.scrollIntoView()
      }
      setVh(currentHeight)
    }

    // IOS
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

  // show real input after height change
  useEffect(() => {
    if (isFocused) {
      setShowInput(true)
    } else {
      setShowInput(false)
    }
  }, [vh])

  console.log('MessagePage render', messageWindow)
  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 right-0 flex flex-col bg-[#000000] z-[999] pt-[76px] overflow-auto scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
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

      <div className="fixed flex items-center left-0 right-0 top-[10px] px-[16px] pt-[24px] h-[56px]">
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
        className={`'flex h-[68px] absolute bottom-0 left-0 right-0 bg-[#000000] px-[14px] pt-[8px] ${
          isFocused ? 'hidden' : 'block'
        }`}
      >
        <div
          onClick={() => {
            inputRef.current?.focus()
            setIsFocused(true)
          }}
          className="flex items-center flex-1 h-[36px] text-sm bg-black border-[1px]
        border-[#4B4B4D] rounded-full px-3"
          style={{
            color: message ? '#FFFFFF' : '#5D5D60',
          }}
        >
          {message ? message : 'Type a Message....'}
        </div>
      </div>

      {/* REAL INPUT */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex h-[68px] absolute left-0 right-0 bg-[#000000] pl-6 pr-8 pt-[8px] overflow-hidden',
          isFocused ? 'opacity-100' : 'opacity-0',
          showInput ? 'bottom-0' : '-top-32'
        )}
      >
        <div className="absolute left-[14px] right-[14px] flex items-center h-[34px] bg-[#000000]">
          {/* <div className="w-[28px] h-[28px] mx-[10px] cursor-pointer">
          <Image src={AttachIcon} />
        </div> */}
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => {
              setIsFocused(false)
            }}
            type="text"
            className="flex-1 h-[36px] text-sm bg-black border-[1px] border-[#4B4B4D] focus:border-[#4B4B4D] rounded-full px-3 outline-none text-white placeholder:text-[#5D5D60] pr-[60px]"
            placeholder="Type a Message..."
          />
        </div>
        <div
          onClick={handleSubmit}
          className="absolute items-center justify-center h-[34px] right-[27px] cursor-pointer text-[#6761FF] text-sm"
          style={{
            display: message ? 'flex' : 'none',
          }}
        >
          Send
        </div>
      </form>
    </div>
  )
}
export default MessagePageIOS
