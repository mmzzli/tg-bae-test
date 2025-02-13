import { Input, InputRef } from 'antd-mobile'
import React, { ForwardedRef, useState } from 'react'
import classNames from 'classnames'
import { SearchProps } from './PropsType'
import { TIcon as Icon } from '../icon'
import { mergeProps } from '../utils/get-default-props'

const Search = React.forwardRef<InputRef, SearchProps>((p, ref) => {
  const props = mergeProps(p, {
    clearIcon: (
      <Icon
        name="tg_wallet_fail-facetiousness"
        fontSize="24"
        className="text-t4"
      />
    ),
    style: { '--placeholder-color': 'var(--text-t4)' },
    clearable: true
  })
  const {
    containerClassName,
    clearable,
    clearIcon,
    style,
    onFocus,
    onBlur,
    ...rest
  } = props
  const [isFocused, setIsFocused] = useState(false)

  const baseStyles =
    'h-11 w-full rounded-[40px] bg-bg2 flex items-center pl-4 pr-2'
  const borderStyles = 'border border-l1'
  const inputStyles = 'tmd-search'

  return (
    <div
      className={classNames(
        baseStyles,
        borderStyles,
        inputStyles,
        containerClassName,
        {
          'border-t1': isFocused
        }
      )}
    >
      <Icon name="tg_wallet_search" fontSize="20" className="mr-2 text-t3" />
      <Input
        ref={ref as ForwardedRef<InputRef>}
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
        clearable={clearable}
        clearIcon={clearIcon}
        style={style}
      />
    </div>
  )
})

Search.displayName = 'Search'

export default Search
