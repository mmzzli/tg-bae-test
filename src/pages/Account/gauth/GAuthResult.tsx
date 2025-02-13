import { useEffect, useState, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation, TButton } from '@/components/tmd'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import GAController from '@/controllers/gauth'
import { gauthImgs } from '@/assets'

const GAuthResult = () => {
  const location = useLocation()
  const { totpInfo } = useUserStore()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { isVerifySuccess } = location?.state || {}
  // const isVerifySuccess = true

  const pageInfo = {
    icon: isVerifySuccess ? gauthImgs.gaSuccess : gauthImgs.gaFail,
    desc: isVerifySuccess ? t('gauth.ga_success_desc') : t('gauth.ga_fail_desc'),
    btnText: isVerifySuccess ? t('gauth.ga_success_btn_text') : t('gauth.ga_fail_btn_text')
  }

  const gotoPage = () => {
    if (isVerifySuccess) {
      const redirectUrl = GAController.getRedirectURI({ isDecode: true })
      // @ts-ignore
      navigate((redirectUrl && -3) || -2)
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="h-full flex flex-col bg-bg1 pt-1 px-5 pb-[46px]">
      <div className="flex-1">
        <div className="mt-[90px] mb-3 flex justify-center">
          <img src={pageInfo.icon} className={`h-[110px]`} />
        </div>
        <div className="text-center">
          <span className="text-[20px] font-semibold text-t1">
            {pageInfo.desc}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div>
          <TButton
            className="w-full h-[52px]"
            onClick={gotoPage}
          >
            {pageInfo.btnText}
          </TButton>
        </div>
      </div>
    </div>
  )
}

export default observer(GAuthResult)
