// view
export interface SignReq {
  receiver: string
  token: string
  chainid: number
  amount: string
}

interface SignaturesRes {
  signature: string
  deadline: number
}
export interface SignRes {
  signatures: SignaturesRes[]
  // deadline: number
}

export interface GiftsRes {
  gifts: number
  withdraw_gifts: number
  details: { chain_id: number; withdraw_gifts: number }[]
}

export interface WithdrawReq {
  from: string
  chain_id: number
  amount: number
  hash: string
}

export interface GiftHistoryReq {
  page_num: number
  records: number
}

export interface GiftHistoryItem {
  amount: number
  created_at: string
  currency: number
  from_address: string
  from_uid: number
  hash: string
  source: string
  status: number
  to_uid: number
  token: string
}

export interface GiftHistoryRes {
  gifts: GiftHistoryItem[]
}
