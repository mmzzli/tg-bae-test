import { post, get, put } from './base'
import { IUserLogIn, OthersUserInfo, PostItem, UserInfoProfile, Follow } from '@/types'

export const logIn = (params: { user: string }) => {
  return post<IUserLogIn>(`/api/v1/login`, params)
}

export const getSomeoneProfile = (uid: number) => {
  return get<OthersUserInfo>(`/api/v1/profile/${uid}`)
}
export const getSomeonePosts = (uid: number) => {
  return get<{ posts: PostItem[] }>(`/api/v1/profile/${uid}`)
}

export const getFollowerList = (uid: number) => {
  return get<Follow[]>(`/api/v1/followers/${uid}`)
}

export const getFollowingList = (uid: number) => {
  return get<Follow[]>(`/api/v1/fans/${uid}`)
}

export const follow = (params: { fansid: number; tgid: number }) => {
  return post(`/api/v1/follow`, params)
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
export const putProfile = (params: { avatar: string; bio: string; username: string }) => {
  return put(`/api/v1/profile`, params)
}
export const getUnreadNotificationCount = (uid: number) => {
  return get<{ amount: number }>(`/api/v1/unread/${uid}`)
}
