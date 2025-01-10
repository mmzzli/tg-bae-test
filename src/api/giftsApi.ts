import { Conversation, Message } from '@/components/SDK/BaeimSDK'
import { del, get, post } from './base'
import {
  SignReq,
  SignRes,
  GiftsRes
} from '@/types'

export const getTotalGifts = () => {
  return post<GiftsRes>(`/api/v1/total_gifts`)
}


export const giftSign = (params:SignReq) => {
  return post<SignRes>(`/api/v1/sign`,params)
}
