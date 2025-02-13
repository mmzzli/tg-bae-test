import { useMemo, useRef, useState } from 'react'
// import Container from '@/components/Container'
import { errorContents } from '@/config/wallet/const'
import { md5 } from '@/utils/helper'
import useTradePwd from '@/hooks/useTradePwd'
// import toast from '@/components/Toast'
// import toast from '@/components/tmd/toast/Toast'
import { useNavigate } from 'react-router-dom'
import { SafeArea } from 'antd-mobile'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import EmailConfirm from './EmailConfirm'
// import useUserStore from '@/stores/userStore/hooks/useUserStore'

const Forget = () => {
  const navigate = useNavigate()
  const { resetTradePwd } = useTradePwd()
  // const { userState } = useUserStore()

  const from = 'reset'
  const payPinRef = useRef<PayPinBaseRefType>(null)
  const [step, setStep] = useState<'mail' | 'set' | 'confirm'>('mail')
  const [mailCode, setMailCode] = useState('')
  const [btnLoading, setBtnLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [old, setOld] = useState('')

  const title = useMemo(() => {
    return step == 'set' ? 'Set a Pay PIn' : 'Confirm The Pay PIN'
  }, [step])

  const countdownKey = useMemo(() => {
    return `be${md5(userState?.email || '')}`
  }, [userState?.email])

  const onEmailConfirm = (code: string) => {
    if (code) {
      setMailCode(code)
      setStep('set')
    }
  }

  const verifyFirst = (pass: string) => {
    if (!pass) {
      setStep('set')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.wrong1)
      payPinRef.current?.handleInit()
    } else {
      setStep('confirm')
      setOld(pass)
      setIsError(false)
      setErrMsg('')
      payPinRef.current?.handleInit()
    }
  }

  const verifyAndReset = async (pass: string) => {
    if (btnLoading) return

    if (!pass || pass != old) {
      setStep('set')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.NotMatch)
      payPinRef.current?.handleInit()
      return
    }

    try {
      setBtnLoading(true)
      await resetTradePwd(mailCode, pass)
      setIsError(false)
      setErrMsg('')
      // toast.success('set pin success')
      setTimeout(() => {
        navigate(-1)
      }, 1000)
    } catch (err) {
      // toast.error(err as string)
      setStep('mail')
      setOld('')
      setIsError(true)
      setErrMsg(err as string)
      payPinRef.current?.handleInit()
    }
    setBtnLoading(false)
  }

  const onPaypinConfirm = async (pass: string) => {
    if (step == 'set') {
      verifyFirst(pass)
    } else if (step == 'confirm') {
      await verifyAndReset(pass)
    }
  }

  const onChange = (value: string) => {
    value && setIsError(false)
  }

  return (
    <div className="h-full bg-bg1 px-[20px] pb-[16px] pt-[4px]">
      {step == 'mail' && (
        <>
          <EmailConfirm
            countdownKey={countdownKey}
            onConfirm={onEmailConfirm}
            email={userState?.email || ''}
            initSend={true}
            from={from}
            isError={isError}
            errMsg={errMsg}
            onChange={() => {
              setIsError(false)
              setErrMsg('')
            }}
          />
          <SafeArea position="bottom" />
        </>
      )}
      {(step == 'set' || step == 'confirm') && (
        <>
          <PayPinBase
            from={from}
            onConfirm={onPaypinConfirm}
            isError={isError}
            errMsg={errMsg}
            ref={payPinRef}
            loading={btnLoading}
            title={title}
            autoFill={step == 'set'}
            onChange={onChange}
          />
          {/* <SafeArea position="bottom" /> */}
        </>
      )}
    </div>
  )
}

export default Forget
