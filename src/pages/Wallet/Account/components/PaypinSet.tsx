import { useMemo, useRef, useState, useEffect } from 'react'
import { errorContents } from '@/config/const'
// import useTradePwd from '@/hooks/useTradePwd'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import { useNavigate } from 'react-router-dom'

const PaypinSet = () => {
  const navigate = useNavigate()
  // const { setTradePwd } = useTradePwd()


  const queryParams = new URLSearchParams(location.search)
  const redirectTo = queryParams.get('redirect') || '/'

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
    try {
      setLoading(true)
      // const result = await setTradePwd(pass)
      // if (result) {
      //   setIsError(false)
      //   finished(pass)
      // } else {
      //   setStep('set')
      //   setOld('')
      //   setIsError(true)
      //   setErrMsg(errorContents.paypinErrors.wrong1)
      //   payPinRef.current?.handleInit()
      // }
    } catch (err) {
      setStep('set')
      setOld('')
      setIsError(true)
      setErrMsg(
        typeof err == 'string' ? err : errorContents.paypinErrors.wrong1
      )
      payPinRef.current?.handleInit()
    }
    setLoading(false)
  }

  const finished = (pass: string) => {



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
    <div className="h-full !px-[20px] pb-[16px] pt-[4px]">
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
          To ensure seamless access across devices, please set up your Pay
          PIN. This will serve as an alternative authentication method for
          both login and transactions, particularly when biometric
          verification is unavailable
        </p>
      </PayPinBase>
    </div>
  )
}

export default PaypinSet
