import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TPasscodeInput, TIcon, TPasscodeInputRef } from '@/components/tmd'
// import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import '../index.css'
import clsx from 'clsx'
import useEmail from '@/hooks/wallet/useEmail'
import useCountdown from '@/hooks/wallet/useCountdown'
import BaseButton from '@/components/BaseButton/BaseButton'
// import commonStore from '@/stores/commonStore'

export type EmailFromType = 'normal' | 'relogin' | 'verify' | 'reset'
export type EmailConfirmRefType = {
  onReset: () => void
}
type EmailPropsType = {
  email: string
  onConfirm: (code: string) => void
  from: EmailFromType
  initSend?: boolean
  isError?: boolean
  loading?: boolean
  errMsg?: string
  onChange?: (value: string) => void
}

const EmailConfirm = forwardRef<EmailConfirmRefType, EmailPropsType>(
  (
    {
      email,
      onConfirm,
      from = 'normal',
      initSend = true,
      isError = false,
      loading = false,
      errMsg = '',
      onChange,
    },
    ref
  ) => {
    // const { t } = useTranslation()
    // const webapp = useWebApp()
    const { sendBindEmailCode, sendTradePwdEmail } = useEmail()

    const { timeLeft: seconds, startCountdown, resetCountdown } = useCountdown()

    const codeLen = 4
    const [pass, setPass] = useState<string>('')
    const passcodeRef = useRef<TPasscodeInputRef | null>(null)
    const [sending, setSending] = useState(false)

    const [err, setErr] = useState({ isError, errMsg })

    useImperativeHandle(ref, () => ({
      onReset: () => {
        passcodeRef.current?.reset()
      },
    }))

    const handleResend = async () => {
      if (sending) return

      setSending(true)
      setErr({ isError: false, errMsg: '' })

      try {
        if (from === 'normal') {
          const { success, message } = await sendBindEmailCode(email)
          if (!success) {
            setErr({ isError: true, errMsg: message })
            return
          }
        } else if (from === 'verify' || from === 'reset') {
          const { success, message } = await sendTradePwdEmail()
          if (!success) {
            setErr({ isError: true, errMsg: message })
            return
          }
        }
        resetCountdown()
      } catch (e) {
        //
      } finally {
        setSending(false)
      }
    }

    const handleCodeChange = (val: string) => {
      const emailCode = val.slice(0, codeLen)
      setPass(emailCode)
      setErr({ isError: false, errMsg: '' })
      if (emailCode.length === codeLen) onConfirm(emailCode)
      onChange && onChange(emailCode)
    }

    const handleConfirm = () => {
      if (pass.length === codeLen) onConfirm(pass)
    }

    // const handleVerify = async (value: string) => {
    //   onConfirm(value.slice(0, codeLen))
    // }

    // const handleFocus = () => {
    //   if (
    //     window.visualViewport?.height &&
    //     window.visualViewport?.height - 300 <= 200
    //   ) {
    //     setKeyboardOpen(true)
    //   }
    // }

    useEffect(() => {
      startCountdown()
      if (initSend && seconds == 0) {
        handleResend()
      }
    }, [])

    useEffect(() => {
      setErr({ isError, errMsg })
    }, [isError, errMsg])

    // useEffect(() => {
    //   const blurWindow = () => {
    //     passcodeRef.current?.blur()
    //   }
    //   const keyDelFunc = (event: any) => {
    //     if (event.key === 'Backspace' || event.key === 'Delete') {
    //       const target = event.target
    //       const isEditable =
    //         target.tagName === 'INPUT' ||
    //         target.tagName === 'TEXTAREA' ||
    //         target.isContentEditable
    //       if (!isEditable) {
    //         event.preventDefault()
    //       }
    //     }
    //   }
    //   document.addEventListener('keydown', keyDelFunc)
    //   window.addEventListener('blur', blurWindow)
    //   return () => {
    //     window.removeEventListener('blur', blurWindow)
    //     document.removeEventListener('keydown', keyDelFunc)
    //   }
    // }, [])

    return (
      <div
        className={clsx('flex h-full w-full flex-col items-center justify-between transition-all')}
        ref={ref as any}
      >
        <div className="w-full">
          <div className="flex h-[48px] items-center py-[4px]">
            <h3 className="text-h3 font-semibold text-t1">
              {/* {t('tg_wallet_login.enter_email')} */}
              Email Code
            </h3>
          </div>
          <p className="text-sm text-t3">
            {/* {t('tg_wallet_login.enter_email_tip')} */}
            Enter your verification code
          </p>
          <div className="mt-[24px] flex w-full justify-center">
            <TPasscodeInput
              seperated
              length={codeLen}
              value={pass}
              onChange={handleCodeChange}
              ref={passcodeRef}
              style={{ '--cell-gap': '32px' }}
            />
          </div>

          {err.isError && (
            <div className="ml-[23px] mt-[8px] flex items-center justify-between text-xs">
              <p className="text-red2">{err.errMsg}</p>
            </div>
          )}
          <div className="mt-[16px] flex w-full items-center justify-center">
            {seconds > 0 ? (
              <button disabled className="text-t3">
                Resend {seconds} s
              </button>
            ) : (
              <button className="flex items-center gap-2 text-red" onClick={handleResend}>
                <TIcon
                  name="tg_wallet_refresh"
                  fontSize="14"
                  className={clsx('text-sm', sending ? 'requestCy' : '')}
                />
                <span className="text-xs">Request</span>
              </button>
            )}
          </div>
        </div>

        <div className="w-full">
          <BaseButton
            disabled={pass.length < codeLen}
            handler={handleConfirm}
            loading={loading}
            text="Confirm"
            height="52px"
          />
        </div>
      </div>
    )
  }
)

EmailConfirm.displayName = 'EmailConfirm'

export default EmailConfirm
