import { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useTranslation, TIcon, TPasscodeInput } from '@/components/tmd'
import { renderStringWithComponents } from '@/utils/dom'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { shortEmailAddress } from '@/utils/helper'
import GAController from '@/controllers/gauth'
import { Toast } from '@/components/tmd'

const storageKey = '__ga_email_next_send_time__'
const loading = -1

const GAuthEmail = () => {
  const { user } = useUserStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [reSendTime, setReSendTime] = useState(loading)
  const timer = useRef(0)
  const codeInputRef = useRef<HTMLElement>(null)

  useEffect(() => {
    initEmailCodeSend()
    return () => {
      clearTimeout(timer.current)
    }
  }, [])

  const initEmailCodeSend = () => {
    const waitingTime = getWaitingTime()
    if (!waitingTime) {
      emailCodeSend()
    } else {
      countDownStart()
    }
  }

  const emailCodeSend = async () => {
    setReSendTime(loading)
    const isSended = await GAController.sendGAuthEmailCode()
    if (isSended) {
      codeInputFocused()
      countDownStart()
    } else {
      // 无需等待
      setReSendTime(0)
    }
  }

  const codeInputFocused = () => {
    if (codeInputRef?.current) {
      codeInputRef.current.focus()
    }
  }

  const countDownStart = () => {
    setNextSendTime()
    const loopDown = () => {
      // @ts-ignore
      timer.current = setTimeout(() => {
        clearTimeout(timer.current)
        const reSendTime = getWaitingTime()
        if (reSendTime >= 0) setReSendTime(reSendTime)
        if (reSendTime > 0) loopDown()
      }, 1000)
    }
    loopDown()
  }

  const setNextSendTime = () => {
    const waitingTime = getWaitingTime()
    if (waitingTime) return
    // 单位：秒
    const nextTime = Math.floor(Date.now() / 1000) + 60
    localStorage.setItem(storageKey, nextTime.toString())
  }

  const getWaitingTime = () => {
    const reTime = localStorage.getItem(storageKey) || null
    if (!reTime) return 0
    const now = Math.floor(Date.now() / 1000)
    const wTime = +reTime - now
    if (wTime <= 0) {
      localStorage.removeItem(storageKey)
      return 0
    }
    return wTime
  }

  const renderReSendContent = () => {
    if (reSendTime === loading) {
      return (
        <TIcon
          name="tg_wallet_load"
          className="tm-animation-spin leading-[unset] text-t3"
        />
      )
    }
    return reSendTime ? (
      <span className="text-t3">Resend {reSendTime} s</span>
    ) : (
      <span className="text-[#2b6bff]" onClick={emailCodeSend}>Resend</span>
    )
  }

  const renderEmailDesc = () => {
    return renderStringWithComponents(t('gauth.ga_email_desc'), {
      '$1': shortEmailAddress(user?.email || '') || '*',
    })
  }

  const onEmailFill = async (value: string) => {
    Toast.show({ icon: 'loading', duration: 0 })
    const isVerifyPass = await GAController.verifyGAuthEmailCode(value)
    Toast.clear()
    if (isVerifyPass) {
      navigate(
        GAController.combinePath('/account/gauth/binding'),
        { replace: true }
      )
    }
  }

  return (
    <div className="h-full flex flex-col bg-bg1 pt-1 px-5">
      <div className="text-2xl text-t1 font-semibold h-12 leading-[48px]">
        <span>{t('gauth.ga_email_title')}</span>
      </div>
      <div className="text-t3 mb-6">
        <span>{renderEmailDesc()}</span>
      </div>
      <div className="flex justify-center mb-4">
        <TPasscodeInput
          seperated
          length={4}
          style={{ '--cell-gap': '30px' }}
          onFill={onEmailFill}
          // @ts-ignore
          ref={codeInputRef}
        />
      </div>      
      <div className="flex justify-center items-center">
        {renderReSendContent()}
      </div>
    </div>
  )
}

export default observer(GAuthEmail)
