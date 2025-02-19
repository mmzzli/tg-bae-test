import { useMemo } from 'react'
import { BigNumber } from 'bignumber.js'
import classNames from 'classnames'
import { effectiveBalance, isEmpty } from '@/store/wallet/util/tokenHelper'
// import { effectiveBalance, isEmpty } from 'utils/helper'

BigNumber.config({
  FORMAT: {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: ''
  },
  EXPONENTIAL_AT: [-18, 30]
})

export enum NumberType {
  USD = 'USD',
  PRICE = 'PRICE',
  BALANCE = 'BALANCE'
}

export const AdaptiveFormatted = (
  value: string | number,
  type: NumberType,
  balanceIsSub?: boolean,
  decimalSubLen?: number,
  decimalFlag?: boolean
) => {
  const valueStr = value.toString()
  if (isEmpty(valueStr)) {
    return {
      formatted: '-',
      ext: undefined
    }
  }
  if (valueStr === '0') {
    return {
      formatted: type === NumberType.USD ? '0.00' : '0',
      ext: undefined
    }
  }

  const bigValue = new BigNumber(value)
  if (type === NumberType.USD && bigValue.lt(0.00001)) {
    return {
      formatted: '0.00001',
      ext: undefined,
      pre: '<'
    }
  }

  const normalBalance = new BigNumber(valueStr).toString()
  const [intPart, decimalPart] = normalBalance.split('.')
  if (decimalPart && decimalPart.length > 1 && Number(decimalPart) > 0) {
    const leadingZeros = decimalPart.match(/^0+/)

    if (
      leadingZeros &&
      leadingZeros[0].length > 4 &&
      (type === NumberType.PRICE || balanceIsSub)
    ) {
      const exponent = parseInt(decimalPart).toString().substring(0, 4)
      return {
        formatted: `${intPart}.0{${leadingZeros[0].length}}${exponent}`,
        ext: [intPart, leadingZeros[0].length, exponent]
      }
    }
  }
  const formatted = effectiveBalance(
    normalBalance,
    type === NumberType.USD ? 2 : 4,
    decimalSubLen,
    decimalFlag
  )

  return {
    formatted,
    ext: undefined
  }
}

interface IAdaptiveNumber {
  value: string | number
  type: NumberType
  className?: string
  subClassName?: string
  balanceIsSub?: boolean
  decimalSubLen?: number
  decimalFlag?: boolean
}

const AdaptiveNumber = ({
  value,
  type,
  className,
  subClassName,
  balanceIsSub,
  decimalSubLen,
  decimalFlag
}: IAdaptiveNumber) => {
  const node = useMemo(() => {
    const adapt = AdaptiveFormatted(
      value,
      type,
      balanceIsSub,
      decimalSubLen,
      decimalFlag
    )
    if (adapt.ext) {
      const ext = adapt.ext as string[]
      return {
        redner: (
          <span>
            {ext[0]}.
            <span>
              0<sub className={subClassName}>{ext[1]}</sub>
              {ext[2]}
            </span>
          </span>
        ),
        pre: adapt.pre
      }
    }
    return {
      redner: <span>{adapt.formatted}</span>,
      pre: adapt.pre
    }
  }, [value, type, balanceIsSub, decimalSubLen, subClassName])

  return (
    <span className={classNames(className)}>
      {node.pre}
      {(type === NumberType.USD || type === NumberType.PRICE) && '$'}
      {node.redner}
    </span>
  )
}

export default AdaptiveNumber
