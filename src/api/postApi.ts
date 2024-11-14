import { Conversation, Message } from '@/components/SDK/BaeimSDK'
import { del, get, post } from './base'
import {
  LikeReq,
  LikeRes,
  PostResourceReq,
  UserPostsReq,
  UserPostsRes,
  ListRes,
  ViewListReq,
  LinkMetadata,
} from '@/types'

export const postResources = (params: PostResourceReq) => {
  return post<string>(`/api/v1/post`, params)
}
export const viewList = (params: ViewListReq) => {
  return post<ListRes>(`/api/v1/view`, params)
}
export const favList = (params: ViewListReq) => {
  return post<ListRes>(`/api/v1/fav`, params)
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

export const getLinkMetadata = (url: string) => {
  return get<LinkMetadata>(`/meta?url=${url}`)
}

export const getConversationSync = (params: { uid: string; msg_count: number }) => {
  return post<Conversation[]>('https://imdev.anyconn.org/conversation/sync', params, {
    headers: { token: '662fd9dc8edae1de8cafb3822125f240' },
  })
}

export const getMessagesSync = (params: {
  uid: string
  channel_id: string
  channel_type: number
  start_message_seq: number
  end_message_seq: number
  pull_mode: number
  limit: number
}) => {
  return post<Message[]>(`https://imdev.anyconn.org/channel/messagesync`, params, {
    headers: { token: '662fd9dc8edae1de8cafb3822125f240' },
  })
}

export const setUnread = (params: {
  uid: string
  channel_id: string
  channel_type: number
  unread: number
}) => {
  return post<Message[]>(`https://imdev.anyconn.org/conversations/setUnread`, params, {
    headers: { token: '662fd9dc8edae1de8cafb3822125f240' },
  })
}
