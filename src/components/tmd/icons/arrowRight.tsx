import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconArrowRight = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 1024 1024" className={clsx('size-4', className)} {...restProps}>
      <path
        d="M552.533333 512L341.333333 723.2l60.330667 60.330667L673.194667 512 401.664 240.469333 341.333333 300.8 552.533333 512z"
        p-id="4842"
        fill="currentColor"
      ></path>
    </Icon>
  )
}
