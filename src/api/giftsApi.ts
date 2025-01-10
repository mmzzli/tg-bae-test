import { Conversation, Message } from '@/components/SDK/BaeimSDK'
import { del, get, post } from './base'
import {
  SignReq,
  SignRes,
  GiftsRes,
  WithdrawReq,
  GiftHistoryRes,
  GiftHistoryReq
} from '@/types'

export const getTotalGifts = () => {
  return post<GiftsRes>(`/api/v1/total_gifts`)
}


export const giftSign = (params:SignReq) => {
  return post<SignRes>(`/api/v1/sign`,params)
}
// type WithdrawHashReq struct {
//   From    string  json:"from" validate:"required"
//   ChainID int     json:"chain_id" validate:"required"
//   Amount  float64 json:"amount" validate:"required"
//   Hash    string  json:"hash" validate:"required"
// }
export const verifyWithdraw = (params:WithdrawReq) => {
  return post(`/api/v1/verify_withdraw`,params)
}

export const getGiftHistory = (params: GiftHistoryReq) => {
  return post<GiftHistoryRes>(`/api/v1/gifts`, params)
}

