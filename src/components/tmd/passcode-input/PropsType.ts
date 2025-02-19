import {
  PasscodeInputRef as APasscodeInputRef,
  PasscodeInputProps as APasscodeInputProps
} from 'antd-mobile'

export interface PasscodeInputProps extends APasscodeInputProps {
  type?: 'text' | 'number'
}

export interface PasscodeInputRef extends APasscodeInputRef {
  reset: () => void
  onChange?: (value: string) => void
}
