import { Icon, IconProps } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconTxSuccess = ({ className, viewBox, ...restProps }: IconProps) => {
  return (
    <Icon viewBox="0 0 358 52" className={clsx(className)} {...restProps}>
      <rect width="358" height="52" rx="8" fill="#17CF82" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M179 41C187.284 41 194 34.2843 194 26C194 17.7157 187.284 11 179 11C170.716 11 164 17.7157 164 26C164 34.2843 170.716 41 179 41ZM184.149 20.4578C184.744 19.8392 185.712 19.849 186.296 20.4779C186.866 21.0912 186.858 22.0665 186.277 22.6696L177.444 31.8466L171.941 26.1288C171.36 25.5257 171.352 24.5504 171.922 23.9371C172.506 23.3082 173.474 23.2985 174.069 23.917L177.444 27.4238L184.149 20.4578Z"
        fill="white"
      />
    </Icon>
  )
}
