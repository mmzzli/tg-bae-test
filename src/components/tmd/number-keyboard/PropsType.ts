import { NativeProps } from 'antd-mobile/es/utils/native-props'

export type NumberKeyboardProps = {
  // visible?: boolean
  // title?: string
  confirmText?: string | null
  customKey?: string | [string, string]
  randomOrder?: boolean
  // showCloseButton?: boolean
  onInput?: (v: string) => void
  onDelete?: () => void
  onClose?: () => void
  onConfirm?: () => void
  // closeOnConfirm?: boolean
  // safeArea?: boolean
} & NativeProps
