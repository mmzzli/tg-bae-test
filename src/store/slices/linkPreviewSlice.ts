import { StateCreator } from 'zustand'
import { LinkMetadata } from '@/types'

export interface LinkPreviewSlice {
  linkPreview: Map<string, LinkMetadata>
  telegramPreview: Map<string, LinkMetadata>
  setLinkPreview: (url: string, metadata: LinkMetadata) => void
  setTelegramPreview: (url: string, metadata: LinkMetadata) => void
  clearCache: () => void
}

export const createLinkPreviewSlice: StateCreator<LinkPreviewSlice> = (set) => ({
  linkPreview: new Map(),
  telegramPreview: new Map(),
  setLinkPreview: (url, metadata) =>
    set((state) => {
      state.linkPreview.set(url, metadata)
      return { linkPreview: state.linkPreview }
    }),
  setTelegramPreview: (url, metadata) =>
    set((state) => {
      state.telegramPreview.set(url, metadata)
      return { telegramPreview: state.telegramPreview }
    }),
  clearCache: () => set({ linkPreview: new Map(), telegramPreview: new Map() }),
})
