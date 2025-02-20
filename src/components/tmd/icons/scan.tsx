import { Icon } from '@chakra-ui/react'
import clsx from 'clsx'

export const IconScan = ({ className }: { className?: string }) => {
  return (
    <Icon viewBox="0 0 1024 1024" className={clsx('size-4', className)}>
      <path
        d="M640 128h256v213.333333h-85.333333V213.333333h-170.666667V128zM384 128v85.333333H213.333333v128H128V128h256z m256 768v-85.333333h170.666667v-128h85.333333v213.333333h-256z m-256 0H128v-213.333333h85.333333v128h170.666667v85.333333zM128 469.333333h768v85.333334H128v-85.333334z"
        p-id="5123"
        fill="currentColor"
      ></path>
    </Icon>
  )
}
