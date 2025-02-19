import classNames from 'clsx'
import { BottomButtonProps } from './PropsType'

export const BottomButton = (props: BottomButtonProps) => {
  const { children, className, ...restProps } = props
  return (
    <div className={classNames('flex-none px-5 py-2', className)} {...restProps}>
      {children}
    </div>
  )
}
