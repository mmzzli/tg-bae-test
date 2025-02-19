// import { IChainId, IWeb3ChainType, Web3Type } from 'proviers/web3Provider/type'
// import { mockSolEvmChainId } from 'config/sol'
// import { mockBtcEvmChainId } from 'config/btc'
// import { IS_DEV } from '../config/index'
// import { mockTonChainId } from 'config/ton'
// import { mockTronChainId } from 'config/tron'
import { STORAGE_KEY } from '@/store/wallet/util/tokenHelper'
import CryptoJS from 'crypto-js'
// import { WalletType } from '@/stores/tokenStore/type/BTCToken'
// import { TrendingToken, WhiteListInfo } from '@/api/type'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'

// export const TOMO_PASS_KEY = 'pass-key'

// export const getUserInfo = () => {
//   try {
//     const userRaw = localStorage.getItem('user')
//     const user = userRaw && JSON.parse(userRaw)
//     // const token = user && JSON.parse(user)?.projectToken
//     return {
//       ...(user || {}),
//       token: user?.token ?? '',
//     }
//   } catch (e) {
//     return null
//   }
// }

export const getPassKey = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEY.TOMO_PASS_KEY)
    return token ?? ''
  } catch (e) {
    return null
  }
}

export const setPassKey = (key: string) => {
  try {
    localStorage.setItem(STORAGE_KEY.TOMO_PASS_KEY, key)
  } catch (e) {
    // do something
  }
}

export const removePassKey = () => {
  try {
    localStorage.removeItem(STORAGE_KEY.TOMO_PASS_KEY)
  } catch (e) {
    // do something
  }
}

// export const CLEAR_VERSION = '5'

// export const isDev = () => {
//   // return IS_DEV
//   // return true;
//   return !!localStorage.getItem('IS_DEV')
// }

// export const isLocationEnv = () => {
//   return import.meta.env.VITE_NODE_ENV == 'location'
// }

// export const isDevEnv = () => {
//   return import.meta.env.VITE_NODE_ENV == 'development'
// }

// export const isTestEnv = () => {
//   return import.meta.env.VITE_NODE_ENV == 'test'
// }

// export const isDevMode = () => {
//   return isLocationEnv() || isDevEnv()
// }

export const numberFormat = (number: string | number | undefined, tFixNum = 4) => {
  return Math.floor(Number(number) * 10 ** tFixNum) / 10 ** tFixNum
}
// export const btcDefaultType = 'bitcoinP2Tr'

// export const btcTypeMaps = {
//   bitcoinP2Wpkh: 'Native Segwit',
//   bitcoinP2Sh: 'Nested Segwit',
//   bitcoinP2Tr: 'Taproot',
//   bitcoinP2Pkh: 'Legacy',
// }

// export type IBtcAddressType = 'bitcoinP2Wpkh' | 'bitcoinP2Sh' | 'bitcoinP2Tr' | 'bitcoinP2Pkh'

// export const btcAddressTypeMaps: IBtcAddressType[] = [
//   'bitcoinP2Wpkh',
//   'bitcoinP2Sh',
//   'bitcoinP2Tr',
//   'bitcoinP2Pkh',
// ]

// export const getBitCoinType = (type: IBtcAddressType | null) => {
//   return type ? btcTypeMaps[type] : btcTypeMaps[btcDefaultType]
// }

// // 'P2PKH' | 'P2WPKH' | 'P2TR' | 'P2SH'
// export enum BTCAddressType {
//   P2PKH = 'P2PKH',
//   P2WPKH = 'P2WPKH',
//   P2TR = 'P2TR',
//   P2SH = 'P2SH',
// }

// export const getBitCoinTypeBySend = (type: WalletType | null) => {
//   switch (type) {
//     case 'bitcoinP2Pkh':
//       return BTCAddressType.P2PKH
//     case 'bitcoinP2Wpkh':
//       return BTCAddressType.P2WPKH
//     case 'bitcoinP2Sh':
//       return BTCAddressType.P2SH
//     case 'bitcoinP2Tr':
//       return BTCAddressType.P2TR
//     default:
//       return BTCAddressType.P2TR
//   }
// }

