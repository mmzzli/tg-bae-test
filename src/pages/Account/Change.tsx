import { useMemo, useRef, useState } from 'react'
import PayPinBase, { PayPinBaseRefType } from './components/PaypinBase'
import { errorContents } from '@/config/const'
// import useTradePwd from '@/hooks/useTradePwd'
// import { TToast as toast, TContainer, Toast } from '@/components/tmd'
import { useNavigate } from 'react-router-dom'
import { Toast } from 'antd-mobile'

const ChangePage = () => {
  const [isError, setIsError] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const payPinRef = useRef<PayPinBaseRefType>(null)
  const navigate = useNavigate()
  // const { verifyTradePwd } = useTradePwd()

  const from = 'change'
  // const [btnStatus, setBtnStatus] = useState<ButtonStatusType>('normal')
  const [loading, setLoading] = useState(false)
  // const { changeTradePwd } = useTradePwd()
  const [step, setStep] = useState<'origin' | 'confirm'>('origin')
  const [old, setOld] = useState('')
  const [failedCnt, setFailedCnt] = useState(0)

  const title = useMemo(() => {
    return step == 'origin' ? 'Original pay PIN' : 'Confirm pay PIN'
  }, [step])

  const verifyOld = async (pass: string) => {
    if (!pass) {
      setStep('origin')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.wrong1)
      payPinRef.current?.handleInit()
      return
    }
    if (loading) return
    setLoading(true)
    // api check
    Toast.show({
      icon: 'loading',
      duration: 0,
      maskClickable: false,
      maskStyle: {
        '--z-index': '9999'
      }
    })
    try {
      // const { validateFlag, failedCnt, mfaToken, prompt } =
      //   await verifyTradePwd(pass)
      // if (validateFlag) {
      //   setStep('confirm')
      //   setOld(pass)
      //   setIsError(false)
      //   setErrMsg('')
      //   setFailedCnt(0)
      //   payPinRef.current?.handleInit()
      // } else {
      //   setStep('origin')
      //   setOld('')
      //   setIsError(true)
      //   setFailedCnt(failedCnt)
      //   setErrMsg(prompt)
      //   payPinRef.current?.handleInit()
      //   if (failedCnt === 5) {
      //     // userStore.updateUserStateAction({
      //     //   ...userStore.userState,
      //     //   frozen: true
      //     // })
      //     navigate('/account/freeze', { replace: true })
      //   }
      // }
    } catch (err) {
      setStep('origin')
      setOld('')
      setIsError(true)
      setFailedCnt(failedCnt)
      setErrMsg(
        typeof err == 'string' ? err : errorContents.userErrors.payPinFailed
      )
      payPinRef.current?.handleInit()
    } finally {
      setLoading(false)
      Toast.clear()
    }
  }

  const changePwd = async (oldPwd: string, newPwd: string) => {
    if (!oldPwd || !newPwd || oldPwd.length != newPwd.length) {
      setStep('origin')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.wrong1)
      payPinRef.current?.handleInit()
      return
    }

    try {
      // setLoading(true)
      // await changeTradePwd(oldPwd, newPwd)
      // setIsError(false)
      // setErrMsg('')
      // toast.success('change pin success')
      // setTimeout(() => {
      //   navigate(-1)
      // }, 500)
    } catch (err) {
      // toast.error(err as string)
      setStep('origin')
      setOld('')
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.wrong1)
      payPinRef.current?.handleInit()
    }
    setLoading(false)
  }

  const onPaypinConfirm = async (pass: string) => {
    if (loading) return

    if (step == 'origin') {
      await verifyOld(pass)
    } else {
      await changePwd(old, pass)
    }
  }

  const onChange = (value: string) => {
    try {
      value && setIsError(false)
    } catch (e) {
      //
    }
  }

  return (
    <div className="flex size-full flex-1 flex-col items-center justify-between !pt-1 pb-4 transition-all">
      <PayPinBase
        from={from}
        onConfirm={onPaypinConfirm}
        isError={isError}
        errMsg={errMsg}
        ref={payPinRef}
        title={title}
        failedCnt={failedCnt}
        autoFill={step == 'origin'}
        onChange={onChange}
        loading={loading}
      />
    </div>
  )
}

export default ChangePage
