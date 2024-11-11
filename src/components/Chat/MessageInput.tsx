import { AttachIcon } from '@/assets/icons'
import Image from '@/components/Image/Image'
import { useEffect, useRef, useState } from 'react'

export const MessageInput = ({ onSend }: { onSend: (content: string) => void }) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // auto focus
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim())
      setMessage('')
      // after send, keep focus
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  // mobile submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend()
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center h-[42px] w-full bg-[#303030] pr-4">
      <div className="flex items-center h-[42px] w-full bg-[#303030] pr-4">
        <div className="w-[28px] h-[28px] mx-[10px] cursor-pointer">
          <Image src={AttachIcon} />
        </div>
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          type="text"
          className="flex-1 h-[34px] bg-black border-[#4B4B4D] rounded-full px-3 outline-none text-white"
          placeholder="Type a Message..."
        />
      </div>
    </form>
  )
}
