import { StateCreator } from 'zustand'
import { useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { WalletRequestType } from './type'

export interface IWalletRequestStore {
  requestParam: WalletRequestType
  requestParamActions: (params: WalletRequestType) => void
}

export const createWalletRequestStore: StateCreator<IWalletRequestStore> = (set, get) => ({
  requestParam: { method: '', params: [] },
  requestParamActions: (params: WalletRequestType) => {
    set((state) => {
      return { requestParam: params }
    })
  },
})

export const useWalletRequestStore = () => useStore((state) => state, shallow)
