import { cn } from '@/utils/utils'
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
  loadingColor? :string
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
  loadingColor = 'border-t-[#ffffff]'
}: Props) => {
  return (
    <div>
      <div
        className={cn(
          'relative no-tap flex items-center justify-center gap-2 bg-[#6254FF] dark:bg-[#4A3AFF] rounded-[42px] text-white dark:text-[#E0E2F6] text-sm font-medium cursor-pointer',
          className,
          // loading || disabled
          //   ? 'dark:bg-[#6a5cfc] bg-[#D1D0DE] cursor-not-allowed text-white border-[#D1D0DE]'
          //   : ''
        )}
        onClick={() => !loading && !disabled && handler()}
        style={{ width, height }}
      >
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className={cn(
              `w-5 h-5 border-2 border-t-2 border-transparent rounded-full animate-spin`,
              loadingColor
            )}></div>
          </div>
        )}
        {!loading && icon}
        <span className="font-medium !important">{!loading && text}</span>
        {!loading && iconRight}
      </div>
    </div>
  )
}

export default BaseButton
