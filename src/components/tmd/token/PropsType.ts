import { BaseTypeProps } from '../utils/interface'

export interface TokenImageProps extends BaseTypeProps {
  image: string
  size?: string | number
  chainImage?: string
  chainSize?: string | number
  chainClassName?: string
  symbol?: string
  lazy?: boolean
}
