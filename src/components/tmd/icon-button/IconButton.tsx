import classNames from 'classnames'
import { IconButtonProps } from './PropsType'

export function IconButton(props: IconButtonProps) {
  const { className, ...otherProps } = props

  const baseStyles = 'flex items-center justify-center rounded-full'
  const colorStyles = 'bg-bg3'

  return (
    <button
      {...otherProps}
      className={classNames(baseStyles, colorStyles, className)}
    >
      <>{otherProps.children}</>
    </button>
  )
}
