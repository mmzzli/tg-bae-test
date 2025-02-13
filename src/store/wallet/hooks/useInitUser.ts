import { useEffect, useCallback, useState } from 'react'
import {
  InitData,
  useInitData,
  useWebApp
} from '@vkruglikov/react-telegram-web-app'
import { getDefaultWalletAddressApi, getOkxWalletAccountApi, getTelegramUserInfoApi, loginJavaApi } from '@/api/wallet'
import { useStore } from '@/store'
import { shallow } from 'zustand/shallow'
import { UserType } from '../type'

// import {
//   getDefaultWalletAddressApi,
//   getOkxWalletAccountApi,
//   getSwapFeeAddress,
//   getTelegramUserInfoApi,
//   heartBeatPost,
//   isBindTotp,
//   loginJavaApi
// } from '@/api'
// import userStore from '..'
// import { reaction } from 'mobx'
// import { ExpreTime } from '../utils'
// import { UserType } from '../type'
// import tokenStore from '@/stores/tokenStore'
// import { Toast } from '@/components/tmd'
// import useBiometricManager from '@/hooks/useBiometricManager'
// import { useDeviceId } from '@/hooks/useDeviceId'
// import * as Sentry from '@sentry/react'
// import useApp from '@/hooks/oauth/useApp'


const useInitUser = () => {
  const [initDataUnsafe, initData] = useInitData()
  const webApp = useWebApp()
  // const { checkIsNewAccount, removeBioKey, getDeviceIdFromToken } =
  //   useDeviceId()
  // const { isValidActions } = useApp()

  const { updateUserStateAction, updateUserInfoAction, tokensReSetActions, fetchUserInfoAction, updateTgAction, walletUserInfo: userInfo, userState } = useStore(
      (state) => ({
        updateUserStateAction: state.updateUserStateAction,
        updateUserInfoAction: state.updateUserInfoAction,
        fetchUserInfoAction: state.fetchUserInfoAction,
        updateTgAction: state.updateTgAction,
        tokensReSetActions: state.tokensReSetActions,
        walletUserInfo: state.walletUserInfo,
        userState: state.userState
      }),
      shallow
    )

  const getUserInfo = async () => {
    // toast
    try {
      const infoResp = await getTelegramUserInfoApi()
      if (infoResp.code !== 10000) {
        // toast.warn(errorContents.loginErrors.userInfo)
        
        return
      }
      const AddrResp = await getDefaultWalletAddressApi(infoResp.result.id)
      if (AddrResp.code !== 10000) {
        // toast.warn(errorContents.loginErrors.userInfo)
        
        return
      }
      const okxAccountResp = await getOkxWalletAccountApi()
      const userInfo = {
        ...AddrResp.result,
        ...infoResp.result,
        okxAccount: okxAccountResp.result
      }
      updateUserInfoAction(userInfo)
      updateUserStateAction({
        ...userState,
        loginTime: new Date().getTime()
      })
      // Toast.clear()

    } catch (e) {
      // Toast.clear()
      // toast.warn(errorContents.serverError)
    }
  }

  const tgLogin = async (data: InitData) => {
    // toast loading
    try {
      const resp = await loginJavaApi(data)
      // Toast.clear()
      if (resp.code !== 10000) {
        // toast.warn(resp?.message || "wallet login error")
        return
      }
      const userState = {
        ...resp.result,
        tgId: Number(resp.result.tgId),
        tokenExpired: resp.result.tokenExpiredAt * 1000,
      }
      updateUserStateAction(userState)
      if (
        userInfo.id &&
        Number(userState.userId) !== userInfo.id
      ) {
        updateUserInfoAction({} as UserType)
        tokensReSetActions()
      }
      if (userState.frozen) {
        return
      }
      //new user, not set pin
      if (userState.newUser || !userState.setTradePassword) {
        return
      }
      //new mobile phone
      if (!userState.tgId) {
        
        return
      }
      //change user
      if (userState.tgId !== userState.tgId) {
        
        return
      }

      //go to root /
      fetchUserInfoAction()
      // without email->goto set email
      if (!userState.email) {
        
        return
      }

      // if (!isValidActions) userStore.updateRouteAction('/')
      // userStore.updateAutoLoginAction()
    } catch (e) {
      // Toast.clear()
      // toast.error(errorContents.serverError)
      // console.warn('login error', e)
    }
  }

  /* check tg init data */
  // useEffect(() => {
  //   if (initDataUnsafe && initData) {
  //     updateTgAction(initDataUnsafe, initData)

  //     loginAction()
  //     window.Telegram?.WebApp?.ready()
  //     const id = initDataUnsafe?.user?.id
  //     id && Sentry.setUser({ id })
  //   }
  // }, [initDataUnsafe, initData])

  /* tg data with login*/
  // const infoFetchRefresh = () => {
  //   if (userStore.userInfoRefresh !== 0) getUserInfo()
  // }

  // const loginFetchRefresh = () => {
  //   const flagUnion = window.location.href.includes('/ramp')
  //   if (flagUnion) {
  //     return
  //   }
  //   if (!userStore.tgData.query) {
  //     toast.error('Telegram tomo app init error')
  //     return
  //   }
  //   tgLogin(userStore.tgData.query)
  // }
  
}

export default useInitUser
