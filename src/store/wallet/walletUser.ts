import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { UserType, UserState } from './type'
import { InitDataUnsafe } from '@vkruglikov/react-telegram-web-app'
import { STORAGE_KEY } from './util/tokenHelper'

export const initUserInfo = () => {
  const userInfo = localStorage.getItem(STORAGE_KEY.user)
  if (!userInfo || userInfo === 'null') return {}
  return JSON.parse(userInfo)
}

export const initUserState = () => {
  const userState = localStorage.getItem(STORAGE_KEY.userState)
  if (!userState)
    return {
      tgId: undefined,
      userId: undefined,
      newUser: false,
      frozen: false,
      loginTime: undefined,
      tokenExpiredAt: undefined,
      setTradePassword: false,
      token: '',
    }
  return JSON.parse(userState)
}

export interface IUserStore {
  tgData: {
    data: InitDataUnsafe | undefined
    query: string | undefined
  }
  userInfoRefresh: number
  userState: UserState
  walletUserInfo: UserType
  updateUserStateAction: (userState: UserState) => void
  updateTgAction: (data: InitDataUnsafe, query: string) => void
  updateUserInfoAction: (info: UserType) => void
  fetchUserInfoAction: () => void
}

export const createUserStore: StateCreator<IUserStore> = (set, get) => ({
  tgData: {
    data: undefined,
    query: undefined,
  },
  userInfoRefresh: 0,
  userState: initUserState(),
  walletUserInfo: initUserInfo(),
  updateUserStateAction: (info: UserState) => {
    localStorage.setItem(STORAGE_KEY.userState, JSON.stringify(info))
    set((state) => {
      return { userState: { ...state.userState, ...info } }
    })
  },
  updateTgAction: (data: InitDataUnsafe, query: string) => {
    set((state) => {
      return { tgData: { data, query } }
    })
  },
  updateUserInfoAction: (info: UserType) => {
    localStorage.setItem(STORAGE_KEY.user, JSON.stringify(info))
    set((state) => {
      return { walletUserInfo: info }
    })
  },
  fetchUserInfoAction: () => {
    set((state) => {
      return { userInfoRefresh: new Date().getTime() }
    })
  },
})
