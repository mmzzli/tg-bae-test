import { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useTranslation, TIcon, TButton, TPasscodeInput, Toast } from '@/components/tmd'
import { renderStringWithComponents } from '@/utils/dom'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import userStore from '@/stores/userStore'
import { shortEmailAddress } from '@/utils/helper'
import GAController from '@/controllers/gauth'
import { gauthImgs } from '@/assets'

const GAuthCodeVerify = () => {
  const { totpInfo } = useUserStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [codeStr, setCodeStr] = useState('')
  const [isBtnAble, setBtnAble] = useState(false)
  const [isVerifing, setVerifing] = useState(false)

  useEffect(() => {
    setBtnAble(codeStr.length === 6)
  }, [codeStr])

  const verifyConfirm = async () => {
    setVerifing(true)
    Toast.show({ icon: 'loading', duration: 0 })
    const isVerifySuccess = await GAController.verifyTotpCode({
      code: codeStr,
      id: encodeURIComponent(totpInfo?.id || ''),
    })
    if (isVerifySuccess) {
      const bindInfo = await GAController.getBindTotpInfo()
      bindInfo && userStore.updateUserTotp(bindInfo)
    }
    setVerifing(false)
    Toast.clear()
    navigate(GAController.combinePath('/account/gauth/result'), {
      replace: true,
      state: {
        isVerifySuccess,
      },
    })
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
            onChange={(val) => setCodeStr(val)}
            onFill={verifyConfirm}
          />
        </div>      
      </div>
      <div className="mt-4">
        <div>
          {/* <TButton
            className="w-full h-[52px]"
            onClick={verifyConfirm}
            loading={isVerifing}
            disabled={!isBtnAble}
          >
            {t('gauth.2fa_code_btn_text')}
          </TButton> */}
        </div>
      </div>
    </div>
  )
}

export default observer(GAuthCodeVerify)
