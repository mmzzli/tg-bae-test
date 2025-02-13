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
  tokenExpired: number
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
