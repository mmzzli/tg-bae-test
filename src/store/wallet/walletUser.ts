import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import {
  UserType,
  UserState,
} from './type'
import { InitDataUnsafe } from '@vkruglikov/react-telegram-web-app'


export const initUserInfo = () => {
  const userInfo = localStorage.getItem('user')
  if (!userInfo || userInfo === 'null') return {}
  return JSON.parse(userInfo)
}

export const initUserState = () => {
  const userState = localStorage.getItem('userState')
  if (!userState)
    return {
      tgId: undefined,
      userId: undefined,
      newUser: false,
      frozen: false,
      loginTime: undefined,
      tokenExpired: undefined,
      setTradePassword: false
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
    query: undefined
  },
  userInfoRefresh: 0,
  userState: initUserState(),
  walletUserInfo: initUserInfo(),
  updateUserStateAction: (info: UserState) => {
    set((state) => {
      return { userState: { ...state.userState, ...info }}
    })
    localStorage.setItem('userState', JSON.stringify(info))
  },
  updateTgAction: (data: InitDataUnsafe, query: string) => {
    set((state) => {
      return { tgData: { data, query }}
    })

  },
  updateUserInfoAction: (info: UserType) => {
    set((state) => {
      return { walletUserInfo: info }
    })
    localStorage.setItem('user', JSON.stringify(info))
  },
  fetchUserInfoAction: () => {
    set((state) => {
      return { userInfoRefresh: new Date().getTime() }
    })

  },
})

export const useUserStore = () => useStore((state) => state, shallow)
