import classNames from 'classnames'
import { Icon } from '../icon/Icon'
import { useState, type FC, type MouseEvent, type TouchEvent } from 'react'
import { IconDel } from '../icons/del'

const classPrefix = 'tmd-number-keyboard'

export function NumberKeyboardKey({
  keyName,
  index,
  confirmText,
  keys,
  startContinueClear,
  stopContinueClear,
  onKeyPress,
}: {
  keyName: string
  index: number
  confirmText?: string | null
  keys: Array<any[]>
  startContinueClear: () => void
  stopContinueClear: () => void
  onKeyPress: (e: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>, key: string) => void
}) {
  const [active, setActive] = useState(false)
  const isNumberKey = /^\d$/.test(keyName)
  const className = classNames(`${classPrefix}-key`, {
    [`${classPrefix}-key-number`]: isNumberKey,
    [`${classPrefix}-key-sign`]: !isNumberKey && keyName,
    [`${classPrefix}-key-mid`]: index === 9 && !!confirmText && keys.length < 12,
    active: active,
  })

  const ariaProps = keyName
    ? {
        role: 'button',
        title: keyName,
        tabIndex: -1,
      }
    : undefined

  return (
    <div
      key={keyName}
      className={className}
      onTouchStart={() => {
        stopContinueClear()
        setActive(true)
        if (keyName === 'BACKSPACE') {
          startContinueClear()
        }
      }}
      onTouchEnd={(e) => {
        onKeyPress(e, keyName)
        setActive(false)
        if (keyName === 'BACKSPACE') {
          stopContinueClear()
        }
      }}
      {...ariaProps}
    >
      {keyName === 'BACKSPACE' ? <IconDel className="size-[22px]" /> : keyName}
    </div>
  )
}
