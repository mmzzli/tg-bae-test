import { BigNumber } from 'bignumber.js'
import { FeeMode, ModeFeesType } from '../../components/FeeSelect'

export const formatNumber = (num: string | number | BigNumber, decimal: number = 2) => {
  const bigNum = new BigNumber(num)
  if (bigNum.gte(1e9)) {
    return `${bigNum.dividedBy(1e9).toFixed(decimal)}B`
  }
  if (bigNum.gte(1e6)) {
    return `${bigNum.dividedBy(1e6).toFixed(decimal)}M`
  }
  if (bigNum.gte(1e3)) {
    return `${bigNum.dividedBy(1e3).toFixed(decimal)}K`
  }
  return bigNum.toFixed(decimal)
}

export function formatZeroCount(num: string | number | BigNumber) {
  const bigNum = new BigNumber(num).toFixed()
  const parts = bigNum.split('.')
  const intPart = parts[0] || '0'
  const decimalPart = parts[1] || '0'
  const intPartFormat = new BigNumber(intPart || 0).toFormat()
  let zeroCount = 0
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] !== '0') {
      break
    }
    zeroCount++
  }

  const beforeDecimal = `0{${zeroCount}}`
  const afterDecimal = decimalPart.substring(zeroCount, decimalPart.length).substring(0, 2)

  return {
    value: bigNum,
    intPart,
    decimalPart,
    intPartFormat,
    zeroCount,
    beforeDecimal,
    afterDecimal,
    formater:
      zeroCount < 3
        ? new BigNumber(bigNum).toFormat(3)
        : `${intPart}.${beforeDecimal}${afterDecimal}`,
  }
}

export function formatDecimals(value: string, decimal: number = 18) {
  if (decimal === 0) {
    return value.replace(/^\D*(\d*(?:\.\d*)?).*$/g, '$1')
  }
  const decimalRegex = new RegExp(`^\\D*(\\d*(?:\\.\\d{0,${decimal}})?).*$`, 'g')
  const formattedValue = value.replace(decimalRegex, '$1')

  const decimalIndex = formattedValue.indexOf('.')
  if (decimalIndex !== -1 && formattedValue.length - decimalIndex - 1 > decimal) {
    return formattedValue.slice(0, decimalIndex + decimal + 1)
  }

  return formattedValue
}

function splitLeadingZeros(value: string): {
  leadingZeros: string
  remaining: string
} {
  let leadingZeros = ''
  let remaining = value

  for (let i = 0; i < value.length; i++) {
    if (value[i] === '0') {
      leadingZeros += value[i]
    } else {
      remaining = value.substring(i)
      break
    }
  }

  return { leadingZeros, remaining }
}

function getFirstFourOrAll(remaining: string, decimals = 4): string {
  if (remaining.length <= decimals) {
    return remaining
  }
  return remaining.substring(0, decimals)
}

function formatNumberMin(str: number | string, decimals = 4): string {
  const num = new BigNumber(str).toString()
  if (num.includes('.')) {
    const bigNum = num.toString().split('.')
    const integerPart = bigNum[0]
    const decimalPart = bigNum[1]

    const { leadingZeros, remaining } = splitLeadingZeros(decimalPart)

    const decimalPartV2 = leadingZeros + getFirstFourOrAll(remaining, decimals)

    // if (isNaN(Number(Number(`${integerPart}.${decimalPartV2}`)))) {
    //   debugger
    // }
    return `${integerPart}.${decimalPartV2}`
  } else {
    return num.toString()
  }
}
export function formatFees(fees: ModeFeesType, decimals = 4): ModeFeesType {
  const result = Object.keys(fees).reduce((acc, key) => {
    const value = fees[key as FeeMode]
    const formattedValue = formatNumberMin(value, decimals)
    acc[key as FeeMode] = Number(formattedValue)
    return acc
  }, {} as ModeFeesType)

  return result
}
