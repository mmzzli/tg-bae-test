import { BigNumber } from 'bignumber.js'
import { APIToken } from "../tokenType/APIToken"
import { AssetsToken } from "../tokenType/AssetsToken"
import { CustomListInfo, WhiteListInfo } from "../type"
import chains from '../chains'

export const CURRENT_CACHE_VERSION = "v1"
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const STORAGE_KEY = Object.freeze({
  LOGGEDIN_USER_ID: 'loggedInUserId',
  SHOW_TOKENS: '__SHOW_TOKENS',
  HIDDEN_TOKENS: '__HIDDEN_TOKENS',
  TOKENS_LIST: '__TOKENS_LIST',
  TRANSACTIONS: '__TRANSACTIONS',
  bindEmail: 'bindEmail',
  user: 'walletUser',
  userState: 'walletUserState',
  isClear: 'isClear',
  isFirstSwap: 'isFirstSwap',
  AI_TOKEN: 'AI_TOKEN',
  AI_DEFAULT_CHECKED_TRADE: 'AI_DEFAULT_CHECKED_TRADE',
  AI_POST: 'AI_POST',
  isAiTokenPromt: 'isAiPromt',
  AISearchHistory: '_AI_History'
})

export const getCacheTokens = () => {
  const list = getCache(getWalletTokensKey() as string) as AssetsToken[]
  if (list?.length) {
    return list
      .filter((i) => i.address !== ZERO_ADDRESS)
  }
  return []
}

const customListInfoEqual = (a: CustomListInfo, b: CustomListInfo) => {
  return (
    a.ID === b.ID &&
    a.chain_id === b.chain_id &&
    a.decimals === b.decimals &&
    a.image === b.image &&
    a.market_cap === b.market_cap &&
    a.name === b.name &&
    a.price === b.price &&
    a.price_change_h24 === b.price_change_h24 &&
    a.symbol === b.symbol &&
    a.token === b.token &&
    a.uid === b.uid
  )
}

const whiteListInfoEqual = (a: WhiteListInfo, b: WhiteListInfo) => {
  return (
    a.chain_id === b.chain_id &&
    a.contract === b.contract &&
    a.decimals === b.decimals &&
    a.image === b.image &&
    a.is_native === b.is_native &&
    a.mercuryo_support === b.mercuryo_support &&
    a.name === b.name &&
    a.price === b.price &&
    a.ramp_support === b.ramp_support &&
    a.symbol === b.symbol
  )
}

export function shallowAssetsTokenEqual(arr1: any[], arr2: any[]) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  if (arr1.length === 0) return false
  const assetsTokenEqual = (a: AssetsToken, b: AssetsToken) => {
    return (
      a.isNative === b.isNative &&
      a.isToken === b.isToken &&
      a.chainId === b.chainId &&
      a.decimals === b.decimals &&
      a.symbol === b.symbol &&
      a.name === b.name &&
      a.address === b.address &&
      a.balance === b.balance &&
      a.price === b.price &&
      a.image === b.image &&
      a.formatted === b.formatted &&
      a.customToken?.price_change_h24 === b.customToken?.price_change_h24
    )
  }
  let flag = 0
  arr1.forEach((asset1, idx) => {
    const assets2 = arr2[idx]
    if (!assetsTokenEqual(asset1, assets2)) {
      flag++
    }
  })
  return flag === 0
}

export function shallowCustomListInfoEqual(arr1: any[], arr2: any[]) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  if (arr1.length === 0) return false
  let flag = 0
  arr1.forEach((asset1, idx) => {
    const assets2 = arr2[idx]
    if (!customListInfoEqual(asset1, assets2)) {
      flag++
    }
  })
  return flag === 0
}
export function shallowWhiteListInfoEqual(arr1: any[], arr2: any[]) {
  if (arr1 === arr2) return true
  if (arr1.length !== arr2.length) return false
  if (arr1.length === 0) return false
  let flag = 0
  arr1.forEach((asset1, idx) => {
    const assets2 = arr2[idx]
    if (!whiteListInfoEqual(asset1, assets2)) {
      flag++
    }
  })
  return flag === 0
}


export const sortByPriceBalance = (income: AssetsToken[]) => {
  const list = [...income]
  list.sort((a, b) => {
    const aFormatted = Number(a.formatted) * Number(a.price)
    const bFormatted = Number(b.formatted) * Number(b.price)
    return bFormatted - aFormatted
  })
  return list
}

export const getWalletTokensKey = () => {
  let walletId = null
  const userStr = localStorage.getItem(STORAGE_KEY.user)
  // userStr maybe 'null'
  try {
    if (userStr) {
      const userInfo = JSON.parse(userStr)
      walletId = userInfo?.['defaultWalletId'] ?? -1
      return `${STORAGE_KEY.TOKENS_LIST}_${walletId}`
    }
  } catch (error) {
    console.log('getWalletTokensKey', error)
    return null
  }
}

export function getCurrentUserId() {
  let userId = null
  const userStr = localStorage.getItem(STORAGE_KEY.user)

  if (userStr && userStr !== 'null') {
    const userInfo = JSON.parse(userStr)
    userId = userInfo?.['id']
  }

  return userId
}


