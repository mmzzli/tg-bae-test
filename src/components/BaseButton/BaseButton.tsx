import React, { ReactNode } from 'react'

type Props = {
  text: string
  icon?: ReactNode
  handler: () => void
  width?: string // Optional width prop
  height?: string // Optional width prop
}

const BaseButton = ({ text, icon, handler, width, height = '12' }: Props) => {
  return (
    <div>
      <div
        className={`flex items-center justify-center gap-2 h-${height} bg-[#4A3AFF] rounded-[42px] text-[#E0E2F6] text-sm font-medium cursor-pointer`}
        onClick={handler}
        style={{ width }}
      >
        {icon}
        {text}
      </div>
    </div>
  )
}

export default BaseButton
