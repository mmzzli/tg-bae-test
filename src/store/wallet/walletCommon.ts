import { StateCreator } from 'zustand'
import { StoreState, useStore } from '../store'
import { shallow } from 'zustand/shallow'
import { FeeMode } from '@/pages/Wallet/components/FeeSelect'

export interface ICommonStore {
  feeMode: FeeMode
  feeModeActions: (feeMode: FeeMode) => void
}

export const createCommonStore: StateCreator<ICommonStore> = (set, get) => ({
  feeMode: 'Fast' as FeeMode,
  feeModeActions: (feeMode: FeeMode) => {
    set((state) => {
      return { feeMode: feeMode }
    })
  },
})

export const useCommonStore = () => useStore((state) => state, shallow)
