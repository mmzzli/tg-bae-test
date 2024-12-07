export interface IUserInfo extends UserInfoProfile {
  user_id: number
  follower: number
  fans: number
  api_token: string
}

export interface IUserLogIn {
  api_token: string
  token: string
  user_info: IUserInfo
}

export interface UserInfoProfile {
  username: string
  bio: string
  avatar: string
}

export interface Follow {
  avatar: string
  tg_id: number
  tgname: string
}

export enum NotificationType {
  Follow = 1,
  Like = 2,
  Purchase = 3,
}

export type Notification = {
  id: number
  type: NotificationType
  content: string
  time: string
  post: {
    id: number
    title: string
    price: number
    media: string
    thumbnail: string
    type: number
  }
  user: {
    avatar: string
    if_follow: boolean
    uid: number
    username: string
  }
}

export interface Search {
  avatar: string
  tg_id: number
  tgname: string
  if_follow: boolean
  fans_id: number
}

export type SearchItem = { users: Array<Search> }
