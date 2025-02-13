import './style/index.scss'
import { InputProps } from 'antd-mobile'

export interface NumberInputProps
  extends Omit<InputProps, 'type' | 'inputMode'> {
  containerClassName?: string
  useThousands?: boolean
  fontSize?: string | number
  allowDot?: boolean
}
