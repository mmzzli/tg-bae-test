import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useState } from 'react'
import { CopyProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import classNames from 'clsx'
import { IconCopySuccess } from '../icons/copySuccess'
import { IconCopy } from '../icons/copy'

const defaultProps = {
  type: 'default',
  iconFontSize: '16px',
  animate: true,
}

export default function Copy(p: CopyProps) {
  const props = mergeProps(p, defaultProps)
  const {
    text,
    type,
    btnText,
    iconFontSize,
    className,
    animate,
    onCopy: onCustomCopy,
    children,
    ...restProps
  } = props

  const [copied, setCopied] = useState(false)

  const onCopy = (ttext: string, result: boolean) => {
    if (result) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    // console.log('text, result', ttext, result)
    onCustomCopy?.(ttext, result)
  }

  const baseStyles = 'flex-none items-center justify-center'
  const spaceStyles = {
    'space-x-[7px]': btnText,
  }
  const boxStyles = {
    'size-13 rounded-lg border border-l1 bg-bg5 text-red': type == 'icon',
    'flex text-t1 h-13 min-w-13 rounded-lg border border-t1 text-base font-medium':
      type == 'button',
    'text-t1 leading-none inline-flex': type == 'default',
  }

  return (
    <CopyToClipboard text={text || ''} onCopy={onCopy} options={{ format: 'text/plain' }}>
      {children ? (
        children
      ) : (
        <button
          {...restProps}
          className={classNames(baseStyles, spaceStyles, boxStyles, className)}
        >
          {animate && copied ? (
            <IconCopySuccess className="text-green" fontSize={iconFontSize} />
          ) : (
            <IconCopy fontSize={iconFontSize} />
          )}
          <span>{btnText}</span>
        </button>
      )}
    </CopyToClipboard>
  )
}
