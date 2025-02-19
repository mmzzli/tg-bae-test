import { useState, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// import 'assets/styles/pass.css'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import EmailInput from './components/EmailInput'
import EmailConfirm, { EmailConfirmRefType } from './components/EmailConfirm'
import useEmail from '@/hooks/wallet/useEmail'
import { useStore } from '@/store'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

const RecoveryEmail = () => {
  const toast = useToast()
  const location = useLocation()
  const { email: emailParam } = location.state || { email: '' }
  const [step, setStep] = useState<'input' | 'confirm'>(emailParam ? 'confirm' : 'input')
  const [email, setEmail] = useState(emailParam || '')

  const navigate = useNavigate()
  const { verifyBindEmailCode } = useEmail()
  const passcodeRef = useRef<EmailConfirmRefType>()
  const [err, setErr] = useState({ isError: false, errMsg: '' })
  const [loading, setLoading] = useState(false)

  const {
    userState,
    walletUserInfo,
    updateUserInfoAction,
    fetchUserInfoAction,
    updateUserStateAction,
  } = useStore((state) => state)

  const onConfirm = async (code: string) => {
    if (loading) return

    setLoading(true)
    setErr({ isError: false, errMsg: '' })

    try {
      const { success, message } = await verifyBindEmailCode({ email, code: code })
      if (success) {
        updateUserInfoAction({ ...walletUserInfo, email: email })
        updateUserStateAction({
          ...userState,
          email: email,
        })
        fetchUserInfoAction()
        toast({
          render: () => {
            return <CustomToast title={'Successfully.'} type={typeOptions.success} />
          },
          position: 'bottom',
          duration: 2000,
        })
        navigate('/home')
        setLoading(false)
        return
      }

      toast({
        render: () => {
          return <CustomToast title={message} type={typeOptions.error} />
        },
        position: 'bottom',
        duration: 2000,
      })

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
      {/* {step !== 'input' && (
        <BackButton
          onClick={() => {
            if (step == 'input') {
              navigate(-1)
            } else {
              setStep('input')
            }
          }}
        ></BackButton>
      )} */}
      <div className="size-full px-5 flex flex-col justify-between pb-2 pt-1">
        {step == 'input' ? (
          <EmailInput
            onConfirm={() => {
              setStep('confirm')
            }}
            email={email}
            onChange={setEmail}
          />
        ) : (
          <EmailConfirm
            email={email}
            from="normal"
            onConfirm={onConfirm}
            isError={err.isError}
            errMsg={err.errMsg}
            loading={loading}
            ref={passcodeRef as any}
          />
        )}
      </div>
    </>
  )
}

export default RecoveryEmail
