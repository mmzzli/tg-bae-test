import { post, get, put } from './base'
import { IUserLogIn, OthersUserInfo, PostItem, UserInfoProfile } from '@/types'

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
  return post<string>(`/api/v1/bot/invoice`, params)
}
export const viewPid = (pid: number) => {
  return get<string>(`/api/v1/view/${pid}`)
}
export const profileEdit = (uid: number) => {
  return get<UserInfoProfile>(`/api/v1/profile/${uid}`)
}
export const putProfile = (params:{
  avatar: string,
  bio: string,
  username: string
}) => {
  return put(`/api/v1/profile`, params)
}

