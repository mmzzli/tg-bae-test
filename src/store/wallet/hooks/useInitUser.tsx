import { useEffect, useCallback, useState } from 'react'
import { InitData, useInitData, useWebApp } from '@vkruglikov/react-telegram-web-app'
import {
  getDefaultWalletAddressApi,
  getOkxWalletAccountApi,
  getTelegramUserInfoApi,
  loginJavaApi,
} from '@/api/wallet'
import { useStore } from '@/store'
import { shallow } from 'zustand/shallow'
import { UserState, UserType } from '../type'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useNavigate } from 'react-router-dom'
import { errorContents } from '@/config/wallet/const'

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
  // const [initDataUnsafe, initData] = useInitData()
  // const webApp = useWebApp()
  // const { checkIsNewAccount, removeBioKey, getDeviceIdFromToken } =
  //   useDeviceId()
  // const { isValidActions } = useApp()
  const toast = useToast()
  const navigate = useNavigate()

  const {
    updateUserStateAction,
    updateUserInfoAction,
    tokensReSetActions,
    fetchUserInfoAction,
    updateTgAction,
    walletUserInfo: userInfo,
    refreshTokenStore
  } = useStore(
    (state) => ({
      updateUserStateAction: state.updateUserStateAction,
      updateUserInfoAction: state.updateUserInfoAction,
      fetchUserInfoAction: state.fetchUserInfoAction,
      updateTgAction: state.updateTgAction,
      tokensReSetActions: state.tokensReSetActions,
      walletUserInfo: state.walletUserInfo,
      userState: state.userState,
      refreshTokenStore: state.refreshTokenStore
    }),
    shallow
  )

  const getUserInfo = async () => {
    // toast
    try {
      const { code, result, message } = await getTelegramUserInfoApi()
      if (code !== 10000 || !result?.id) {
        toast({
          render: () => {
            return (
              <CustomToast title={errorContents.loginErrors.userInfo} type={typeOptions.success} />
            )
          },
          position: 'bottom',
          duration: 2000,
        })
        return
      }
      const AddrResp = await getDefaultWalletAddressApi(result.id)
      if (AddrResp.code !== 10000) {
        // toast.warn(errorContents.loginErrors.userInfo)

        return
      }
      const okxAccountResp = await getOkxWalletAccountApi()
      const userInfo = {
        ...AddrResp.result,
        ...result,
        okxAccount: okxAccountResp.result,
      }
      updateUserInfoAction(userInfo)
      updateUserStateAction({
        ...useStore.getState().userState,
        loginTime: new Date().getTime(),
      })
      refreshTokenStore()

      // without email->goto set email
      setTimeout(() => {
        if (!useStore.getState().walletUserInfo.email) {
          navigate('/account/recovery')
          return
        }
      }, 100);
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
        toast({
          render: () => {
            return (
              <CustomToast title={resp?.message || 'wallet login error'} type={typeOptions.error} />
            )
          },
          position: 'bottom',
          duration: 2000,
        })
        return
      }
      const userState = {
        ...resp.result,
        tgId: Number(resp.result?.tgId),
        tokenExpiredAt: (resp.result?.tokenExpiredAt || 0) * 1000,
      }
      updateUserStateAction(userState as UserState)

      if (userInfo.id && Number(userState.userId) !== userInfo.id) {
        updateUserInfoAction({} as UserType)
        tokensReSetActions()
      }
      if (userState.frozen) {
        // to freeze
        navigate('/account/freeze')
        return
      }
      //new user, not set pin
      if (userState.newUser || !userState.setTradePassword) {
        navigate('/account/set')
        return
      }
      //new mobile phone
      // if (!userState.tgId) {
      //   navigate('/account/verify');
      //   return
      // }
      //change user
      if (userState.tgId !== userState.tgId) {
        updateUserInfoAction({} as UserType)
        navigate('/account/verify')
        return
      }

      //go to root /
      fetchUserInfoAction()

      // userStore.updateAutoLoginAction()
    } catch (e) {
      toast({
        render: () => {
          return <CustomToast title={errorContents.serverError} type={typeOptions.error} />
        },
        position: 'bottom',
        duration: 2000,
      })

      // console.warn('login error', e)
    }
  }

  return { tgLogin, getUserInfo }
}

export default useInitUser
