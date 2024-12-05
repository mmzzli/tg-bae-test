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


export interface Search {
  avatar: string
  tg_id: number
  tgname: string
  if_follow: boolean
}

export type SearchItem = { users: Array<Search> }
