export interface IUserInfo {
  user_id: number
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  api_token: string
}

export interface IUserLogIn {
  api_token: string
  token: string
  user_info: IUserInfo
}

export interface UserInfoProfile {
  uid: number;
  username: string;
  bio: string;
  avatar: string;
}