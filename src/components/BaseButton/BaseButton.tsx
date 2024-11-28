import { ReactNode } from 'react'

type Props = {
  text: string
  icon?: ReactNode
  iconRight?: ReactNode
  handler: () => void
  width?: string // Optional width prop
  height?: string // Optional width prop
  className?: string
  loading?: boolean
  disabled?: boolean
}

const BaseButton = ({
  text,
  icon,
  iconRight,
  handler,
  width,
  height = '36px',
  className,
  loading = false,
  disabled = false,
}: Props) => {
  return (
    <div>
      <div
        className={`no-tap flex items-center justify-center gap-2 bg-[#4A3AFF] rounded-[42px]
          text-[#ffffff] dark:text-[#E0E2F6] text-sm font-medium cursor-pointer
          ${className} ${loading || disabled ? 'bg-[#6a5cfc] cursor-not-allowed' : ''}`}
        onClick={() => !loading && !disabled && handler()}
        style={{ width, height }}
      >
        {loading && (
          <div className="w-5 h-5 border-4 border-t-4 border-t-white border-transparent rounded-full animate-spin"></div>
        )}
        {icon}
        <span className="font-medium !important">{text}</span>
        {iconRight}
      </div>
    </div>
  )
}

export default BaseButton
