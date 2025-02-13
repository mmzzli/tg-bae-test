import { IOKXHistoryType, TokenOkx, UserState, UserType } from '@/store/wallet/type'
import { WalletApiResponse, walletGet, walletPost, tomoTgGet, tomoTgPost } from './walletBase'


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
  return ret.result[0]
}

export const getAllTokenBalancesByAccount = async (params: {
  accountId: string
  chains: string //1,56,42161,8453,81457,43114,137,534352,10,59144,195,501
  filter?: '0' | '1' //filter risk token
}): Promise<TokenOkx[]> => {
  console.log(params, 'params')
  const path = new URLSearchParams(params).toString();
  const ret = await walletGet(
    `socialLogin/projectWallet/getOkxWalletAccountTokenBalances?${path}`
  )
  return ret.result[0].tokenAssets
}

export const loginJavaApi = async (initData: string) => {
  const res = await walletPost<WalletApiResponse<UserState>>(
    'socialLogin/projectUser/bae/loginByTelegramMini',
    {
      telegramAuthData: initData
    }
  )
  return res
}

export const getTelegramUserInfoApi = async () => {
  const res = await walletGet<WalletApiResponse<UserType>>(`socialLogin/teleGram/userInfo`)
  return res
}

export const getDefaultWalletAddressApi = async (userId: number) => {
  const res = await walletGet<WalletApiResponse<any>>(
    `socialLogin/projectWallet/getDefaultWalletByUserId?userId=${userId}`
  )
  return res
}

export const getOkxWalletAccountApi = async () => {
  const res = await walletGet<WalletApiResponse<string>>('socialLogin/projectWallet/okxWalletAccount')
  return res
}

export const getAllBalance = async (params: {
  evm_address: string
  solana_address: string
}): Promise<
  {
    balance: string
    chain_id: number
    contract: string
    decimals: number
    image: string
    is_native: boolean
    mercuryo_support: string
    name: string
    price: number
    ramp_support: string
    symbol: string
    chain: string
    display_name: string
  }[]
> => {
  const ret = await tomoTgGet(`tg-auth/v1/token/balance`,  params )
  debugger
  return ret.data.data
}

export const v1AllAssetApi = async (params: {
  page: number
  pageSize: number
  chain_ids?: number[]
}) => {
  const res = await tomoTgGet('tg-auth/v1/asset/all', params )
  return res.data.data
}
