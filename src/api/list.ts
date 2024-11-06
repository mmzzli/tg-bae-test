import { ListItem, RecommendListReq, ListRes, ShareInfo } from '@/types'
import { get, post } from './base'

export const getLink = (params: { pid: number; uid: number }) => {
  return post<{
    ref: string
    host: string
  }>(`/api/v1/link`, params)
}

export const getSingleMedia = (ref: string) => {
  return get<ShareInfo>(`/api/v1/post/${ref}`)
}

export const getRecommendMedia = (params: RecommendListReq) => {
  return post<ListRes>(`/api/v1/recommend`, params)
}
