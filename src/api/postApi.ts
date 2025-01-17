import { Conversation, Message } from '@/components/SDK/BaeimSDK'
import { del, get, post } from './base'
import {
  LikeReq,
  LikeRes,
  PostResourceReq,
  UserPostsReq,
  UserPostsRes,
  ListRes,
  FeaturedListRes,
  ViewListReq,
  LinkMetadata,
  totalAvailable,
  AccountdetailRes,
  VoteReq,
  VoteRes
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
export const favPost = (pid: number) => {
  return post(`/api/v1/fav/${pid}`)
}
export const favDel = (pid: number) => {
  return del(`/api/v1/fav/${pid}`)
}
export const ordersList = (params: ViewListReq) => {
  return post<ListRes>(`/api/v1/orders`, params)
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
  return post<Conversation[]>(`${import.meta.env.VITE_APP_IM_URL}conversation/sync`, params, {
    headers: { token: import.meta.env.VITE_APP_IM_TOKEN },
  })
}

export const getMessagesSync = (params: {
  uid: string
  login_uid: string
  channel_id: string
  channel_type: number
  start_message_seq: number
  end_message_seq: number
  pull_mode: number
  limit: number
}) => {
  return post<{ messages: Message[] }>(
    `${import.meta.env.VITE_APP_IM_URL}channel/messagesync`,
    params,
    {
      headers: { token: import.meta.env.VITE_APP_IM_TOKEN },
    }
  )
}

export const setUnread = (params: {
  uid: string
  channel_id: string
  channel_type: number
  unread: number
}) => {
  return post<Message[]>(`${import.meta.env.VITE_APP_IM_URL}conversations/setUnread`, params, {
    headers: { token: import.meta.env.VITE_APP_IM_TOKEN },
  })
}

export const deleteChannel = (params: { channel_id: string; channel_type: number }) => {
  return post<Message[]>(`${import.meta.env.VITE_APP_IM_URL}channel/delete`, params, {
    headers: { token: import.meta.env.VITE_APP_IM_TOKEN },
  })
}

export const deleteConversation = (params: {
  uid: string
  channel_id: string
  channel_type: number
}) => {
  return post<{ status: number }>(
    `${import.meta.env.VITE_APP_IM_URL}conversations/delete`,
    params,
    {
      headers: { token: import.meta.env.VITE_APP_IM_TOKEN },
    }
  )
}

export const totalAvailableInvoice = () => {
  return get<totalAvailable>(`/api/v1/order/total_available_invoice`)
}
export const accountdetailList = (params: any) => {
  return post<AccountdetailRes>(`/api/v1/order/accountdetail`, params)
}

export const featured = (params: any) => {
  return post(`/api/v1/featured`, params)
}
export const allFeatured = (params: { page_num: number; records: number; type: number }) => {
  return post<FeaturedListRes>(`/api/v1/all_featured`, params)
}

export const getVoteDetail = () => {
  return get<any>(`/api/v1/vote_detail`)
}
export const postVote = (params: VoteReq) => {
  return post<VoteRes>(`/api/v1/vote`, params)
}
