import { BaseTypeProps } from '../utils/interface'

export interface TipProps extends BaseTypeProps {
  content: React.ReactNode
  title?: React.ReactNode
  arrow?: boolean
}