// export const getBitCoinKeyByType = (type: BTCAddressType) => {
//   switch (type) {
//     case BTCAddressType.P2PKH:
//       return 'bitcoinP2pkh'
//     case BTCAddressType.P2WPKH:
//       return 'bitcoinP2wpkh'
//     case BTCAddressType.P2SH:
//       return 'bitcoinP2sh'
//     case BTCAddressType.P2TR:
//       return 'bitcoinP2tr'
//     default:
//       return undefined
//   }
// }

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// export const isBtc = (chainId: number): boolean => {
//   return mockBtcEvmChainId === chainId
// }

export async function hashWithWebCrypto(message: string) {
  const msgBuffer = new TextEncoder().encode(message)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } else {
    return CryptoJS.SHA256(message).toString()
  }
}

// export function encrypt(text: string, secretKey: string) {
//   return CryptoJS.AES.encrypt(text, secretKey).toString()
// }

// export function decrypt(encryptedMessage: string, secretKey: string) {
//   try {
//     return CryptoJS.AES.decrypt(encryptedMessage, secretKey).toString(CryptoJS.enc.Utf8)
//   } catch (e) {
//     return ''
//   }
// }

// export function logout() {
//   try {
//     localStorage.removeItem('user')
//     localStorage.removeItem('userState')
//     localStorage.removeItem('pass-key')
//     localStorage.removeItem('TASKS_STATE')
//     localStorage.removeItem('REFERRAL_QRCODE_IMAGE')
//   } catch (err) {
//     //
//   }
// }

// export function markDevice(uid: number) {
//   try {
//     localStorage.setItem(`mail-${uid}`, '1')
//   } catch (err) {
//     //
//   }
// }
// export function checkDevice(uid: number) {
//   return localStorage.getItem(`mail-${uid}`) == '1'
// }

// export const marketUtilsTransferList = (
//   markets: TrendingToken[] | undefined,
//   sourceTokens: AssetsToken[],
//   getChainNameById: (chainId: IChainId | undefined) => any
// ) => {
//   if (!markets) return []
//   return markets
//     .map((mToken) => {
//       const findChains = sourceTokens.filter((sToken) => {
//         const chainId = Number(sToken.chainId) as IChainId
//         const chainName = getChainNameById(chainId)
//         return chainName === mToken.chain
//       })
//       let chainId = -1
//       if (findChains.length) {
//         chainId = findChains[0].chainId
//       }

//       const whiteToken: WhiteListInfo = {
//         balance: '0',
//         chain_id: chainId,
//         contract: mToken.address ?? '',
//         decimals: mToken.decimals,
//         image: mToken.imageUrl,
//         is_native: mToken.isNative,
//         mercuryo_support: mToken.displayName,
//         name: mToken.name.split('_')[0],
//         price: Number(mToken.priceUsd),
//         ramp_support: mToken.displayName,
//         symbol: mToken.symbol,
//       }

//       const assets: AssetsToken = {
//         isNative: mToken.isNative,
//         isToken: !mToken.isNative,
//         chainId: chainId,
//         decimals: mToken.decimals,
//         symbol: mToken.symbol,
//         name: mToken.name.split('_')[0],
//         address: mToken.address ?? '',
//         balance: '0',
//         price: Number(mToken.priceUsd),
//         image: mToken.imageUrl,
//         source: 'market',
//         id: `${mToken.address ?? ''}-${chainId}-${mToken.symbol}`,
//         formatted: '-',
//         whiteToken,
//         customToken: undefined,
//       }
//       return assets
//     })
//     .filter((i) => i.chainId !== -1)
// }

// export const marketListMerge = (source: AssetsToken[], market: AssetsToken[]) => {
//   const filter: AssetsToken[] = market.filter(
//     (m) =>
//       source.filter(
//         (s) =>
//           s?.address?.toLowerCase() === m?.address?.toLowerCase() &&
//           s.chainId === m.chainId &&
//           s.symbol === m.symbol
//       ).length === 0
//   )
//   return [...source, ...filter]
// }

// export function isWebInTg() {
//   const numStr = sessionStorage.getItem('isInTg')
//   return numStr ? Number(numStr) : true
// }

export function onTelegramVibrate() {
  try {
    if (navigator && 'vibrate' in navigator) {
      navigator.vibrate(50)
    } else {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  } catch (e) {
    console.log('onTelegramVibrate:', e)
  }
}
