import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { IUserInfo, OthersUserInfo } from '@/types'

export interface UserSlice {
  othersUserInfo: OthersUserInfo
  userInfo: IUserInfo
  setUserInfo: (info: IUserInfo) => void
  resetUserInfo: () => void
  setOthersUserInfo: (info: OthersUserInfo) => void
  resetOthersUserInfo: () => void
}

const initialUserInfo: IUserInfo = {
  user_id: -1,
  username: '',
  avatar: '',
  bio: '',
  followers: 0,
  following: 0,
  api_token: '',
}

const initialOthersUserInfo: OthersUserInfo = {
  uid: -1,
  username: '',
  avatar: '',
  bio: '',
  followers: 0,
  following: 0,
}

export const createUserSlice: StateCreator<UserSlice> = (set, get) => ({
  userInfo: initialUserInfo,
  othersUserInfo: initialOthersUserInfo,
  setUserInfo: (info) => set({ userInfo: info }),
  resetUserInfo: () => set({ userInfo: initialUserInfo }),
  setOthersUserInfo: (info) => {
    set({ othersUserInfo: info })
  },
  resetOthersUserInfo: () => set({ othersUserInfo: initialOthersUserInfo }),
})

export const selectUserInfo = (state: StoreState) => state.userInfo

export const useUserInfo = () => useStore((state) => state.userInfo, shallow)
