import { useMemoizedFn } from 'ahooks'
import classNames from 'classnames'
import type { FC, MouseEvent, TouchEvent } from 'react'
import React, { useMemo, useRef } from 'react'
import { NumberKeyboardProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import '../utils/touch-emulator.js'
import { shuffle } from '../utils/shuffle'
import { Icon } from '../icon/Icon'
import { NumberKeyboardKey } from './NumberKeyboardKey'

const classPrefix = 'tmd-number-keyboard'

const defaultProps = {
  // defaultVisible: false,
  randomOrder: false,
  // showCloseButton: true,
  confirmText: null,
  // closeOnConfirm: true,
  // safeArea: true,
  // destroyOnClose: false,
  forceRender: false
}

export const NumberKeyboard: FC<NumberKeyboardProps> = (p) => {
  const props = mergeProps(p, defaultProps)
  const {
    // visible,
    // title,
    // getContainer,
    confirmText,
    customKey,
    randomOrder,
    // showCloseButton,
    onInput
  } = props

  // const { locale } = useConfig()

  const keyboardRef = useRef<HTMLDivElement | null>(null)

  const keys = useMemo(() => {
    const defaultKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    const keyList = randomOrder ? shuffle(defaultKeys) : defaultKeys
    const customKeys = Array.isArray(customKey) ? customKey : [customKey]
    keyList.push('0')
    if (confirmText) {
      if (customKeys.length === 2) {
        keyList.splice(9, 0, customKeys.pop())
      }
      keyList.push(customKeys[0] || '')
    } else {
      keyList.splice(9, 0, customKeys[0] || '')
      keyList.push(customKeys[1] || 'BACKSPACE')
    }
    return keyList
    // }, [customKey, confirmText, randomOrder, randomOrder && visible])
  }, [customKey, confirmText, randomOrder])

  const timeoutRef = useRef(-1)
  const intervalRef = useRef(-1)

  const onDelete = useMemoizedFn(() => {
    props.onDelete?.()
  })

  const startContinueClear = () => {
    timeoutRef.current = window.setTimeout(() => {
      onDelete()
      intervalRef.current = window.setInterval(onDelete, 150)
    }, 700)
  }
  const stopContinueClear = () => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
  }

  const onKeyPress = (
    e: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>,
    key: string
  ) => {
    e.preventDefault()

    switch (key) {
      case 'BACKSPACE':
        onDelete?.()
        break
      case 'OK':
        props.onConfirm?.()
        // if (props.closeOnConfirm) {
        //   props.onClose?.()
        // }
        break
      default:
        // onInput should't be called when customKey doesn't exist
        if (key !== '') onInput?.(key)
        break
    }
  }

  const renderHeader = () => {
    return null
    // if (!showCloseButton && !title) return null
    // return (
    //   <div
    //     className={classNames(`${classPrefix}-header`, {
    //       [`${classPrefix}-header-with-title`]: !!title
    //     })}
    //   >
    //     {!!title && (
    //       <div className={`${classPrefix}-title`} aria-label={title}>
    //         {title}
    //       </div>
    //     )}
    //     {showCloseButton && (
    //       <span
    //         className={`${classPrefix}-header-close-button`}
    //         onClick={() => {
    //           props.onClose?.()
    //         }}
    //         role="button"
    //         title={locale.common.close}
    //         tabIndex={-1}
    //       >
    //         {/* <DownOutline /> */}
    //       </span>
    //     )}
    //   </div>
    // )
  }

  const renderKey = (key: string, index: number) => {
    const isNumberKey = /^\d$/.test(key)
    const className = classNames(`${classPrefix}-key`, {
      [`${classPrefix}-key-number`]: isNumberKey,
      [`${classPrefix}-key-sign`]: !isNumberKey && key,
      [`${classPrefix}-key-mid`]:
        index === 9 && !!confirmText && keys.length < 12
    })

    const ariaProps = key
      ? {
          role: 'button',
          title: key,
          tabIndex: -1
        }
      : undefined

    return (
      <div
        key={key}
        className={className}
        onTouchStart={() => {
          stopContinueClear()

          if (key === 'BACKSPACE') {
            startContinueClear()
          }
        }}
        onTouchEnd={(e) => {
          onKeyPress(e, key)
          if (key === 'BACKSPACE') {
            stopContinueClear()
          }
        }}
        {...ariaProps}
      >
        {key === 'BACKSPACE' ? (
          <Icon name="tg_wallet_keybord_del" fontSize="22" />
        ) : (
          key
        )}
      </div>
    )
  }

  return (
    <>
      <div
        ref={keyboardRef}
        className={classPrefix}
        onMouseDown={(e) => {
          e.preventDefault()
        }}
      >
        {renderHeader()}
        {/* <div className={`${classPrefix}-wrapper`}> */}
        <div
          className={classNames(`${classPrefix}-main`, {
            [`${classPrefix}-main-confirmed-style`]: !!confirmText
          })}
        >
          {keys.map((key: string, index: number) => (
            <NumberKeyboardKey
              key={index}
              keyName={key}
              index={index}
              confirmText={confirmText}
              keys={keys}
              startContinueClear={startContinueClear}
              stopContinueClear={stopContinueClear}
              onKeyPress={onKeyPress}
            />
          ))}
        </div>
        {/* {!!confirmText && (
            <div className={`${classPrefix}-confirm`}>
              <div
                className={`${classPrefix}-key ${classPrefix}-key-extra ${classPrefix}-key-bs`}
                onTouchStart={() => {
                  startContinueClear()
                }}
                onTouchEnd={(e) => {
                  onKeyPress(e, 'BACKSPACE')
                  stopContinueClear()
                }}
                onContextMenu={(e) => {
                  // Long press should not trigger native context menu
                  e.preventDefault()
                }}
                title={'BACKSPACE'}
                role="button"
                tabIndex={-1}
              >

              </div>
              <div
                className={`${classPrefix}-key ${classPrefix}-key-extra ${classPrefix}-key-ok`}
                onTouchEnd={(e) => onKeyPress(e, 'OK')}
                role="button"
                tabIndex={-1}
                aria-label={confirmText}
              >
                {confirmText}
              </div>
            </div>
          )} */}
        {/* </div> */}
      </div>
    </>
  )
}
