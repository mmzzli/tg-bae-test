import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconDown2 = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 21 20" className={clsx(className)} {...restProps}>
      <path
        d="M11.1327 13.4292C10.8001 13.8172 10.1999 13.8172 9.86729 13.4292L6.08957 9.02181C5.8579 8.75153 6.04994 8.33398 6.40593 8.33398H14.5941C14.9501 8.33398 15.1421 8.75153 14.9104 9.02181L11.1327 13.4292Z"
        fill="currentColor"
      />
    </Icon>
  )
}
