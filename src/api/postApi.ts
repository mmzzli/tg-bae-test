import { del, get, post } from './base'
import {
  LikeReq,
  LikeRes,
  PostResourceReq,
  UserPostsReq,
  UserPostsRes,
  ListRes,
  ViewListReq,
} from '@/types'

export const postResources = (params: PostResourceReq) => {
  return post<string>(`/api/v1/post`, params)
}
export const viewList = (params: ViewListReq) => {
  return post<ListRes>(`/api/v1/view`, params)
}
export const postLike = (params: LikeReq) => {
  return post<LikeRes>(`/api/v1/like`, params)
}
export const postReq = () => {
  return get(`/api/v1/postreq`)
}

export const deletePost = (pid: number) => {
  return del<string>(`/api/v1/post/${pid}`)
}

export const getUsersPosts = (params: UserPostsReq) => {
  return post<UserPostsRes>(`/api/v1/other/user/posts`, params)
}
