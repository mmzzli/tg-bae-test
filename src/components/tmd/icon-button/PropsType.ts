import { BaseTypeProps } from '../utils/interface'

export interface IconButtonProps
  extends BaseTypeProps,
    Omit<React.HTMLAttributes<HTMLButtonElement>, 'style'> {}
