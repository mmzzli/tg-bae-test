import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'
import { createUserSlice, UserSlice } from './slices/userSlice'
import { AuthSlice, createAuthSlice } from './slices/authSlice'
import {
  ResourceListSlice,
  createResourceListSlice,
  BaseListState,
} from './slices/resourceListSlice'
import { StateCreator } from 'zustand'
import { createIMSlice, IMSlice } from './slices/imSlice'
import { LinkPreviewSlice, createLinkPreviewSlice } from './slices/linkPreviewSlice'
import { createTGSlice, TGSlice } from '@/store/slices/tg'
import { createTaskSlice, TaskSlice } from './slices/taskSlice'
import { createSystemSlice, SystemSlice } from './slices/systemSlice'
import { createWebSocketSlice, WebSocketSlice } from './slices/websocket'
import { createUserStore, IUserStore } from './wallet/walletUser'
import { createTokenStore, ITokenStore } from './wallet/walletToken'
import { createCommonStore, ICommonStore } from './wallet/walletCommon'
import { createWalletRequestStore, IWalletRequestStore } from './wallet/walletRequest'

export interface StoreState
  extends UserSlice,
    AuthSlice,
    ResourceListSlice,
    IMSlice,
    TGSlice,
    TaskSlice,
    LinkPreviewSlice,
    SystemSlice,
    WebSocketSlice,
    IUserStore,
    ITokenStore,
    ICommonStore,
    IWalletRequestStore {
  recommendList: BaseListState
  viewList: BaseListState
}

type LocalStorageState = Pick<StoreState, 'userInfo'>
type SessionStorageState = Pick<StoreState, 'token'>

type MyMiddlewares = [
  ['zustand/devtools', never],
  ['zustand/persist', LocalStorageState],
  ['zustand/persist', SessionStorageState],
]

const createStore = (fn: StateCreator<StoreState, [], MyMiddlewares>) => {
  const store = createWithEqualityFn<StoreState>()(
    devtools(
      persist(
        persist(fn, {
          name: 'ditto-local-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            userInfo: state.userInfo,
          }),
        }),
        {
          name: 'ditto-session-storage',
          storage: createJSONStorage(() => sessionStorage),
          partialize: (state) => ({
            token: state.token,
          }),
        }
      ),
      {
        name: 'ditto-store',
      }
    ),
    shallow
  )
  return store
}

export const useStore = createStore(((...a) => ({
  ...createUserSlice(...a),
  ...createAuthSlice(...a),
  ...createResourceListSlice(...a),
  ...createIMSlice(...a),
  ...createLinkPreviewSlice(...a),
  ...createTGSlice(...a),
  ...createTaskSlice(...a),
  ...createSystemSlice(...a),
  ...createWebSocketSlice(...a),
  ...createUserStore(...a),
  ...createTokenStore(...a),
  ...createCommonStore(...a),
  ...createWalletRequestStore(...a),
})) as StateCreator<StoreState, [], MyMiddlewares>)
