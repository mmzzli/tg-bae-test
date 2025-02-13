import { Input, InputRef } from 'antd-mobile'
import React, {
  ForwardedRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import classNames from 'classnames'
import { NumberInputProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { formatNumber } from '../utils/format/number'

const defaultStyle = {
  '--placeholder-color': 'var(--text-t4)',
  '--text-align': 'right'
}
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (p, ref) => {
    const style = mergeProps(p.style, defaultStyle)
    const props = mergeProps(p, {
      useThousands: true,
      fontSize: '24px',
      allowDot: true
    })
    const {
      containerClassName,
      style: unStyle,
      useThousands,
      value: initialValue,
      fontSize: propFontSize,
      onBlur,
      onChange,
      onKeyDown,
      allowDot,
      ...rest
    } = props

    const baseStyles = 'flex items-center relative overflow-hidden'
    const inputStyles = 'tmd-number-input'

    const [value, setValue] = useState<string>(initialValue || '')
    const [prevValue, setPrevValue] = useState<string>(initialValue || '')
    const defaultFontSize = parseInt(propFontSize, 10)
    const minFontSize = 16

    const [fontSize, setFontSize] = useState<number>(defaultFontSize)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const spanRef = useRef<HTMLSpanElement | null>(null)

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const calculateFontSize = useCallback(() => {
      if (inputRef.current && spanRef.current) {
        const inputWidth = inputRef.current.offsetWidth
        const spanWidth = spanRef.current.offsetWidth
        const isDeleting = value.length < prevValue.length

        const adjustmentBuffer = 2

        if (
          spanWidth > inputWidth + adjustmentBuffer &&
          fontSize > minFontSize
        ) {
          setFontSize((size) => Math.max(size - 2, minFontSize))
        } else if (
          isDeleting &&
          spanWidth < inputWidth - adjustmentBuffer &&
          fontSize < defaultFontSize
        ) {
          setFontSize((size) => Math.min(size + 2, defaultFontSize))
        }
      }
    }, [value, prevValue, fontSize, minFontSize, defaultFontSize])

    useEffect(() => {
      calculateFontSize()
      setPrevValue(value)
    }, [value, calculateFontSize])

    useEffect(() => {
      if (initialValue != value) {
        handleInputChange(initialValue || '')
      }
    }, [initialValue, value])

    const formatWithThousandSeparator = (val: string) => {
      if (!val) return ''
      if (!useThousands) return val

      const [integer, decimal] = val.split('.')
      const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return decimal !== undefined
        ? `${formattedInteger}.${decimal}`
        : formattedInteger
    }

    const handleInputChange = (inputValue: string) => {
      console.log('inputValueinputValue', inputValue)
      let finalValue = formatNumber(inputValue, allowDot, false)
      // parse 001/00.212
      if (!finalValue.includes('.')) {
        finalValue = finalValue.replace(/^0+(?!$)/, '')
      } else {
        finalValue = finalValue.replace(/^0+(?=\d)/, '')
      }
      setValue(finalValue)
      onChange?.(finalValue)
      // console.log('finalValuefinalValue:', finalValue)
    }
    const handleInputKeyword = (e: React.KeyboardEvent) => {
      if (e.key == ',' || e.key == '。') {
        e.preventDefault()
        const newValue = value + '.'
        handleInputChange(newValue)
      }
    }

    return (
      <div className={classNames(baseStyles, inputStyles, containerClassName)}>
        <Input
          type="text"
          inputMode="decimal"
          ref={(node) => {
            if (node) {
              inputRef.current = node.nativeElement
              if (ref) (ref as ForwardedRef<InputRef>)!.current = node
            }
          }}
          {...rest}
          value={formatWithThousandSeparator(value)}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyword}
          style={{
            ...style,
            '--font-size': `${fontSize}px`
          }}
          onBlur={(e) => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            onBlur?.(e)
          }}
        />
        <span
          ref={spanRef}
          className="invisible absolute left-0 top-0 whitespace-nowrap"
          style={{
            fontSize: `${fontSize}px`
          }}
        >
          {formatWithThousandSeparator(value)}
        </span>
      </div>
    )
  }
)

NumberInput.displayName = 'NumberInput'

export default NumberInput
