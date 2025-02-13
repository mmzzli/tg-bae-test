import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { AssetsToken } from './tokenType/AssetsToken'
import {
  getCache,
  getCacheTokens,
  getWalletTokensKey,
  shallowAssetsTokenEqual,
  sortByPriceBalance
} from './util/tokenHelper'

export interface ITokenStore {
  isLoading: boolean
  tokenList: AssetsToken[]
  tokenListKeys: string
  refreshTime: number
  tokensReSetActions: () => void
  tokensActions: (tokens: AssetsToken[]) => void
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