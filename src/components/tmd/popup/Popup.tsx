import classNames from 'clsx'
import type { FC } from 'react'
import { PopupProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { Popup as APopup, SafeArea } from 'antd-mobile'
import { IconButton } from '../icon-button/IconButton'
import clsx from 'clsx'
import { isIOS } from '../utils/validate'

const defaultProps = {
  safeArea: true,
  closeIcon: (
    <div
      className="flex items-center justify-center bg-[#F5F5FA] rounded-full ml-auto no-tap mb-3"
      style={{ height: '36px', width: '36px' }}
    >
      <i className="iconfont icon-icon_close text-[#12122A] dark:text-[#E0E2F6] text-[20px]"></i>
    </div>
  ),
  maskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
}

export const Popup: FC<PopupProps> = (p) => {
  const props = mergeProps(p, defaultProps)
  const { children, title, safeArea, className, titleClassName, bodyClassName, ...restProps } =
    props

  const defaultClassName = 'tmd-popup'

  return (
    <APopup
      {...restProps}
      className={classNames(defaultClassName, className)}
      bodyClassName={classNames(
        'bg-[#fff] dark:bg-[#1C1C1C] text-[#E0E2F6] rounded-t-2xl rounded-b-none border-[#1c1c1c]',
        bodyClassName
      )}
    >
      {title ? (
        <div
          className={classNames(
            'flex flex-row-reverse items-center px-5 py-3 text-xl font-semibold text-t1',
            titleClassName
          )}
        >
          <h3 className="flex-1 truncate">{title}</h3>
        </div>
      ) : null}
      {children}

      {safeArea && (
        <SafeArea position="bottom" className={clsx('flex-none', { 'h-[34px]': isIOS() })} />
      )}
    </APopup>
  )
}
