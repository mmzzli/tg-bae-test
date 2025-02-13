import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle
} from 'react'
import { PasscodeInput as APasscodeInput } from 'antd-mobile'
import { PasscodeInputRef, PasscodeInputProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { formatNumber } from '../utils/format/number'
import classNames from 'classnames'

// Encapsulating components with forwardRef
const PasscodeInput = forwardRef<PasscodeInputRef, PasscodeInputProps>(
  (p, ref) => {
    const styles = mergeProps(p.style, {
      '--border-color': 'var(--background-l1)',
      '--border-radius': '4px',
      '--dot-size': '8px',
      '--cell-size': '48px',
      '--cell-gap': '9.4px'
    })
    const props = mergeProps(p, {
      type: 'number',
      length: 6
    })

    const {
      value: modelValue,
      defaultValue,
      type,
      onChange,
      onFocus,
      length,
      className,
      style,
      caret= false,
      ...restProps
    } = props
    const passcodeRef = useRef<PasscodeInputRef | null>(null)

    const [value, setValue] = useState(defaultValue || '')

    useEffect(() => {
      if (modelValue !== undefined) {
        setValue(modelValue)
      }
    }, [modelValue])

    const handleChange = (inputValue: string) => {
      let finalValue = inputValue
      if (type === 'number') {
        finalValue = formatNumber(inputValue, false, false)
      }
      setValue(finalValue)

      onChange?.(finalValue)
    }
    const handleFocus = () => {
      if (value.length == length) {
        setValue((v) => v.slice(0, length - 1))
      }
      onFocus?.()
    }

    useImperativeHandle(ref, () => ({
      focus: () => {
        passcodeRef.current?.focus()
      },
      reset: () => {
        setValue('')
        onChange?.('')
      },
      blur: () => {
        passcodeRef.current?.blur()
      }
    }))

    return (
      <APasscodeInput
        {...restProps}
        className={classNames('tmd-passcode', className)}
        ref={passcodeRef}
        value={value}
        caret={caret}
        length={length}
        onChange={handleChange}
        onFocus={handleFocus}
        style={styles}
      />
    )
  }
)
PasscodeInput.displayName = 'PasscodeInput'

export default PasscodeInput
