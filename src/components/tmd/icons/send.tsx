import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconSend = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" className={clsx(className)} {...restProps}>
      <path
        d="M5 12L12 5M12 5L19 12M12 5V19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Icon>
  )
}
