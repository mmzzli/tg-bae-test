import { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation, TIcon, TButton, TPasscodeInput } from '@/components/tmd'
import useManageStore from '@/stores/manageStore/hooks/useManageStore'
import { renderStringWithComponents } from '@/utils/dom'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { shortEmailAddress } from '@/utils/helper'
import GAController from '@/controllers/gauth'
import { gauthImgs } from '@/assets'
import { Toast } from '@/components/tmd'

const GAuthCodeInput = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { totpJourney, setTotpJourney } = useManageStore()
  const [codeStr, setCodeStr] = useState('')
  const [isBtnAble, setBtnAble] = useState(false)
  const [isVerifing, setVerifing] = useState(false)

  useEffect(() => {
    if (!totpJourney) navigate(-1)
  }, [])

  useEffect(() => {
    setBtnAble(codeStr.length === 6)
  }, [codeStr])

  // const gotoConfirm = async () => {
  //   setVerifing(true)
  //   // ...
  //   setVerifing(false)
  // }

  const onCodeInputFill = async (val: string) => {
    if (!totpJourney) return
    const { onConfirm } = totpJourney
    if (typeof onConfirm === 'function') {
      Toast.show({ icon: 'loading', duration: 0 })
      const { routePath, state } = await onConfirm(val) || {}
      Toast.clear()
      if (routePath) {
        setTotpJourney(null)
        // @ts-ignore
        navigate(routePath, { replace: true, state })
      }
    }
  }

  return (
    <div className="h-full flex flex-col bg-bg1 pt-1 px-5 pb-[46px]">
      <div className="flex-1">
        <div className="mt-4 size-[50px] border-[1px] border-l1 rounded-full flex justify-center items-center">
          <img src={gauthImgs.gaLogo} className={`h-[45px]`} />
        </div>
        <div className="text-2xl text-t1 font-semibold h-12 leading-[48px]">
          <span>{t('gauth.gauth_name')}</span>
        </div>
        <div className="text-t3 mb-6">
          <span>{t('gauth.2fa_code_desc')}</span>
        </div>
        <div className="flex justify-center mb-4">
          <TPasscodeInput
            seperated
            length={6}
            style={{ '--cell-gap': '9px' }}
            onFill={onCodeInputFill}
            onChange={(val) => setCodeStr(val)}
          />
        </div>
      </div>
      {/* <div className="mt-4">
        <div>
          <TButton
            className="w-full h-[52px]"
            onClick={gotoConfirm}
            loading={isVerifing}
            disabled={!isBtnAble}
          >
            {t('gauth.2fa_code_btn_text')}
          </TButton>
        </div>
      </div> */}
    </div>
  )
}

export default observer(GAuthCodeInput)
