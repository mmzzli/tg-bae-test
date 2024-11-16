import { AttachIcon } from '@/assets/icons'
import Image from '@/components/Image/Image'
import { useEffect, useRef, useState } from 'react'
import { MessageType } from './types'

export const MessageInput = ({
  onSend,
}: {
  onSend: ({ type, text }: { type: MessageType; text?: string }) => void
}) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // auto focus
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendText = () => {
    if (message.trim()) {
      onSend({ type: MessageType.TEXT, text: message.trim() })
      setMessage('')
      // after send, keep focus
      inputRef.current?.focus()
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

  return (
    <form onSubmit={handleSubmit} className="flex h-[68px] w-full bg-[#0D0D0D] pr-4 pt-[8px]">
      <div className="flex items-center h-[34px] w-full bg-[#0D0D0D] pr-4 pl-6">
        {/* <div className="w-[28px] h-[28px] mx-[10px] cursor-pointer">
          <Image src={AttachIcon} />
        </div> */}
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          type="text"
          className="flex-1 h-[36px] text-default bg-black border-[0.5px] border-[#4B4B4D] focus:border-[#4B4B4D] rounded-full px-3 outline-none text-white placeholder:text-[#5D5D60]"
          placeholder="Type a Message..."
        />
      </div>
    </form>
  )
}
