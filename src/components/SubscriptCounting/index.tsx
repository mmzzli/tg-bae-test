import React from 'react'
import { splitNumberParts } from '@/utils/utils'


interface SubscriptCountingProps {
  amount: number
  className?: string
}

const SubscriptCounting: React.FC<SubscriptCountingProps> = ({ className, amount }) => {
  return (
    <span className={className}>
      {splitNumberParts(amount).integerPart}
      {splitNumberParts(amount).dot}
      <sub>{splitNumberParts(amount).zeros}</sub>
      {splitNumberParts(amount).decimalPart}
    </span>
  )
}

export default SubscriptCounting
