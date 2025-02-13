import classNames from 'classnames'
import type { FC } from 'react'
import { PopupProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { Icon } from '../icon/Icon'
import { Popup as APopup, SafeArea } from 'antd-mobile'
import { IconButton } from '../icon-button/IconButton'

const defaultBodyStyle = {
  '--adm-color-background': 'var(--background-BG1)'
}
const defaultProps = {
  safeArea: true,
  closeIcon: (
    <Icon className="text-t1" name="tg_wallet_disable" fontSize="20" />
  ),
  maskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
}

export const Popup: FC<PopupProps> = (p) => {
  const bodyStyle = mergeProps(p.bodyStyle, defaultBodyStyle)
  const props = mergeProps(p, defaultProps)
  const {
    showCloseButton,
    children,
    closeIcon,
    title,
    safeArea,
    className,
    titleClassName,
    iconClassName,
    bodyStyle: unBodyStyle,
    ...restProps
  } = props

  const defaultClassName = 'tmd-popup'

  return (
    <APopup
      {...restProps}
      bodyStyle={bodyStyle}
      className={classNames(defaultClassName, className)}
    >
      {(title || showCloseButton) && (
        <div
          className={classNames(
            'flex flex-row-reverse items-center px-5 py-3 text-xl font-semibold text-t1',
            titleClassName
          )}
        >
          {showCloseButton && (
            <IconButton
              className={classNames('size-9', iconClassName)}
              onClick={() => props.onClose?.()}
            >
              {closeIcon}
            </IconButton>
          )}

          <h3 className="flex-1 truncate">{title}</h3>
        </div>
      )}
      {children}

      {safeArea && <SafeArea position='bottom' />}
    </APopup>
  )
}
