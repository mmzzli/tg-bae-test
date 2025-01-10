import React from 'react'
import { splitNumberParts } from '@/utils/utils'

interface SubscriptCountingProps {
  amount: number
  className?: string
  hasDollar?: boolean
}

const SubscriptCounting: React.FC<SubscriptCountingProps> = ({
  className,
  amount,
  hasDollar = false,
}) => {
  return (
    <span className={className}>
      {hasDollar ? '$' : ''}
      {splitNumberParts(amount).integerPart}
      {splitNumberParts(amount).dot}
      <sub>{splitNumberParts(amount).zeros}</sub>
      {splitNumberParts(amount).decimalPart}
    </span>
  )
}

export default SubscriptCounting
