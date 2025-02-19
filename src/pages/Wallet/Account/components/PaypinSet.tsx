import { useMemo, useRef, useState, useEffect } from 'react'
import { errorContents } from '@/config/wallet/const'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import { useNavigate } from 'react-router-dom'
import useTradePwd from '@/hooks/wallet/useTradePwd'

const PaypinSet = () => {
  const navigate = useNavigate()
  const { setTradePwd } = useTradePwd()

  const payPinRef = useRef<PayPinBaseRefType>(null)
  const [loading, setLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [step, setStep] = useState<'set' | 'confirm'>('set')
  const [old, setOld] = useState('')
  const [failedCnt, setFailedCnt] = useState(0)
  const [plain, setPlain] = useState(false)
  const title = useMemo(() => {
    return step == 'set' ? 'Set Pay PIN' : 'Confirm the Pay PIN'
  }, [step])

  const verifyFirst = async (pass: string) => {
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
      setFailedCnt(0)
      payPinRef.current?.handleInit()
    }
  }

  const setPaypin = async (pass: string) => {
    if (loading) return

    if (!pass || pass != old) {
      setStep('set')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.NotMatch)
      payPinRef.current?.handleInit()
      return
    }

    setLoading(true)
    const { success, message } = await setTradePwd(pass)
    setLoading(false)
    if (success) {
      setIsError(false)
      finished(pass)
      return
    }

    setStep('set')
    setOld('')
    setIsError(true)
    setErrMsg(message)
    payPinRef.current?.handleInit()
  }

  const finished = (pass: string) => {
    navigate('/account/recovery', { replace: true })
  }

  const onConfirm = async (pass: string) => {
    if (!pass) {
      return
    }
    if (step == 'set') {
      verifyFirst(pass)
    } else {
      await setPaypin(pass)
    }
  }

  const onChange = (value: string) => {
    value && setIsError(false)
  }

  return (
    <div className="h-full flex px-[20px] pb-[16px] pt-[4px]">
      <PayPinBase
        from="set"
        title={title}
        onConfirm={onConfirm}
        isError={isError}
        errMsg={errMsg}
        ref={payPinRef}
        autoFill={step == 'set'}
        failedCnt={failedCnt}
        onChange={onChange}
        plain={plain}
        plainTip={true}
        plainChange={() => setPlain(!plain)}
        loading={loading}
      >
        <p className="mt-[4px] text-sm text-t3">
          To ensure seamless access across devices, please set up your Pay PIN. This will serve as
          an alternative authentication method for both login and transactions, particularly when
          biometric verification is unavailable
        </p>
      </PayPinBase>
    </div>
  )
}

export default PaypinSet
