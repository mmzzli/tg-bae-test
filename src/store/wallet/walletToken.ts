import { observable, autorun, action } from 'mobx'
import { AssetsToken } from './tokenType/AssetsToken'
import {
  getCache,
  getCacheTokens,
  getWalletTokensKey,
  shallowAssetsTokenEqual,
  sortByPriceBalance
} from './util/tokenHelper'

interface ITokenStore {
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

/**
 *
 * @warning this store only support source api token list.
 */
const tokenStore: ITokenStore = observable({
  isLoading: true,
  tokenList: getCacheTokens().length ? getCacheTokens() : [],
  tokenListKeys: '',
  refreshTime: 0,
  tokensReSetActions: action(() => {
    tokenStore.tokenList = getCache(getWalletTokensKey() as string).length
      ? getCache(getWalletTokensKey() as string)
      : []
  }),
  tokensActions: action((tokens: AssetsToken[]) => {
    if (shallowAssetsTokenEqual(tokenStore.tokenList, tokens)) {
      return
    }
    tokenStore.tokenList = sortByPriceBalance(tokens)
    tokenStore.tokenListKeys = JSON.stringify(tokenStore.tokenList)
  }),
  refreshTokenStore: action(() => (tokenStore.refreshTime = new Date().getTime())),
  updateLoadingState: action((state: boolean) => {
    tokenStore.isLoading = state
  })
})

autorun(() => {
  console.log({
    key: 'tokenStore',
    tokenList: tokenStore.tokenList
  })
})

export default tokenStore
