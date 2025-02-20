import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconArrowDown = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 16 16" className={clsx(className)} {...restProps}>
      <path
        d="M7.99953 8.78032L11.2994 5.48047L12.2422 6.42328L7.99953 10.6659L3.75694 6.42328L4.69973 5.48047L7.99953 8.78032Z"
        fill="currentColor"
      />
    </Icon>
  )
}
