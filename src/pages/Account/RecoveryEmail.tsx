import { useState, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import 'assets/styles/pass.css'
import useEmail from 'hooks/useEmail'
import { md5 } from 'utils/helper'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import EmailInput from './components/EmailInput'
import EmailConfirm, { EmailConfirmRefType } from './components/EmailConfirm'
import userStore from '@/stores/userStore'
import { TContainer, Toast, TToast as toast } from '@/components/tmd'
import useApp from '@/hooks/oauth/useApp'

const RecoveryEmail = () => {
  const stepRef = useRef(1)
  const location = useLocation()
  const { email: emailParam } = location.state || { email: '' }
  const [step, setStep] = useState(emailParam ? 2 : 1)
  const [email, setEmail] = useState(emailParam || '')
  const countdownKey = `be${md5(email)}`
  const navigate = useNavigate()
  const { verifyBindEmailCode } = useEmail()
  const passcodeRef = useRef<EmailConfirmRefType>()
  const [err, setErr] = useState({ isError: false, errMsg: '' })
  const [loading, setLoading] = useState(false)
  const { isValidActions } = useApp()

  const onConfirm = async (code: string) => {
    if (loading) return

    setLoading(true)
    setErr({ isError: false, errMsg: '' })
    let result: boolean

    try {
      result = await verifyBindEmailCode({ email, code: code })
      if (result) {
        userStore.updateUserInfoAction({ ...userStore.userInfo, email: email })
        userStore.updateUserStateAction({
          ...userStore.userState,
          email: email
        })
        userStore.fetchUserInfoAction()
        toast.success('Success')
        isValidActions ? navigate('/oauth') : navigate('/')
        setLoading(false)
        return
      }
      passcodeRef.current?.onReset()
    } catch (e: any) {
      setErr({ isError: true, errMsg: e })
      passcodeRef.current?.onReset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {step !== 1 && (
        <BackButton
          onClick={() => {
            if (step == 1) {
              navigate(-1)
            } else {
              setStep(1)
            }
          }}
        ></BackButton>
      )}
      <TContainer className="flex flex-col justify-between pb-2 pt-1">
        {step == 1 ? (
          <EmailInput
            onConfirm={() => {
              stepRef.current = 2
              setStep(2)
            }}
            email={email}
            onChange={setEmail}
            countdownKey={countdownKey}
          />
        ) : (
          <EmailConfirm
            email={email}
            countdownKey={countdownKey}
            from="normal"
            onConfirm={onConfirm}
            isError={err.isError}
            errMsg={err.errMsg}
            loading={loading}
            ref={passcodeRef as any}
          />
        )}
      </TContainer>
    </>
  )
}

export default RecoveryEmail
