import { FeeMode } from '@/pages/Wallet/components/FeeSelect'
import { SolanaTransaction, TronTransaction } from 'rango-sdk'
import { IChainId, IChainType, IWeb3ChainType } from './chainType'
import { AssetsToken } from './tokenType/AssetsToken'

export enum PlatformType {
  EVM = 'evm',
  TON = 'ton',
  TRON = 'tron',
  BITCOIN = 'bitcoin',
  SOLANA = 'solana',
  SUI = 'sui',
}

export enum Aggregator {
  RANGO = 'Rango',
  OKX = 'Okx',
  JUPITER = 'Jupiter',
  STONFI = 'Ston.fi',
}

export enum ApiSWapDexNameType {
  OKX_SWAP = 1,
  OKX_CROSS = 2,
  RANGO_BASIC = 3,
  RANGO_MAIN = 4,
  JUPITER = 5,
  OKX_CROSS_SORT1 = 6,
  OKX_CROSS_SORT2 = 7,
}

export enum DexTag {
  FAST = 'fast',
  MAX = 'max',
  BEST = 'best',
}

export type UserType = {
  id: number
  set_trade_password: boolean
  cubistKeyId: string
  email?: string
  enablePassTrade: false
  followTgChannelTask: true
  fromHoobe: false
  imName: string
  inviteCode: string
  newUser: false
  nickname?: string
  token: string
  socialType: string
  username: string
  authType: string
  avatar: string
  tgId?: string
  tgName?: string
  okxAccount?: string
  defaultWalletId?: number
  // lastLoginTime?: number
} & UserAddressType

export type UserAddressType = {
  ethereumAddress: string
  solanaAddress: string
  tronAddress: string
  tonAddress: string
  tonAddressTest: string
  suiAddress: string
  tonPublicKey?: string
  cosmosAddress?: string
  dogeAddress: string
}

export type UserState = {
  tgId: number
  userId: number
  newUser: boolean
  frozen: boolean
  loginTime: number
  tokenExpiredAt: number
  setTradePassword: boolean
  email?: string
  token: string
}

export interface TokenOkx {
  chainIndex: string
  tokenAddress: string
  symbol: string
  balance: string // unit ether
  tokenPrice: string
  tokenType: '1' | '2' // 1 token 2 ordinals
  isRiskToken: boolean
}

export type IOKXHistoryType = {
  amount: string // not formatted
  chainIndex: string
  from: [{ address: string }]
  hitBlacklist: boolean
  itype: string
  methodId: string | undefined // 16hex
  nonce: string | undefined
  symbol: string
  tag: string
  to: [{ address: string; amount?: string }]
  tokenAddress: string
  txFee: string | undefined // formatted
  txHash: string
  txStatus: string
  txTime: string
}

export interface CustomListInfo {
  ID: number
  chain_id: number
  created_at: number
  decimals: number
  chain: string
  display_name: string
  image: string
  market_cap: number
  name: string
  price: number
  price_change_h24: number
  symbol: string
  token: string
  uid: number
}

export interface WhiteListInfo {
  balance: string
  chain_id: number
  contract: string
  chain: string
  display_name: string
  decimals: number
  image: string
  is_native: boolean
  mercuryo_support: string
  name: string
  price: number
  ramp_support: string
  symbol: string // "ARB-ETH"
}

export interface DexTransaction {
  fromToken: ITomoToken
  toToken: ITomoToken
  fromAddress: string
  targetAddress?: string // send target wallet
  toAddress: string
  approveTo?: string | null
  approveData?: string | null
  approveDexContractAddress?: string
  value?: number | string
  gasFee?: number | string
  maxGas?: number | null
  gasPrice?: string | null
  maxFeePerGas?: string | null
  maxPriorityFeePerGas?: string | null
  data?: any
  memo?: string | null
  instructions?: any
  recentBlockhash?: string | null
  signatures?: any
  serializedMessage?: any
  txType?: string
  needApprove?: boolean
  originTron?: TronTransaction
  params?: CreateTxParams
  rangoSolData?: SolanaTransaction
  rangoRequestId?: string
  randomKeyAccount?: string[]
  jupiterSolData?: IJupiterSolData
  baseFee?: string
  fees?:
    | {
        [key in FeeMode]:
          | {
              gasLimit: string
              gasPrice: string
            }
          | undefined
      }
    | undefined
  signatureDataFunc?: string
}

export interface ITomoToken {
  chain?: string
  chainId: number
  chainType?: IWeb3ChainType['type']
  chainInfo?: IWeb3ChainType
  address: string
  name: string
  symbol?: string
  decimals: number
  logoURI: string
  price: string
}

