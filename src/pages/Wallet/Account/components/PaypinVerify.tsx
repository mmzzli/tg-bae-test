import { useRef, useState } from 'react'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import { errorContents } from '@/config/wallet/const'
// import useTradePwd from '@/hooks/useTradePwd'
// import userStore from '@/stores/userStore'
// import { useNavigate } from 'react-router-dom'

const PaypinVerify = ({
  onSuccess,
  onFailed,
  titleFlag = true,
}: {
  onSuccess: (mfa: string, pass: string) => void
  onFailed: (err: string) => void
  titleFlag?: boolean
}) => {
  // const navigate = useNavigate()
  // const { verifyTradePwd } = useTradePwd()

  const [isError, setIsError] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const payPinRef = useRef<PayPinBaseRefType | any>()
  const [btnLoading, setBtnLoading] = useState(false)
  const [failedCnt, setFailedCnt] = useState(0)

  const onPaypinConfirm = async (pass: string) => {
    if (!pass) {
      setIsError(true)
      setErrMsg(errorContents.paypinErrors.wrong1)
      payPinRef.current?.handleInit()
      return
    }

    if (btnLoading) return
    try {
      setBtnLoading(true)
      onSuccess('mfaTokenmfaTokenmfaToken', '')
      // const { validateFlag, failedCnt, mfaToken, prompt } = await verifyTradePwd(pass)
      // setBtnLoading(false)
      // if (validateFlag) {
      //   setIsError(false)
      //   setErrMsg('')
      //   onSuccess(mfaToken, pass)
      //   setFailedCnt(0)
      // } else {
      //   setIsError(true)
      //   setFailedCnt(failedCnt)
      //   setErrMsg(prompt)
      //   payPinRef.current?.handleInit()
      //   if (failedCnt === 5) {
      //     // userStore.updateUserStateAction({
      //     //   ...userStore.userState,
      //     //   frozen: true
      //     // })
      //     // navigate('/login', { replace: true })
      //   }
      //   onFailed(prompt)
      // }
    } catch (err) {
      setBtnLoading(false)
      setIsError(true)
      setErrMsg(errorContents.serverError)
      payPinRef.current?.handleInit()
      onFailed(errorContents.serverError)
    }
  }

  const onChange = (value: string) => {
    value && setIsError(false)
  }
  return (
    <PayPinBase
      from={'confirm'}
      onConfirm={onPaypinConfirm}
      isError={isError}
      errMsg={errMsg}
      ref={payPinRef}
      loading={btnLoading}
      failedCnt={failedCnt}
      title={titleFlag ? 'Enter wallet PIN' : ''}
      onChange={onChange}
    />
  )
}

export default PaypinVerify
