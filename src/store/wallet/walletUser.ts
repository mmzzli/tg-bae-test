import { observable, action } from 'mobx'
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
  userState: UserState
  userInfo: UserType
  updateUserStateAction: (userState: UserState) => void
  updateTgAction: (data: InitDataUnsafe, query: string) => void
  updateUserInfoAction: (info: UserType) => void
  fetchUserInfoAction: () => void
}

const userStore: IUserStore = observable({
  tgData: {
    data: undefined,
    query: undefined
  },
  userState: initUserState(),
  userInfo: initUserInfo(),
  updateUserStateAction: action((userState: UserState) => {
    userStore.userState = {
      ...userStore.userState,
      ...userState
    }
    localStorage.setItem('userState', JSON.stringify(userState))
  }),
  updateTgAction: action((data: InitDataUnsafe, query: string) => {
    userStore.tgData = { data, query }
  }),
  updateUserInfoAction: action((info: UserType) => {
    userStore.userInfo = info
    localStorage.setItem('user', JSON.stringify(info))
  })
})

export default userStore
