import { RecommendListReq, ListRes, ShareInfo, FeaturedListRes } from '@/types'
import { get, post } from './base'
import { DailyTask } from '@/store/slices/systemSlice'

export const getLink = (params: { pid: number; uid: number }) => {
  return post<{
    ref: string
    host: string
  }>(`/api/v1/link`, params)
}

export const getShareInlineMessageId = (params: { pid: number; uid: number }) => {
  return post<{
    result: { id: string }
  }>(`/api/v1/linkremote`, params)
}

export const getSingleMedia = (ref: string) => {
  return get<ShareInfo>(`/api/v1/post/${ref}`)
}

export const getRecommendMedia = (params: RecommendListReq) => {
  return post<ListRes>(`/api/v1/recommend`, params)
}
export const recommendFeatured = (type:string) => {
  return get<FeaturedListRes>(`/api/v1/recommend_featured/${type}`)
}

export const getDailyTask = () => {
  return post<DailyTask>(`/api/v1/points`)
}

export const getTaskPoints = () => {
  return post<any>(`/api/v1/points/activity`)
}
