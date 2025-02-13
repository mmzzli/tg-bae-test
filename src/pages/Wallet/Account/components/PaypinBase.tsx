import { Space } from 'antd-mobile'
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { TIcon } from '@/components/tmd'
import { useNavigate } from 'react-router-dom'
// import { tgDeskPlatform } from '@/utils/telegram'
import clsx from 'clsx'
import BaseButton from '@/components/BaseButton/BaseButton'
import { TPasscodeInput, TPasscodeInputRef } from '@/components/tmd'

export type PayPinType = 'reset' | 'confirm' | 'set' | 'change'
export type PayPinBaseRefType = {
  handleInit: () => void
}
export type PayPinBaseType = {
  from: PayPinType
  isError?: boolean
  errMsg?: string
  onConfirm: (last: string, first?: string) => void
  loading?: boolean
  failedCnt?: number
  autoFill?: boolean
  title: string
  children?: React.ReactNode
  onChange?: (value: string) => void
  plain?: boolean
  plainTip?: boolean
  plainChange?: () => void
}

const PaypinBase = forwardRef<PayPinBaseRefType, PayPinBaseType>(
  (
    {
      from,
      isError = false,
      errMsg,
      onConfirm,
      loading = false,
      failedCnt = 0,
      autoFill = false,
      title,
      children,
      onChange,
      plain = false,
      plainTip = false,
      plainChange,
    },
    ref
  ) => {
    // const webapp = useWebApp()
    // const { t } = useTranslation()
    // const { userState } = useUserStore()
    const navigate = useNavigate()
    const [pass, setPass] = useState('')
    const passcodeRef = useRef<TPasscodeInputRef | any>()
    const length = 6

    useImperativeHandle(ref, () => ({
      handleInit: () => {
        handleInit()
      },
    }))

    const handleConfirm = () => {
      onConfirm(pass.slice(0, length))
    }

    useEffect(() => {
      if (pass.length == length) handleConfirm()
    }, [pass])

    const handleInit = () => {
      setPass('')
      passcodeRef.current?.reset()
    }

    useEffect(() => {
      passcodeRef.current?.focus()
    }, [])

    const handlePWChange = (val: string) => {
      setPass(val)
      onChange && onChange(val)
    }

    const forgetClick = () => {
      // if (userState?.email) {
      navigate('/login/forget', {
        replace: true,
      })
      // } else {
      //   navigate('/login/backup')
      // }
    }

    const calculatedGap = useMemo(() => {
      if (window.innerWidth < 375) {
        return '4px'
      }
      return '9.4px'
    }, [window.innerWidth])

    return (
      <div
        className={clsx('flex w-full flex-1 flex-col items-center justify-between transition-all')}
        // style={{
        //   paddingBottom: sp
        // }}
        ref={ref as any}
      >
        <div className="w-full flex-1 overflow-y-auto">
          {title && (
            <div className="flex h-[48px] items-center py-[4px]">
              <h3 className="text-h3 font-semibold text-t1">{title}</h3>
            </div>
          )}
          {children}
          <Space direction="vertical" block className="items-center py-[24px]">
            <TPasscodeInput
              seperated
              value={pass}
              plain={plain}
              ref={passcodeRef}
              // onFocus={() => {
              //   !tgDeskPlatform.includes(webapp?.platform) &&
              //     setKeyboardOpen(true)
              // }}
              // onBlur={() => setKeyboardOpen(false)}
              onChange={handlePWChange}
              style={{
                '--cell-gap': calculatedGap,
              }}
            />

            {isError && (
              <div className="flex items-center justify-between text-xs">
                <p className="text-red2">{errMsg}</p>
              </div>
            )}
            {(from == 'confirm' || from == 'change') && failedCnt >= 2 && (
              <div onClick={forgetClick}>
                <p className="flex items-center justify-center pt-[16px] text-t3">
                  {/* {t('tg_wallet_login.enter_pin_err_forget')} */}
                  Forgot
                </p>
              </div>
            )}
            {plainTip && (
              <div className="mt-[16px] flex w-full items-center justify-center">
                <button className="flex items-center gap-1 text-t3" onClick={plainChange}>
                  <TIcon
                    name={plain ? 'tg_wallet_signal' : 'tg_wallet_implicit'}
                    fontSize="14"
                    className="text-sm"
                  />
                  <span className="text-xs">{plain ? 'Hide' : 'Show'} Password</span>
                </button>
              </div>
            )}
          </Space>
        </div>

        {!autoFill && (
          <div className="w-full flex-none pt-2">
            <BaseButton
              disabled={pass.length < length}
              handler={handleConfirm}
              loading={loading}
              text="Confirm"
              height="52px"
            />
          </div>
        )}
      </div>
    )
  }
)
PaypinBase.displayName = 'PayPinBase'

export default PaypinBase
