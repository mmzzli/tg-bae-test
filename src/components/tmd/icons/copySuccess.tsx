import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconCopySuccess = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 1024 1024" className={clsx('size-4', className)} {...restProps}>
      <path
        d="M512 938.666667C276.352 938.666667 85.333333 747.648 85.333333 512S276.352 85.333333 512 85.333333s426.666667 191.018667 426.666667 426.666667-191.018667 426.666667-426.666667 426.666667z m-42.538667-256l301.653334-301.696-60.288-60.330667-241.365334 241.365333-120.704-120.704-60.330666 60.330667L469.461333 682.666667z"
        p-id="5980"
        fill="currentColor"
      ></path>
    </Icon>
  )
}
