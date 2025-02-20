import classNames from 'clsx'
import { ContainerProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import { SafeArea } from 'antd-mobile'

const defaultProps = {
  scrollable: true,
  safeArea: true,
}
export function Container(p: ContainerProps) {
  const props = mergeProps(p, defaultProps)
  const { safeArea, scrollable, className, children, ...restProps } = props

  const baseStyles = 'px-5'

  return (
    <div
      {...restProps}
      className={classNames(
        // baseStyles,
        {
          'overflow-y-auto': scrollable,
        },
        className
      )}
    >
      {children}

      {/* {safeArea && <SafeArea position="bottom" className="flex-none" />} */}
    </div>
  )
}
