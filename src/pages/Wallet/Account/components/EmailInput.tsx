import { useEffect, useRef, useState } from 'react'
import useEmail from '@/hooks/wallet/useEmail'
import useCountdown from '@/hooks/wallet/useCountdown'
import classNames from 'clsx'
import { TInput } from '@/components/tmd'
import BaseButton from '@/components/BaseButton/BaseButton'

const pattern =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const EmailStep1 = ({
  email,
  onChange,
  onConfirm,
}: {
  email: string
  onChange: (val: string) => void
  onConfirm: () => void
}) => {
  const disabled = !pattern.test(email)
  const { sendBindEmailCode } = useEmail()
  const { startCountdown, resetCountdown, diffTimeLeft, timeLeft } = useCountdown()
  const [err, setErr] = useState('')

  const [loading, setLoading] = useState(false)

  const handleEmail = (val: string) => {
    onChange(val)
    setErr('')
  }
  const handleConfirm = async () => {
    if (loading || timeLeft > 0) return

    setLoading(true)
    const { success, message } = await sendBindEmailCode(email)
    setLoading(false)
    if (!success) {
      setErr(message)
      return
    }

    resetCountdown()
    onConfirm()
  }

  useEffect(() => {
    startCountdown()
  }, [])

  return (
    <div
      className={classNames('flex size-full flex-col items-center justify-between transition-all')}
    >
      <div className="flex w-full flex-1 flex-col">
        <div className="flex h-[48px] items-center py-[4px]">
          <h3 className="text-h3 font-semibold text-t1">Add recovery email</h3>
        </div>
        <p className="text-sm text-t3">
          If you lose access to your account, you can easily restore it by logging into the TOMO App
          with your email address to complete the recovery process.
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
        <BaseButton
          loading={loading}
          text={'Confirm' + `${timeLeft > 0 ? '(' + timeLeft + ')' : ''}`}
          handler={handleConfirm}
          height="52px"
          disabled={disabled || timeLeft > 0}
        />
      </div>
    </div>
  )
}

export default EmailStep1
