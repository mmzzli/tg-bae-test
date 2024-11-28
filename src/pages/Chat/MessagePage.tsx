import { useState, useEffect, useRef, memo, useCallback } from 'react'
// import { MessageList } from '@/components/Chat/NewMessageListOrigin'
import { MessageList } from '@/components/Chat/MessageList'
import { MessageType, WrappedMessage } from '@/components/Chat/types'
import { useParams } from 'react-router-dom'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useStore } from '@/store'
import { OthersUserInfo } from '@/types'
import Image from '@/components/Image/Image'
import { cn } from '@/utils/utils'
import { AttachIcon } from '@/assets/icons'
import { useTouch } from '@/hooks/useTouch'
import SendMediaModal from '@/components/Chat/SendMediaModal'

const defaultMessages: WrappedMessage[] = []

const MemoizedMessageList = memo(MessageList)

const MessagePage = () => {
  const { uid } = useParams()
  const [messages, setMessages] = useState<WrappedMessage[]>(defaultMessages)
  const [message, setMessage] = useState('')
  const [chatPeople, setChatPeople] = useState<OthersUserInfo | null>(null)
  const [iosFirstRender, setIosFirstRender] = useState(true)
  const { formatMessage } = useFormatMessage()
  const { sendMessage, getMessageWindow, getChatPeopleInfo } = useIM()
  const messageWindow = getMessageWindow(uid || '')
  const messageWindowList = useStore((state) => state.messageWindowList)
  const [isFocused, setIsFocused] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const attachRef = useRef<HTMLInputElement>(null)
  const [vh, setVh] = useState(0)
  const [tgViewportHeight, setTgViewportHeight] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [toBottomTrigger, setToBottomTrigger] = useState(false)
  const { touchHandlers } = useTouch({
    onTap: () => {
      attachRef.current?.click()
    },
  })

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange', e)
  }, [])

  const handleSend = useCallback(
    ({ type, text }: { type: MessageType; text?: string }) => {
      const newMessage = formatMessage({
        type,
        text,
        to: Number(uid),
      })
      sendMessage(newMessage)
      setTimeout(() => {
        setToBottomTrigger((prev) => !prev)
      }, 0)
    },
    [formatMessage, sendMessage, uid]
  )

  const handleSendText = useCallback(() => {
    if (message.trim()) {
      handleSend({ type: MessageType.TEXT, text: message.trim() })
      setMessage('')
    }
  }, [message, handleSend])

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSendText()
      }
    },
    [handleSendText]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      handleSendText()
    },
    [handleSendText]
  )

  const isFocusedRef = useRef(isFocused)

  useEffect(() => {
    isFocusedRef.current = isFocused
  }, [isFocused])

  useEffect(() => {
    console.log('messageWindow | messageWindowList change', messageWindow, messageWindowList)
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

  useEffect(() => {
    if (!containerRef.current) return
    const tg = window.Telegram?.WebApp

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
    }

    handleVisualViewportResize()

    return () => {
      tg.offEvent('viewportChanged', handleViewportChange)
    }
  }, [])

  useEffect(() => {
    setShowInput(isFocused)
  }, [isFocused])

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 right-0 flex flex-col bg-[#000000] z-10 overflow-auto scrollbar-hide"
      style={{
        bottom: 0,
        WebkitOverflowScrolling: 'touch',
        paddingTop: `calc(${window.getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-top') ? 'var(--tg-safe-area-inset-top) + 130px' : '76px'})`,
      }}
    >
      <div className="absolute flex items-center left-0 right-0 top-[10px] px-[16px] pt-[24px] h-[56px]">
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

      <div
        className={cn(
          'flex h-[68px] absolute left-0 right-0 bottom-0 bg-[#000000] pt-[8px] overflow-hidden'
        )}
      >
        <div className="absolute left-[10px] right-[16px] top-[8px] flex items-center h-[34px] bg-[#000000] overflow-hidden">
          <SendMediaModal tgid={Number(uid)} />
          <input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={() => setIsFocused(false)}
            type="text"
            className="absolute left-[36px] right-0 top-0 h-[34px] text-default bg-black border-[1px] border-[#4B4B4D]
            focus:border-[#4B4B4D] rounded-full pl-3 pr-[60px] outline-none text-white placeholder:text-[#5D5D60] overflow-hidden"
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
      </div>
    </div>
  )
}
export default MessagePage
