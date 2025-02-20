import { Input as AInput, InputRef as AInputRef } from 'antd-mobile'
import React, { ForwardedRef, useState } from 'react'
import classNames from 'classnames'
import { InputProps } from './PropsType'
import { TIcon as Icon } from '../icon'
import { mergeProps } from '../utils/get-default-props'

const defaultStyle = { '--placeholder-color': 'var(--text-t4)' }
const Input = React.forwardRef<HTMLInputElement, InputProps>((p, ref) => {
  const style = mergeProps(p.style, defaultStyle)
  const props = mergeProps(p, {
    clearIcon: (
      <Icon
        name="tg_wallet_fail-facetiousness"
        fontSize="24"
        className="text-t4"
      />
    )
  })
  const {
    containerClassName,
    clearIcon,
    style: customStyle,
    onFocus,
    onBlur,
    ...rest
  } = props
  const [isFocused, setIsFocused] = useState(false)

  const baseStyles =
    'h-12 w-full rounded-lg bg-bg1 flex items-center pl-4 pr-[10px] border'
  const borderStyles = {
    'border-t1': isFocused,
    'border-l1': !isFocused
  }
  const inputStyles = 'tmd-input'

  return (
    <div
      className={classNames(
        baseStyles,
        borderStyles,
        inputStyles,
        containerClassName
      )}
    >
      <AInput
        ref={ref as ForwardedRef<AInputRef>}
        {...rest}
        onFocus={(e) => {
          setIsFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          onBlur?.(e)
        }}
        clearIcon={clearIcon}
        style={style}
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input
