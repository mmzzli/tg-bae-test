import { PopupProps as APopupProps } from 'antd-mobile'

export interface PopupProps extends APopupProps {
  safeArea?: boolean
  title?: string
  titleClassName?: string
  iconClassName?: string
}
