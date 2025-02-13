import { AssetsToken } from "../tokenType/AssetsToken"

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
