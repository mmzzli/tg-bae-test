import { IOKXHistoryType, TokenOkx } from '@/store/wallet/type'
import { walletGet, walletPost } from './base'

export const getAllHistoryByAccount = async (params: {
  accountId: string
  begin?: string | undefined
  end?: string | undefined
  cursor?: string | undefined
  chainIndex?: string | undefined
}): Promise<{ cursor: string; transactionList: IOKXHistoryType[] }> => {
  const ret = await walletGet(
    'socialLogin/projectWallet/getOkxWalletAccountTransaction',
    {
      params,
      paramsSerializer: function (params) {
        return new URLSearchParams(params).toString()
      }
    }
  )
  return ret.data.result[0]
}


export const getAllTokenBalancesByAccount = async (params: {
  accountId: string
  chains: string //1,56,42161,8453,81457,43114,137,534352,10,59144,195,501
  filter?: '0' | '1' //filter risk token
}): Promise<TokenOkx[]> => {
  console.log(params, 'params')
  const ret = await walletGet(
    'socialLogin/projectWallet/getOkxWalletAccountTokenBalances',
    {
      params,
      paramsSerializer: function (params) {
        return new URLSearchParams(params).toString()
      }
    }
  )
  return ret.data.result[0].tokenAssets
}
