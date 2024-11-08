import { ReactNode } from 'react'

type Props = {
  text: string
  icon?: ReactNode
  handler: () => void
  width?: string // Optional width prop
  height?: string // Optional width prop
  className?: string
  loading?: boolean
}

const BaseButton = ({
  text,
  icon,
  handler,
  width,
  height = '36px',
  className,
  loading = false,
}: Props) => {
  return (
    <div>
      <div
        className={`no-tap flex items-center justify-center gap-2 bg-[#4A3AFF] rounded-[42px] text-[#E0E2F6] text-sm font-medium cursor-pointer ${className}`}
        onClick={() => !loading && handler()}
        style={{ width, height }}
      >
        {icon}
        {text}
      </div>
    </div>
  )
}

export default BaseButton
