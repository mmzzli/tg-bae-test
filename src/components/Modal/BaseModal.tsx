import React, { useEffect, ReactNode, FC } from 'react'
import { CloseIcon } from '@/assets/icons'
import { Image } from '@chakra-ui/react'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends Record<string, any> {
    Telegram: any
  }
}

interface Position {
  height?: string
  maxHeight?: string
  minHeight?: string
  backgroundColor?: string
}

interface AnimationConfig {
  duration?: number
  timingFunction?: string
}

interface ThemeConfig {
  darkBackgroundColor?: string
  lightBackgroundColor?: string
  handleColor?: string
}

interface BottomSheetProps extends Partial<Position> {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  animation?: AnimationConfig
  theme?: ThemeConfig
  className?: string
  style?: React.CSSProperties
  closeOnBackdropClick?: boolean
  showHandle?: boolean
}

const DEFAULT_ANIMATION: Required<AnimationConfig> = {
  duration: 300,
  timingFunction: 'ease-out',
}

const DEFAULT_THEME: Required<ThemeConfig> = {
  darkBackgroundColor: '#1c1c1d',
  lightBackgroundColor: '#ffffff',
  handleColor: '#e5e7eb',
}

export const BaseModal: FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = '50vh',
  maxHeight,
  minHeight,
  backgroundColor,
  animation = DEFAULT_ANIMATION,
  theme = DEFAULT_THEME,
  className = '',
  style = {},
  closeOnBackdropClick = true,
  showHandle = true,
}) => {
  const getTelegramTheme = (): { isDark: boolean; backgroundColor: string } => {
    try {
      const webApp = window.Telegram?.WebApp
      const isDark = webApp?.colorScheme === 'dark'
      const bgColor = isDark ? theme.darkBackgroundColor : theme.lightBackgroundColor

      return {
        isDark,
        backgroundColor: webApp?.backgroundColor || bgColor,
      }
    } catch {
      return {
        isDark: false,
        backgroundColor: theme.lightBackgroundColor ?? '',
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      const { backgroundColor } = getTelegramTheme()
      document.body.style.backgroundColor = backgroundColor
    }
  }, [isOpen, theme])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const sheetStyle: React.CSSProperties = {
    height,
    maxHeight,
    minHeight,
    backgroundColor: backgroundColor || getTelegramTheme().backgroundColor,
    transition: `transform ${animation.duration}ms ${animation.timingFunction}`,
    ...style,
  }
  useEffect(()=>{
    if(isOpen){
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  },[isOpen])

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? 'visible bg-black/80' : 'invisible'
      } transition-all duration-300`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      style={{transform: 'translateZ(10px)'}}
    >
      <div
        className={`fixed bottom-0 left-0 right-0 rounded-t-2xl bg-[#1C1C1C] dark:bg-gray-800 transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${className}`}
        style={sheetStyle}
      >
        {showHandle && (
          <div
            className="w-12 h-1 mx-auto mt-3 rounded-full"
            style={{ backgroundColor: theme.handleColor }}
            role="presentation"
          />
        )}

        <div
          className="p-[16px] overflow-y-auto  bg-[#1C1C1C] text-[#E0E2F6] rounded-t-2xl rounded-b-none border-[#1c1c1c]"
          style={{ height: 'calc(100%)' }}
        >
          <Image src={CloseIcon} className="cursor-pointer" onClick={handleBackdropClick} />
          <div className="flex justify-center px-[8px]">{children}</div>
        </div>
      </div>
    </div>
  )
}
