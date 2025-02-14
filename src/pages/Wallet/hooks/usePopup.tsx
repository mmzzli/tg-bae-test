import { TPopup, TPopupProps } from '@/components/tmd'
import classNames from 'clsx'
import { CSSProperties, useState } from 'react'

const usePopup = ({
  content,
  onClose,
  contentClassName,
  initVisible = false,
  onMaskClick,
  maskGesture = true,
  fullscreen = false,
  bodyStyle,
  ...restProps
}: TPopupProps & {
  content?: React.ReactNode
  contentClassName?: string
  initVisible?: boolean
  onMaskClick?: () => void
  maskGesture?: boolean
  fullscreen?: boolean
}) => {
  const [open, setOpen] = useState(initVisible)

  return {
    open,
    setOpen,
    component: (
      <TPopup
        visible={open}
        onMaskClick={() => {
          if (maskGesture) {
            setOpen(false)
            onMaskClick?.()
          }
        }}
        onClose={() => {
          onClose && onClose()
          setOpen(false)
        }}
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          ...bodyStyle,
        }}
        bodyClassName={classNames('flex flex-col', {
          'h-[calc(100vh-41px)]': fullscreen && !window.Telegram.WebApp?.isFullscreen,
          'h-[calc(100vh-135px)]': fullscreen && window.Telegram.WebApp?.isFullscreen,
        })}
        {...restProps}
      >
        <div className={classNames('flex-1', contentClassName)}>{open ? content : null}</div>
      </TPopup>
    ),
  }
}

export default usePopup
