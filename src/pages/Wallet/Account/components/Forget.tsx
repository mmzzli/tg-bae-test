import { useMemo, useRef, useState } from 'react'
import { errorContents } from '@/config/wallet/const'
import { useNavigate } from 'react-router-dom'
import PayPinBase, { PayPinBaseRefType } from './PaypinBase'
import EmailConfirm from './EmailConfirm'
import useTradePwd from '@/hooks/wallet/useTradePwd'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useStore } from '@/store'

const Forget = () => {
  const navigate = useNavigate()
  const { resetTradePwd } = useTradePwd()
  const userState = useStore((state) => state.userState)

  const toast = useToast()

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

    setBtnLoading(true)
    const { success, message } = await resetTradePwd(mailCode, pass)
    if (success) {
      setIsError(false)
      setErrMsg('')
      toast({
        render: () => {
          return <CustomToast title={'Successfully.'} type={typeOptions.success} />
        },
        position: 'bottom',
        duration: 2000,
      })
      setTimeout(() => {
        navigate(-1)
      }, 1000)
      return
    }

    setStep('mail')
    setOld('')
    setIsError(true)
    setErrMsg(message)
    payPinRef.current?.handleInit()

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
    <div className="size-full flex bg-bg1 px-[20px] pb-[16px] pt-[4px]">
      {step == 'mail' ? (
        <EmailConfirm
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
      ) : (
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
      )}
    </div>
  )
}

export default Forget