// Get the cache
export const getCache = (key: string) => {
  const defaultValue = {}
  const userId = getCurrentUserId()
  if (!userId) return defaultValue

  const userKey = `${key}_${userId}`
  const cachedData = localStorage.getItem(userKey)

  if (cachedData) {
    try {
      const { version, data } = JSON.parse(cachedData)
      if (version === CURRENT_CACHE_VERSION) {
        return data
      } else {
        return defaultValue
      }
    } catch (e) {
      console.error(`Error parsing cache for key ${key}:`, e)
      return defaultValue
    }
  }

  // If the cache does not exist, perform the migration
  migrateOldCache(key)

  // If the cache does not exist or is not the current version, the default value is returned
  return defaultValue
}

export const setCache = (key: string, data: any) => {
  const userId = getCurrentUserId() // Get the latest user ID every time you make a call
  if (!userId) return

  const userKey = `${key}_${userId}`
  const cacheToStore = JSON.stringify({
    version: CURRENT_CACHE_VERSION,
    data
  })
  localStorage.setItem(userKey, cacheToStore)
}

// Migrate old caches
export const migrateOldCache = (oldKey: string) => {
  const oldCache = localStorage.getItem(oldKey)
  if (oldCache) {
    const oldData = JSON.parse(oldCache)

    if (!oldData.version) {
      setCache(oldKey, oldData) // Migrate old data to the new format
      localStorage.removeItem(oldKey) // Delete the old cache
    }
  }
}

export function mergeTokensData({
  whiteTokens,
  customTokens
}: {
  whiteTokens: WhiteListInfo[]
  customTokens: CustomListInfo[]
}): APIToken[] {
  // Filter out the chain_id and token combinations in customQueryData that already exist in queryData
  const filteredCustomQueryData: APIToken[] =
    customTokens
      ?.filter((n: CustomListInfo) => {
        return !whiteTokens.find(
          (m: WhiteListInfo) =>
            m.contract?.toLocaleUpperCase() === n.token?.toLocaleUpperCase() &&
            m.chain_id === n.chain_id
        )
      })
      .map(
        (i) =>
          ({
            isNative: !i.token,
            isToken: !!i.token,
            chainId: i.chain_id,
            decimals: i.decimals,
            symbol: i.symbol,
            name: i.name,
            address: i.token,
            balance: '0', //not trust
            price: i.price,
            image: i.image,
            source: 'custom',
            whiteToken: undefined,
            customToken: i
          }) as APIToken
      ) || []

  // Formatting queryData data
  const formattedQueryData =
    whiteTokens?.map((i) => {
      const symbol = i.symbol.includes('ETH') ? 'ETH' : i.symbol
      return {
        isNative: i.is_native,
        isToken: !i.is_native,
        chainId: i.chain_id,
        decimals: i.decimals,
        symbol,
        name: i.name,
        address: i.contract,
        balance: '0', //not trust
        price: i.price,
        image: i.image,
        source: 'all',
        whiteToken: i,
        customToken: undefined
      } as APIToken
    }) || []

  return [...formattedQueryData, ...filteredCustomQueryData]
}

export function effectiveBalance(
  balance: any,
  length: number = 4,
  decimalSubLen: number = 2,
  decimalFlag: boolean = false
) {
  if (isNaN(parseFloat(balance))) {
    return '0.00'
  }
  if (!balance || balance === '0') {
    return 0
  }
  // TODO Small number is 0.00
  if (balance < 1 / Math.pow(10, 6)) {
    if (decimalFlag) {
      return BigNumber(balance.toString()).toFixed()
    }
    return '0.00'
  }
  balance = new BigNumber(balance.toString()).toFixed()
  if (balance.split('.').length === 1) {
    return balance > 1000
      ? `${Number(balance).toLocaleString()}.00`
      : `${balance}.00`
  }
  const integer = balance.split('.')[0]
  const decimal = balance.split('.')[1]
  if (integer > 0) {
    const str =
      decimal.length === 1 ? `${decimal}0` : decimal.substr(0, decimalSubLen)
    const res = `${integer}.${str}`
    return Number(res) > 1000
      ? `${Number(integer).toLocaleString()}.${str}`
      : res
  }

  const temp: any = []
  let tempNum = 0
  let isNotZero = false
  for (let i = 0; i < decimal.length; i++) {
    if (decimal[i] != '0' && !isNotZero) {
      isNotZero = true
    }
    if (isNotZero) {
      tempNum++
    }
    if (tempNum <= length) {
      temp.push(decimal[i])
    }
  }
  const res = parseFloat(`${integer}.${temp.join('')}`)
  return res > 1000
    ? `${Number(integer).toLocaleString()}.${temp.join('')}`
    : res
}

export const isEmpty = (data: string | object) => {
  if (data instanceof Array) {
    return !data.length
  } else if (data instanceof Object) {
    return !Object.keys(data).length
  }
  return !data
}

export const getChainByChainId = (chainId: number | string) => {
  const chain = Object.values(chains).find((c) => c.id === Number(chainId))
  return chain
}

export enum NativeTokenSymbol {
  ETH = 'ETH',
  TON = 'TON'
}

export const nativeTokenFilter = ({
  isNative,
  symbol,
  chainId
}: {
  isNative: boolean
  symbol: string
  chainId: number
}) => {
  if (isNative) {
    if (symbol.includes(NativeTokenSymbol.ETH)) {
      return NativeTokenSymbol.ETH
    }
    if (symbol.includes(NativeTokenSymbol.TON) && chainId !== chains.ton.id) {
      return NativeTokenSymbol.TON
    }
  }
}