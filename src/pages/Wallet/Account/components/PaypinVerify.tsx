import { useRef, useState } from 'react'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import { errorContents } from '@/config/wallet/const'
import useTradePwd from '@/hooks/wallet/useTradePwd'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'

const PaypinVerify = ({
  onSuccess,
  onFailed,
  titleFlag = true,
}: {
  onSuccess: (mfa: string, pass: string) => void
  onFailed: (err: string) => void
  titleFlag?: boolean
}) => {
  const navigate = useNavigate()
  const { verifyTradePwd } = useTradePwd()
  const updateUserStateAction = useStore((state) => state.updateUserStateAction)
  const userState = useStore((state) => state.userState)

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

    setBtnLoading(true)
    const { validateFlag, failedCnt, mfaToken, prompt } = await verifyTradePwd(pass)
    setBtnLoading(false)
    if (validateFlag) {
      setIsError(false)
      setErrMsg('')
      onSuccess(mfaToken, pass)
      setFailedCnt(0)
      return
    }

    setIsError(true)
    setFailedCnt(failedCnt)
    setErrMsg(prompt)
    payPinRef.current?.handleInit()
    if (failedCnt === 5) {
      updateUserStateAction({
        ...userState,
        frozen: true,
      })
      navigate('/account/freeze', { replace: true })
    }
    onFailed(prompt)
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
