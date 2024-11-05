import { post, get } from './base'
import { IUserLogIn, OthersUserInfo, PostItem } from '@/types'

export const logIn = (params: { user: string }) => {
  return post<IUserLogIn>(`/api/v1/login`, params)
}

export const getSomeoneProfile = (uid: number) => {
  return get<OthersUserInfo>(`/api/v1/profile/${uid}`)
}
export const getSomeonePosts = (uid: number) => {
  return get<{ posts: PostItem[] }>(`/api/v1/profile/${uid}`)
}

export const botInvoice = (params: {
  amount: number
  memo: string
  post_id: string
  user_id: string
}) => {
  return post(`/api/v1/bot/invoice`, params)
}
export const viewPid = (pid: number) => {
  return get(`/api/v1/view/${pid}`)
}
export const profileEdit = (uid: number) => {
  return get(`/api/v1/profile/${uid}`)
}