import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconWallet = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 20 20" className={clsx(className)} {...restProps}>
      <path
        d="M15.0052 5.83333H17.5052C17.9655 5.83333 18.3386 6.20643 18.3386 6.66667V16.6667C18.3386 17.1269 17.9655 17.5 17.5052 17.5H2.50521C2.04498 17.5 1.67188 17.1269 1.67188 16.6667V3.33333C1.67188 2.87309 2.04498 2.5 2.50521 2.5H15.0052V5.83333ZM3.33854 7.5V15.8333H16.6719V7.5H3.33854ZM3.33854 4.16667V5.83333H13.3386V4.16667H3.33854ZM12.5052 10.8333H15.0052V12.5H12.5052V10.8333Z"
        fill="#333333"
      />
    </Icon>
  )
}
