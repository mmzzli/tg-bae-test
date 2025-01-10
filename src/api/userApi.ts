import { post, get, put, del } from './base'
import {
  IUserLogIn,
  OthersUserInfo,
  PostItem,
  UserInfoProfile,
  Follow,
  Search,
  SearchItem,
  Notification,
} from '@/types'

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
export const getFansFollowers = (uid: number) => {
  return get<Follow[]>(`/api/v1//fans_followers/${uid}`)
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
// Notification START
export const getUnreadNotificationCount = (uid: number) => {
  return get<{ amount: number }>(`/api/v1/unread/${uid}`)
}
export const getLatestReadNotificationId = (uid: number) => {
  return get<{ latest_id: number }>(`/api/v1/read/${uid}`)
}
export const setLatestReadNotificationId = (msgid: number) => {
  return post<{ id: number }>(`/api/v1/read`, { read_id: msgid })
}
export const getNotifications = (params: { page_num: number; records: number }) => {
  return post<{ posts: Notification[] }>(`/api/v1/message`, params)
}
export const getNotificationsById = (params: { id: number; records: number }) => {
  return post<{ posts: Notification[] }>(`/api/v1/unread_message`, params)
}
export const deleteNotification = (mid: number) => {
  return del(`/api/v1/message/${mid}`)
}
// Notification END

// Daily Task START
export const dailyLoginTask = () => {
  return post<any>(`/api/v1/points/open`)
}

export const dailyChatTask = () => {
  return post<any>(`/api/v1/points/chat`)
}

export const dailyWatchTask = (pid: number) => {
  return post<any>(`/api/v1/points/watch/${pid}`)
}

export const completeAllTasks = () => {
  return post<any>(`/api/v1/points/complete`)
}

export const claimTask = (task_type: number) => {
  return post<any>(`/api/v1/points/claim/${task_type}`)
}

export const claimAllTasks = () => {
  return post<any>(`/api/v1/points/complete`)
}

export const getPaidStars = () => {
  return get<any>(`/api/v1/points/usepoints`)
}

export const getPaidStarPoints = () => {
  return get<any>(`/api/v1/points/earnpoints`)
}

export const getFollowTask = () => {
  return post<any>(`/api/v1/points/once_points`)
}

export const claimFollowTask = (task_id: number) => {
  return post<any>(`/api/v1/points/claim_once/${task_id}`)
}

export const setFollowTaskToClaimed = (task_name: string) => {
  return post<any>(`/api/v1/points/follow_x_ins/${task_name}`)
}

// Daily Task END

export const searchByUsername = (params: { field: string; page_num: number; records: number }) => {
  return post<SearchItem>(`/api/v1/user/search_by_username`, params)
}
export const getSearchTgidName = (name: string) => {
  return get<number>(`/api/v1/user/search_tgid_by_name/${name}`)
}

export const rewardEvent = (params: {
  from: string
  to_uid: number
  chain_id: number
  amount: number
  hash: string
}) => {
  return post<any>(`/api/v1/verify`, params)
}

export const approveEvent = (params: { hash: string; chain_id: number }) => {
  return post<any>(`/api/v1/verify_hash`, params)
}