export interface ITomoNetwork {
  nickname?: string
  chainId?: number
  platform: PlatformType
}

export interface CreateTxParams {
  fromToken: ITomoToken
  toToken: ITomoToken
  fromNetwork: ITomoNetwork
  toNetwork: ITomoNetwork
  amount: string
  fromAddress: string
  toAddress: string
  routeInfo: DexRouteInfo
  slippage?: number
  contractCall?: boolean
  rangoApiKey: string
  fromChain: IChainType | undefined
  toChain: IChainType | undefined
  extraInfo: IExtraInfo
  feeMode: FeeMode
  computeUnitPrice?: string
  computeUnitLimit?: string
  referrerInfo: {
    referrerFee: number
    referrerAddress: string
  }[]
}

export interface IJupiterSolData {
  swapTransaction: string
  [objKey: string]: any
}

export interface DexRouteInfo {
  estimateGasFee: string
  estimateGasValue?: string
  estimateTime: number
  minimumReceived: string
  aggregatorType: Aggregator
  originRoute?: string
  swapData?: any
  rangoRequestId?: string
  swapperLogo: string
  swapperTitle: string
  minReceived?: string
  priorityPrice?: number
  extraString?: string
  dexType?: ApiSWapDexNameType
  tag?: DexTag[]
  DexType?: number
  fee?: RouteFeeInfo
}

export interface IExtraInfo {
  solAddress?: string
}

export type RouteFeeInfo = {
  fee: string
  formatted: string | undefined
  formattedUsd: string | undefined
  totalFeeInfos?:
    | {
        [key in FeeMode]: {
          fee: string
          formatted: string
          formattedUsd: string
        }
      }
    | undefined
  gasPrice: string
  gasLimit: number
}

export type TransactionsType = { [key in IChainId]?: IHistoryType[] }

export type IHistoryType = {
  fromAddress: string | undefined
  toAddress: string | undefined
  targetAddress?: string
  fromAmount: string | undefined
  toAmount: string
  nonce: number
  fromSwapTokens: {
    token: AssetsToken
    chain: IWeb3ChainType | undefined
    balance: AssetsToken | undefined
  }
  toSwapTokens: {
    token: AssetsToken
    chain: IWeb3ChainType | undefined
    balance: AssetsToken | undefined
  }
  time: number
  networkFee?: string
  block?: number
  hash: string
  chain?: IWeb3ChainType | undefined
  chainId?: IWeb3ChainType | undefined
  type?: 'OKX' | 'Rango' | ''
  requestId?: string | undefined
  historyType: 'Swap' | 'Send' | 'Approve' | 'Receive' | 'Pay'
  status?: 'success' | 'pending' | 'failed' | 'loading' | 'unknow'

  blocknumber?: string | undefined
  endTime?: number
  gasAmount?: string | undefined

  toHash?: string | undefined
  toHashInfo:
    | {
        blocknumber: string | undefined
        endTime: number
        gasAmount: string | undefined
      }
    | undefined
  routeInfo?: {
    swapperTitle: string
    swapperLogo: string
    aggregatorType: Aggregator | undefined
  }
  source?: 'OKX' | 'TOMO' | undefined
}

export type ReportHistoryType = {
  chainID: number
  gas: string
  tx: string
  type: 'swap' | 'send'
  userID: number
  requestId: number
  source: string
  sourceType: 'cross' | 'normal'
}

export type ReportSourceType = {
  plat: 'OKX' | 'Rango' | ''
  sourceType: 'cross' | 'normal'
  requestId: string
  time: number
  status: string
  from: {
    chainID: number
    symbol: string
    tokenAddress: string
    amount: string
    decimals: number
  }
  hash: string
  to: {
    chainID: number
    symbol: string
    tokenAddress: string
    amount: string
    decimals: number
  }
  toHash: string
  toAddress: string
  toBlock: string
  routeInfo:
    | {
        aggregatorType: Aggregator | undefined
        swapperLogo: string
        swapperTitle: string
      }
    | undefined
}

export type ChainGasResult = {
  gasLimit: string
  baseFee: string
  priorityFeeLow: string
  priorityFeeMedium: string
  priorityFeeHigh: string
}

export type ChainGasFeesType = {
  baseFee: string
  priorityFee: string
  fee: string
  data: ChainGasResult
}

export type ApiParams = {
  user: UserType
  type: string
  params: DexTransaction
  init?: () => void
}

export interface SolSendTx {
  rawTransaction: string
}
