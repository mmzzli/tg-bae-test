import classNames from 'clsx'
import { mergeProps } from '../utils/get-default-props'
import { ScrollContentProps } from './PropsType'

export const ScrollContent = (p: ScrollContentProps) => {
  const props = mergeProps(p, {})
  const { children, className, ...restProps } = props
  return (
    <div
      className={classNames('flex-1 px-5 no-scrollbar overflow-y-auto', className)}
      {...restProps}
    >
      {children}
    </div>
  )
}
