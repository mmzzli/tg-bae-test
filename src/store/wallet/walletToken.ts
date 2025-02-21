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
  sortByPriceBalance,
} from './util/tokenHelper'
import {
  CustomListInfo,
  IHistoryType,
  ReportHistoryType,
  TransactionsType,
  WhiteListInfo,
} from './type'
import { mergeTxs, updateSignleTx } from './util/txHelper'

export interface ITokenStore {
  isLoading: boolean
  tokenList: AssetsToken[]
  tokenListKeys: string
  customTokens: CustomListInfo[]
  whiteTokens: WhiteListInfo[]
  walletTxs: TransactionsType
  walletReportTxs: ReportHistoryType[]
  refreshTime: number
  tokensReSetActions: () => void
  tokensActions: (tokens: AssetsToken[]) => void
  customTokensActions: (tokens: CustomListInfo[]) => void
  whiteTokensActions: (tokens: WhiteListInfo[]) => void
  updateLoadingState: (state: boolean) => void
  walletTxsActions: (txs: TransactionsType) => void
  walletTxUpdateActions: (tx: IHistoryType) => void
  walletTxReportActions: (txs: ReportHistoryType[]) => void
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
  walletTxs: {},
  walletReportTxs: [],
  refreshTime: 0,
  tokensReSetActions: () => {
    set((state) => {
      return {
        tokenList: getCache(getWalletTokensKey() as string).length
          ? getCache(getWalletTokensKey() as string)
          : [],
      }
    })
  },
  tokensActions: (tokens: AssetsToken[]) => {
    if (shallowAssetsTokenEqual(get().tokenList, tokens)) {
      return
    }
    set((state) => {
      return {
        tokenList: sortByPriceBalance(tokens),
        tokenListKeys: JSON.stringify(tokens),
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
  },
  walletTxsActions: (txs: TransactionsType) => {
    set((state) => {
      return { walletTxs: mergeTxs(get().walletTxs, txs) }
    })
  },
  walletTxUpdateActions: (history: IHistoryType) => {
    const txs = updateSignleTx(JSON.parse(JSON.stringify(get().walletTxs)), history)
    if (txs) {
      set((state) => {
        return { walletTxs: mergeTxs(get().walletTxs, txs) }
      })
    }
  },
  walletTxReportActions: (txs: ReportHistoryType[]) => {
    set((state) => {
      return { walletReportTxs: txs }
    })
  },
})
