// view
export interface SignReq {
  receiver: string
  token: string
  chainid: number
  amount: number
}

export interface SignRes {
  signature: string
  deadline: number
}

export interface GiftsRes {
  gifts: number
  withdraw_gifts: number
}

export interface WithdrawReq {
  from: string
  chain_id: number
  amount: number
  hash: string
}
