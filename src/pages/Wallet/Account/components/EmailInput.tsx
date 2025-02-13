import useCountdown from '@/hooks/useCountdown'
import useEmail from '@/hooks/useEmail'
import { TButton, TInput, Toast } from '@/components/tmd'
import { useEffect, useRef, useState } from 'react'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import classNames from 'classnames'
import commonStore from '@/stores/commonStore'

const EmailStep1 = ({
  email,
  onChange,
  onConfirm,
  countdownKey
}: {
  email: string
  onChange: (val: string) => void
  onConfirm: () => void
  countdownKey: string
}) => {
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  const disabled = !pattern.test(email)
  const webapp = useWebApp()
  const { sendBindEmailCode } = useEmail()
  const { startCountdown, resetCountdown, diffTimeLeft } =
    useCountdown(countdownKey)
  const [err, setErr] = useState('')
  const sendingRef = useRef(false)
  const [loading, setLoading] = useState(false)

  const handleEmail = (val: string) => {
    onChange(val)
    setErr('')
  }
  const handleConfirm = async () => {
    if (loading) return
    let result: boolean | number = true
    setLoading(true)
    if (!diffTimeLeft(countdownKey)) {
      if (sendingRef.current) {
        setLoading(false)
        return
      }
      sendingRef.current = true
      try {
        result = await sendBindEmailCode(email)
        resetCountdown()
      } catch (error: any) {
        result = false
        setErr(error)
      }
      sendingRef.current = false
    }
    setLoading(false)
    if (!result) return
    onConfirm()
  }

  useEffect(() => {
    startCountdown()
  }, [])

  return (
    <div
      className={classNames(
        'flex h-full w-full flex-col items-center justify-between transition-all'
      )}
    >
      <div className="flex w-full flex-1 flex-col">
        <div className="flex h-[48px] items-center py-[4px]">
          <h3 className="text-h3 font-semibold text-t1">Add recovery email</h3>
        </div>
        <p className="text-sm text-t3">
          If you lose access to your account, you can easily restore it by
          logging into the TOMO App with your email address to complete the
          recovery process.
        </p>

        <div className="mt-[24px]">
          <TInput
            enterKeyHint={'done'}
            value={email}
            clearable
            placeholder="Enter your email"
            onChange={handleEmail}
          />
          {err && <p className="mt-2 text-xs text-red2">{err}</p>}
        </div>
      </div>
      <div className="w-full flex-none">
        <TButton
          size="large"
          loading={loading}
          onClick={handleConfirm}
          block
          disabled={disabled}
        >
          Confirm
        </TButton>
      </div>
    </div>
  )
}

export default EmailStep1
