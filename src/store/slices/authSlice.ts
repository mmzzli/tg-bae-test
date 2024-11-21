import { StateCreator } from 'zustand'
import { StoreState } from '../store'

export interface AuthSlice {
  token: string
  setToken: (token: string) => void
  resetToken: () => void
  backToHome: boolean
  setBackToHome: (status: boolean) => void
}

const initialToken = ''

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  token: initialToken,
  setToken: (token) => set({ token }),
  resetToken: () => set({ token: initialToken }),
  backToHome: true,
  setBackToHome: (status) => set({ backToHome: status }),
})

export const selectToken = (state: StoreState) => state.token
export const useToken = (store: StoreState) => store.token
