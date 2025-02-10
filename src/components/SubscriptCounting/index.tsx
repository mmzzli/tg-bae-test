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
  const parts = splitNumberParts(amount)
  const decimalPart = parts.decimalPart ? parts.decimalPart.slice(0, 4) : parts.decimalPart

  return (
    <span className={className}>
      {hasDollar ? '$' : ''}
      {parts.integerPart}
      {parts.dot}
      <sub>{parts.zeros}</sub>
      {decimalPart}
    </span>
  )
}

export default SubscriptCounting
