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
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}
const MemoizedMessageList = memo(MessageList)
const MessagePage = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [message, setMessage] = useState('')
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  const [iosFirstRender, setIosFirstRender] = useState(true)
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
  const [keyboardHeight, setKeyboardHeight] = useState(0)

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

  useEffect(() => {
    isFocusedRef.current = isFocused
  }, [isFocused])

  useEffect(() => {
    if (!containerRef.current) return
    const tg = window.Telegram?.WebApp
    // update：还是不可以 需要等待键盘收起或弹出完成之后 处理页面input才不会有问题
    // IOS  tg.viewportHeight
    // other window.visualViewport.height
    const handleViewportChange = (firstRender: boolean = false) => {
      if (containerRef.current && isFocusedRef.current) {
        containerRef.current.style.height = `${tg.viewportHeight}px`
      } else if (containerRef.current) {
        containerRef.current.style.height = `${tg.viewportHeight - 84}px`
      }
      if (iosFirstRender) {
        setTimeout(() => {
          setVh(window.visualViewport!.height)
          setTgViewportHeight(tg.viewportHeight + '')
        }, 0)
      } else {
        setVh(window.visualViewport!.height)
        setTgViewportHeight(tg.viewportHeight + '')
      }
      setIosFirstRender(firstRender)
    }

    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return
      const currentHeight = window.visualViewport.height
      const windowHeight = window.innerHeight
      const keyboardHeight = windowHeight - currentHeight

      if (containerRef.current && isFocusedRef.current) {
        containerRef.current.style.height = `${currentHeight}px`
      } else if (containerRef.current) {
        containerRef.current.style.height = `${currentHeight - 84}px`
      }
      setVh(currentHeight)
      setTgViewportHeight(windowHeight + '')
      setKeyboardHeight(keyboardHeight)
      console.log('containerRef.current', currentHeight)
    }

    // IOS
    // if (isIOS()) {
    //   handleViewportChange(true)
    //   tg.onEvent('viewportChanged', handleViewportChange)
    // } else {
    // Other Device
    handleVisualViewportResize()
    if (isIOS()) {
      window.visualViewport?.addEventListener('resize', handleVisualViewportResize)
      window.visualViewport?.addEventListener('scroll', handleVisualViewportResize)
    }
    // }

    return () => {
      tg.offEvent('viewportChanged', handleViewportChange)
      window.visualViewport?.removeEventListener('resize', handleVisualViewportResize)
      window.visualViewport?.removeEventListener('scroll', handleVisualViewportResize)
    }
  }, [])

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
      className="absolute top-0 left-0 right-0 flex flex-col bg-[#000000] z-10 pt-[76px] overflow-auto scrollbar-hide"
      style={{
        bottom: isIOS() ? '' : 0,
        WebkitOverflowScrolling: 'touch',
        // transition: isFocused ? 'height 0.3s ease-out' : 'none',
      }}
    >
      {/* TEST CODE */}
      {/* <div className="absolute bottom-1/2 left-0 bg-[#f39292] z-[9999] translate-y-10">
        {vh}/{tgViewportHeight}
        <div>{showInput ? 'showInput true' : 'showInput false'}</div>
        <div>{showInput ? 'bottom-0 bg-slate-100' : '-top-32 bg-slate-200'}</div>
        {vh}/{tgViewportHeight}
        <div>
          {' '}
          {vh}/{tgViewportHeight}/{keyboardHeight}
        </div>
        {isIOS() ? 'ios true' : 'ios false'}
        <div>{iosFirstRender ? 'iosFirstRender true' : 'iosFirstRender false'}</div>
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
        hasMore={false}
        channelInfo={chatPeople}
        className="flex-1 pb-[68px]"
      />

      {/* FAKE INPUT */}
      <div
        className={`'flex h-[68px] absolute bottom-0 left-0 right-0 bg-[#000000] pr-8 pl-6 pt-[8px] ${
          isFocused || !isIOS() ? 'hidden' : 'block'
        }`}
      >
        <div
          onClick={() => {
            inputRef.current?.focus()
            setIsFocused(true)
            if (!isIOS()) {
              setTimeout(() => {
                inputRef.current?.scrollIntoView(false)
              }, 400)
            }
          }}
          className="flex items-center flex-1 h-[36px] text-default bg-black border-[0.5px]
        border-[#4B4B4D] rounded-full px-3 text-[#5D5D60]"
        >
          Type a Message Fake...
        </div>
      </div>

      {/* REAL INPUT */}
      <form
        onSubmit={handleSubmit}
        className={cn(
          'flex h-[68px] absolute left-0 right-0 bg-[#000000] pr-4 pt-[8px]',
          isFocused || !isIOS() ? 'opacity-100' : 'opacity-0',
          showInput || !isIOS() ? 'bottom-0' : '-top-32'
        )}
      >
        <div className="flex items-center h-[34px] w-full bg-[#000000] pr-4 pl-6">
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
            className="flex-1 h-[36px] text-default bg-black border-[0.5px] border-[#4B4B4D] focus:border-[#4B4B4D] rounded-full px-3 outline-none text-white placeholder:text-[#5D5D60]"
            placeholder="Type a Message..."
          />
        </div>
      </form>
    </div>
  )
}
export default MessagePage
