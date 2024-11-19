import { AttachIcon } from '@/assets/icons'
import Image from '@/components/Image/Image'
import { useEffect, useRef, useState, forwardRef } from 'react'
import { Message, MessageType } from './types'
interface MessageInputProps {
  onSend: (message: Message) => void
  setIsFocused: (focused: boolean) => void
  className?: string
}
const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>((props, ref) => {
  const { onSend, setIsFocused, className } = props
  const [message, setMessage] = useState('')

  const handleSendText = () => {
    if (message.trim()) {
      onSend({ type: MessageType.TEXT, text: message.trim() })
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

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex h-[68px] w-full bg-[#000000] pr-4 pt-[8px] ${className}`}
    >
      <div className="flex items-center h-[34px] w-full bg-[#000000] pr-4 pl-6">
        {/* <div className="w-[28px] h-[28px] mx-[10px] cursor-pointer">
          <Image src={AttachIcon} />
        </div> */}
        <input
          ref={ref}
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
})

export default MessageInput
