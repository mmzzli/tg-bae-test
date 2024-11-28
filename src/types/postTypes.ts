// view
export interface IMedia {
  type: 'image' | 'video'
  source: string
  previewUrl?: string
}

export type ViewListItem = {
  id: number
  uid: number
  type: number
  title: string
  media: string[] | string
  like: number
  is_liked: boolean
  is_collected: boolean
  comment: number
  created_at: string
}

export type ViewListReq = { page_num: number; records: number }

export type PostResourceReq = {
  media: string
  title?: string
  type: number
  currency: number
  price: number
  duration?: number
}

// like
export type LikeReq = { act_type: number; post_id: number }
export type LikeRes = {
  like: number
  post_id: number
}

// recommend
export type PostItem = {
  comment: number
  created_at: string
  currency: number
  id: number
  is_liked: boolean
  is_collected: boolean
  like: number
  media: string
  price: number
  title: string
  type: number
  uid: number
  is_follow: boolean
}
export type UserItem = {
  avatar: string
  uid: number
  username: string
  fans: number
  follower: number
}
export type ListItem = {
  user: UserItem
  post: PostItem
}
export type RecommendListReq = { page_num: number; records: number }
export type ListRes = {
  posts: Array<ListItem>
}

// getUserPosts
export type UserPostsReq = { page_num: number; records: number; uid: number }
export type UserPostsRes = { posts: Array<PostItem> }

export type OthersUserInfo = UserItem & { bio: string; fans: number; follower: number }

export type ShareInfo = {
  type: number
  media: ListItem[]
  userInfo: OthersUserInfo & { user_id: number }
}

export type LinkMetadata = {
  site_name: string
  title: string
  desc: string
  image: string
  url: string
}
export type totalAvailable = {
  available: number
  exchange_rate: number
}

export type AccountdetailItem = {
  created_at: string
  amount: number
}

export type AccountdetailRes = { accounts: Array<AccountdetailItem> }
