import { prepareTransactionRequest } from '@wagmi/core'
import { createHash } from 'crypto'
// import scrollChain from '@/proviers/web3Provider/chains/wagmiConfig/scroll'
// import { STORAGE_KEY } from '../cacheManage'
import BigNumber from 'bignumber.js'
import { STORAGE_KEY } from '@/store/wallet/util/tokenHelper'

export const shortenAddress = (address: string | undefined, start?: number, end?: number) => {
  if (!address) return ''
  if (address?.length <= 11) {
    return address
  }
  return address && `${address.slice(0, start || 8)}...${address.slice(-(end || 8))}`
}
export const longAddress = (address: string | null | undefined) => {
  if (!address) return ''
  return shortenAddress(address, 10, 12)
}
export const intRandom = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function convertTimestampToDateText(unixTimestamp: number) {
  const date = new Date(unixTimestamp)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function secondsToMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  const formattedMinutes = String(minutes).padStart(2, '0')
  const formattedSeconds = String(remainingSeconds).padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}

export const capitalizeFirstLetter = (str: string | undefined) =>
  typeof str === 'string' ? str?.replace(/^[a-z]/i, (letter) => letter.toUpperCase()) : ''

export const md5 = (input: string): string => {
  return createHash('md5').update(input).digest('hex')
}
export const isEmpty = (data: string | object) => {
  if (data instanceof Array) {
    return !data.length
  } else if (data instanceof Object) {
    return !Object.keys(data).length
  }
  return !data
}

export function findAndModifyLongestValue(obj: Record<string, any[]>): Record<string, any[]> {
  const newObj = { ...obj }

  let longestKey: string | null = null
  let maxLength = 0

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (value.length > maxLength) {
        longestKey = key
        maxLength = value.length
      }
    }
  }

  if (longestKey !== null && newObj[longestKey].length >= 2) {
    newObj[longestKey] = newObj[longestKey].slice(0, -2)
  }

  return newObj
}
export const filterDeviceIDQuote = (did: string): string => {
  return did.replace(/"/g, '')
}
export const checkApproveHex = (hex: string) => {
  if (!hex || !hex.includes) return false
  return hex.includes('0x095ea7b3')
}
export const checkTransferHex = (hex: string) => {
  return hex.includes('0xa9059cbb')
}
export const approveParams = (hex: string) => {
  if (!hex || !hex.length) {
    return {
      function: '',
      to: '',
      value: 0,
    }
  }
  const to = `0x${hex.slice(34, 74)}`
  const str = hex.slice(74)
  const value = Number.parseInt(str, 16)
  return {
    function: 'approve',
    to,
    value,
  }
}
export const parseApproveOrTransferParams = (hex: string) => {
  if (!hex || !hex.length) {
    return {
      function: '',
      to: '',
      value: 0,
    }
  }
  const to = `0x${hex.slice(34, 74)}`
  const str = hex.slice(74)
  const value = Number.parseInt(str, 16)

  return {
    function: checkApproveHex(hex) ? 'approve' : checkTransferHex(hex) ? 'transfer' : '',
    to,
    value,
  }
}

export function constructEstGasParams(params: Parameters<typeof prepareTransactionRequest>[1]) {
  // if (params.chainId === scrollChain.chain?.id) {
  //   params.gasPrice = BigInt(10 ** 9)
  // }
  return params
}

// export function deposit({ chainId, tokenAddress = '' }: { chainId: number; tokenAddress: string }) {
//   const botLink = import.meta.env.VITE_BOT_LINK
//   const url = tokenAddress
//     ? `${botLink}?startapp=RECEIVE_${chainId}_${tokenAddress}`
//     : `${botLink}?startapp=RECEIVE_${chainId}`

//   window.Telegram.WebApp.openTelegramLink(url)
// }

export function getDefaultWalletId() {
  const userStr = localStorage.getItem(STORAGE_KEY.user)
  if (userStr && userStr !== 'null') {
    const userInfo = JSON.parse(userStr)
    const walletId = userInfo?.['defaultWalletId'] ?? -1
    return walletId
  }
  return -1
}

// ERC20 unlimited approval maximum value (uint256 maximum value)
const MAX_UINT256 = new BigNumber(2).pow(256).minus(1)
export const numberFormat = (number: string | number | undefined, tFixNum = 4) => {
  const valueBN = new BigNumber(Number(number))
  // check for unlimited approval situation
  if (valueBN.isGreaterThanOrEqualTo(MAX_UINT256)) {
    return 'Unlimited'
  }

  return valueBN.decimalPlaces(tFixNum, BigNumber.ROUND_DOWN).toString()
}
