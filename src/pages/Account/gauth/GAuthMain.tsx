import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import GAController from '@/controllers/gauth'
import { useTranslation } from '@/components/tmd'
import { gauthImgs } from '@/assets'
import { TIcon } from '@/components/tmd'
import { TButton } from '@/components/tmd'
import Menu from '@/components/Menu'
import useLoginInfo from '@/hooks/useLoginInfo'

const GAuthMain = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { totpInfo } = useUserStore()
  const { user } = useLoginInfo()

  const gotoEmail = () => {
    navigate(GAController.combinePath('/account/gauth/email'))
  }

  // for test debugger
  const isNotProd = import.meta.env.VITE_NODE_ENV !== 'production'

  return (
    <div className="flex h-full flex-col bg-bg1 px-[20px] pb-[46px] pt-[60px]">
      <div className="flex-1">
        <div className="mb-6 flex justify-center">
          <div className="flex size-[90px] items-center justify-center rounded-full border border-l1">
            <img src={gauthImgs.gaLogo} className={`h-[78px]`} />
          </div>
        </div>
        <div className="mb-2 text-center text-2xl font-semibold text-t1">
          <span>{t('gauth.gauth_name')}</span>
        </div>
        <div className="text-center text-[14px] text-t2">
          <span>{t('gauth.main_desc')}</span>
        </div>
        {totpInfo?.isBindTotp && (
          <div>
            {/* for test debugger */}
            {isNotProd && user?.id === 37757 && (
              <Menu
                className="mt-12 rounded-lg border border-#ebebf4"
                items={[
                  {
                    icon: (
                      <TIcon
                        name="tg_wallet_ga-change"
                        fontSize="20"
                        className="text-t1"
                      />
                    ),
                    title: <div className="mt-px">{t('gauth.ga_change')}</div>,
                    onClick: gotoEmail
                  }
                ]}
              />
            )}
            <div className="mt-12 text-center text-[14px] text-t2">
              <span>{t('gauth.ga_binded_desc')}</span>
            </div>
          </div>
        )}
      </div>
      {!totpInfo?.isBindTotp && (
        <div>
          <TButton className="h-[52px] w-full" onClick={gotoEmail}>
            {t('gauth.bound_btn_text')}
          </TButton>
        </div>
      )}
    </div>
  )
}

export default observer(GAuthMain)
