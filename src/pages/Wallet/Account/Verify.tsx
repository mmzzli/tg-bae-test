import { useNavigate } from 'react-router-dom'
import PaypinVerify from './components/PaypinVerify'
// import Container from '@/components/Container'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import useBiometricManager from '@/hooks/useBiometricManager'
// import toast from '@/components/Toast'
import toast from '@/components/tmd/toast/Toast'
import { useDeviceId } from '@/hooks/useDeviceId'
import userStore from '@/stores/userStore'
import { useMemo, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import useBackup from './hooks/useBackup'
import { Toast } from 'antd-mobile'
import { checkDevice, markDevice } from '@/utils'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { Container } from '@/components/tmd/container/Container'

const VerifyPage = () => {
  const navigate = useNavigate()
  const { authenticate } = useBiometricManager()
  const { generate, multiCreate } = useDeviceId()

  const queryParams = new URLSearchParams(location.search)
  const redirectTo = queryParams.get('redirect') || '/'
  const { user, biometry, userState } = useUserStore()
  const bio = queryParams.get('bio')

  const onFailed = () => {}

  const onVerifySuccess = (mfa: string, pass: string) => {
    if (!biometry.available || bio == 'no') {
      userStore.fetchUserInfoAction()
      return
    }
    authenticate({
      callback: async (success: boolean, token: string) => {
        if (success) {
          Toast.show({
            icon: 'loading',
            content: '',
            duration: 0,
            maskClickable: false,
          })
          try {
            const did = generate()
            await multiCreate(did, `${pass}`)
            userStore.updateBiometryAction({
              ...biometry,
              token_saved: true,
            })
          } catch (err) {
            toast.error(err as string)
          } finally {
            Toast.clear()
          }
        }
        userStore.fetchUserInfoAction()
      },
      failCallback: () => {
        console.log('failcallback...')
        userStore.fetchUserInfoAction()
        return
      },
    })
  }
  // const { setOpen, component } = useBackup({
  //   onSkip: () => {
  //     setOpen(false)
  //   },
  //   afterClose: () => {
  //     navigate(redirectTo, { replace: true })
  //   }
  // })

  useEffect(() => {
    if (userState.loginTime) {
      if (userState.newUser || (!user?.email && !checkDevice(userState.userId))) {
        // setOpen(true)
        navigate('/account/recovery-email', { replace: true })
      } else {
        navigate(redirectTo, { replace: true })
      }
      markDevice(userState.userId)
    }
  }, [userState])

  return (
    <>
      {/* {component} */}

      <Container className="flex flex-col pb-2">
        <PaypinVerify onSuccess={onVerifySuccess} onFailed={onFailed} />
      </Container>
    </>
  )
}

export default observer(VerifyPage)
