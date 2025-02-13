import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { AssetsToken } from './tokenType/AssetsToken'
import {
  getCache,
  getCacheTokens,
  getWalletTokensKey,
  shallowAssetsTokenEqual,
  shallowCustomListInfoEqual,
  shallowWhiteListInfoEqual,
  sortByPriceBalance
} from './util/tokenHelper'
import { CustomListInfo, WhiteListInfo } from './type'

export interface ITokenStore {
  isLoading: boolean
  tokenList: AssetsToken[]
  tokenListKeys: string
  customTokens: CustomListInfo[]
  whiteTokens: WhiteListInfo[]
  refreshTime: number
  tokensReSetActions: () => void
  tokensActions: (tokens: AssetsToken[]) => void
  customTokensActions: (tokens: CustomListInfo[]) => void
  whiteTokensActions: (tokens: WhiteListInfo[]) => void
  updateLoadingState: (state: boolean) => void
  /**
   *
   * @warning refresh all data of tokenstore.
   */
  refreshTokenStore: () => void
}

export const createTokenStore: StateCreator<ITokenStore> = (set, get) => ({
  isLoading: true,
  tokenList: getCacheTokens().length ? getCacheTokens() : [],
  tokenListKeys: '',
  customTokens: [],
  whiteTokens: [],
  refreshTime: 0,
  tokensReSetActions: () => {
    set((state) => {
      return { tokenList: getCache(getWalletTokensKey() as string).length
        ? getCache(getWalletTokensKey() as string)
        : [] }
    })
  },
  tokensActions: (tokens: AssetsToken[]) => {
    if (shallowAssetsTokenEqual(get().tokenList, tokens)) {
      return
    }
    set((state) => {
      return { 
        tokenList: sortByPriceBalance(tokens),
        tokenListKeys: JSON.stringify(tokens)
       }
    })
  },
  customTokensActions: (tokens: CustomListInfo[]) => {
    if (shallowCustomListInfoEqual(get().customTokens, tokens)) {
      return
    }
    set((state) => {
      return { 
        customTokens: tokens,
       }
    })
  },
  whiteTokensActions: (tokens: WhiteListInfo[]) => {
    if (shallowWhiteListInfoEqual(get().whiteTokens, tokens)) {
      return
    }
    set((state) => {
      return { 
        whiteTokens: tokens,
       }
    })
  },
  refreshTokenStore: () => {
    set((state) => {
      return { refreshTime: new Date().getTime() }
    })
  },
  updateLoadingState: (loading: boolean) => {
    set((state) => {
      return { isLoading: loading }
    })
  }
})

export const useTokenStore = () => useStore((state) => state, shallow)