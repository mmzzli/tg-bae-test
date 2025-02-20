import { Input, InputRef } from 'antd-mobile'
import React, { ForwardedRef, useState } from 'react'
import classNames from 'classnames'
import { SearchProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { IconSearch } from '../icons/search'
import { IconClear } from '../icons/clear'

const Search = React.forwardRef<InputRef, SearchProps>((p, ref) => {
  const props = mergeProps(p, {
    clearIcon: <IconClear className="size-6 text-t4" />,
    style: { '--placeholder-color': '#999999' },
    clearable: true,
  })
  const { containerClassName, clearable, clearIcon, style, onFocus, onBlur, ...rest } = props
  const [isFocused, setIsFocused] = useState(false)

  const baseStyles = 'h-11 w-full rounded-[40px] bg-bg2 flex items-center pl-4 pr-2'
  const borderStyles = 'border border-l1'
  const inputStyles = 'tmd-search'

  return (
    <div
      className={classNames(baseStyles, borderStyles, inputStyles, containerClassName, {
        'border-t1': isFocused,
      })}
    >
      <IconSearch className="size-5 mr-2 text-t3" />
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
