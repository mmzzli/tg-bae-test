import { StateCreator } from 'zustand'
import { StoreState } from '../store'

export interface AuthSlice {
  token: string
  setToken: (token: string) => void
  resetToken: () => void
}

const initialToken = ''

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  token: initialToken,
  setToken: (token) => set({ token }),
  resetToken: () => set({ token: initialToken }),
})

export const selectToken = (state: StoreState) => state.token
export const useToken = (store: StoreState) => store.token
