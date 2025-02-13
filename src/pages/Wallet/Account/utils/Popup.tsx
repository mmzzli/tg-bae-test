// PopupComponent.js
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import classNames from 'classnames'
import { SafeArea, TPopup } from '@/components/tmd'

const PopupComponent = ({
  content,
  visible,
  onClose,
  title
}: {
  content: React.ReactNode
  visible: boolean
  onClose: () => void
  title?: string
}) => {
  return ReactDOM.createPortal(
    <TPopup
      title={title}
      showCloseButton
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
      bodyStyle={{
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px'
      }}
      bodyClassName={classNames('flex flex-col', {
        'h-[calc(100vh-41px)]': !window.Telegram.WebApp?.isFullscreen,
        'h-[calc(100vh-135px)]': window.Telegram.WebApp?.isFullscreen
      })}
      safeArea={false}
    >
      <div
        className={classNames(
          'p-5 pt-[0px] flex flex-1 flex-col items-center justify-start overflow-y-auto no-scrollbar'
        )}
      >
        {content}
      </div>
      <SafeArea position="bottom" />
    </TPopup>,
    document.body
  )
}

export default PopupComponent
