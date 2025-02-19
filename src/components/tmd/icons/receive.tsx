import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconReceive = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 24 24" className={clsx(className)} {...restProps}>
      <path
        d="M5 12L12 19M12 19L19 12M12 19V5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Icon>
  )
}
