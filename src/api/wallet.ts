import { IOKXHistoryType, SolSendTx, TokenOkx, UserState, UserType } from '@/store/wallet/type'
import {
  WalletApiResponse,
  walletGet,
  walletPost,
  tomoTgGet,
  tomoTgPost,
  tomoAuthPost,
} from './walletBase'
import { errorContents } from '@/store/wallet/config/const'
import { IChainId } from '@/store/wallet/chainType'
import { getPassKey } from '@/components/tmd/utils/crypto'

export const getAllHistoryByAccount = async (params: {
  accountId: string
  begin?: string | undefined
  end?: string | undefined
  cursor?: string | undefined
  chainIndex?: string | undefined
}): Promise<{ cursor: string; transactionList: IOKXHistoryType[] }> => {
  const path = new URLSearchParams(params).toString()
  const ret = await walletGet(`socialLogin/projectWallet/getOkxWalletAccountTransaction?${path}`)
  return ret.result[0]
}

export const getAllTokenBalancesByAccount = async (params: {
  accountId: string
  chains: string //1,56,42161,8453,81457,43114,137,534352,10,59144,195,501
  filter?: '0' | '1' //filter risk token
}): Promise<TokenOkx[]> => {
  console.log(params, 'params')
  const path = new URLSearchParams(params).toString()
  const ret = await walletGet(`socialLogin/projectWallet/getOkxWalletAccountTokenBalances?${path}`)
  return ret.result[0].tokenAssets
}

export const loginJavaApi = async (initData: string) => {
  const res = await walletPost<WalletApiResponse<UserState>>(
    'socialLogin/projectUser/bae/loginByTelegramMini',
    {
      telegramAuthData: initData,
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
  const res = await walletGet<WalletApiResponse<string>>(
    'socialLogin/projectWallet/okxWalletAccount'
  )
  return res
}

export const getAllBalance = async (params: {
  evm_address: string
  solana_address: string
  sui_address: string
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
  const ret = await tomoTgGet(`tg-auth/v1/token/balance`, params)
  return ret.data
}

export const v1AllAssetApi = async (params: {
  page: number
  pageSize: number
  chain_ids?: number[]
}) => {
  const res = await tomoTgGet('tg-auth/v1/asset/all', params)
  return res.data
}

export const firstSetTradePasword = async (data: { newTradePassword: string }) => {
  const ret = await walletPost<WalletApiResponse>(
    `socialLogin/teleGram/user/firstSetTradePasword`,
    data
  )
  return ret
}

export const setTradePasword = async (data: {
  oldTradePassword: string
  newTradePassword: string
}) => {
  const ret = await walletPost<WalletApiResponse>(`socialLogin/teleGram/user/setTradePasword`, data)
  return ret
}

export const mfaAuthVerificationApi = async (data: any) => {
  const ret = await walletPost<WalletApiResponse>(`socialLogin/mfa/auth/verification`, data)
  return ret
}

export const resetTradePwdEmail = async (data: { code: string; tradePassword: string }) => {
  const ret = await walletPost<WalletApiResponse>(
    `socialLogin/teleGram/user/resetTradePasswordRecoverEmail`,
    data
  )
  return ret
}

export const bindEmailCodeSend = async (email: string) => {
  return await walletGet<WalletApiResponse>(`socialLogin/projectUser/bindRecoverEmailCode`, {
    email,
  })
}

export const bindEmailCodeVerify = async (params: { email: string; code: string }) => {
  return await walletPost<WalletApiResponse>(
    `/socialLogin/projectUser/bindRecoverEmailCodeVerifyToken`,
    params
  )
}

export const sendTradePwdEmail = async () => {
  return await walletGet<WalletApiResponse>(
    `socialLogin/teleGram/user/sendTradePwdRecoverEmail`,
    {}
  )
}

export const tonSignMessage = async (
  mfa: string,
  data: { signingMessageBoc: string; stateInitBoc: string; isTestnet?: boolean }
) => {
  return await walletPost<WalletApiResponse>(
    '/socialLogin/projectWallet/ton/signTransaction',
    {
      ...data,
      isTestnet: typeof data.isTestnet === 'boolean' ? data.isTestnet : false,
    },
    {
      headers: {
        // Authorization: `Bearer ${token}`,
        MFA: mfa,
      },
    }
  )
}

export const txReportListGet = async (params: { page: number; limit: number; userID: number }) => {
  const res = await tomoTgGet('tg-report/v1/report/tx/cost', params)
  return res.data
}

/*
 * tx report api
 **/
export const txReportPost = async (data: {
  chainID: number
  gas: string
  tx: string
  type: 'swap' | 'send'
  userID: number
  source: string
}) => {
  const res = await tomoTgPost('tg-report/v1/report/tx/cost', data)
  return res.data
}

export const postSendPoint = async (data: {
  chainId: string
  txId: string
  senderUserId: number
  senderAddress: string
  receiverAddress: string
  amount: string // bigint string
  tokenContract: string
  decimals: number
  symbol: string
  priceUsd: number
}): Promise<string> => {
  const res = await walletPost('/socialLogin/teleGram/send/record', data)
  return res?.data?.result
}

export const solSignRawTransaction = async (params: SolSendTx) => {
  const data = await walletPost<WalletApiResponse>(
    `/socialLogin/projectWallet/solana/signRawTransaction`,
    params,
    {
      headers: {
        mfa: getPassKey(),
      },
    }
  ).catch((error) => {
    const message = error?.response?.data?.message
    return Promise.reject(message ? message : errorContents.transactionError)
  })
  return data
}

export const signEvmTransaction = async (
  mfa: string,
  data: {
    transaction: {
      data: string | undefined
      gas: string | undefined
      gasPrice: string | undefined
      maxFeePerGas: string | undefined
      maxPriorityFeePerGas: string | undefined
      nonce: number | undefined
      to: string | undefined
      value: string | undefined
    }
    chainId: IChainId
  }
) => {
  return await walletPost<WalletApiResponse>(
    'socialLogin/projectWallet/ethereum/signTransaction',
    data,
    {
      headers: {
        mfa: mfa,
      },
    }
  )
}

export const v1AddAssetApi = async (data: {
  chain_id: number
  decimals: number
  image?: string
  name?: string
  symbol: string
  token: string
}) => {
  return await tomoAuthPost<WalletApiResponse>('v1/asset/add', data)
}
