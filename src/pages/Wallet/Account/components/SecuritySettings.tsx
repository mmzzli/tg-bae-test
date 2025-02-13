import { useState } from 'react'
import Menu from '@/components/Menu'
import { TContainer, TIcon } from '@/components/tmd'
// import SecurityItem from '@/pages/walletPage/components/SecurityItem'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { shortEmailAddress } from '@/utils/helper'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GAController from '@/controllers/gauth'
import userStore from '@/stores/userStore'
import { useEffect } from 'react'

export default function SecuritySettings() {
  const navigate = useNavigate()
  const { user, biometry, userState, totpInfo } = useUserStore()
  const [isTotpLoading, setTotpLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    updateTotpInfo()
  }, [])

  const updateTotpInfo = async () => {
    const data = await GAController.getBindTotpInfo()
    userStore.updateUserTotp(data)
    setTotpLoading(false)
  }

  const handlePaypin = () => {
    if (biometry.token_saved) return
    navigate('/account/bio')
  }

  return (
    <TContainer className="bg-bg4 pt-[10px] font-normal">
      <div className="text-xl font-semibold text-t1">
        {t('tg_wallet_account_2fa_setting.2fa_title')}
      </div>
      <div className={'mt-[6px] text-xs text-t3'}>
        {t('tg_wallet_account_2fa_setting.2fa_subtitle')}
      </div>

      <Menu
        className="mt-6"
        items={[
          {
            icon: (
              <TIcon
                name="tg_wallet_biometric"
                fontSize="20"
                className="text-t1"
              />
            ),
            title: t('tg_wallet_account_2fa_setting.2fa_item1'),
            extra: biometry.token_saved ? (
              <TIcon
                name="tg_wallet_finalize-facetiousness"
                fontSize="16"
                className="text-green"
              />
            ) : (
              <TIcon
                name="tg_wallet_present-facetiousness"
                fontSize="16"
                className="text-orange"
              />
            ),
            onClick: handlePaypin,
            disabled: !biometry.available
          },
          {
            icon: (
              <TIcon
                name="tg_wallet_pin-number"
                fontSize="20"
                className="text-t1"
              />
            ),
            title: t('tg_wallet_account_2fa_setting.2fa_item2'),
            extra: userState.setTradePassword ? (
              <TIcon
                name="tg_wallet_finalize-facetiousness"
                fontSize="16"
                className="text-green"
              />
            ) : (
              <TIcon
                name="tg_wallet_present-facetiousness"
                fontSize="16"
                className="text-orange"
              />
            ),
            onClick: () => navigate('/account/change')
          },
          // todo...change email with api.
          {
            icon: (
              <TIcon name="tg_wallet_email" fontSize="20" className="text-t1" />
            ),
            className: classNames({ '!h-[74px]': user.email }),
            title: (
              <>
                <div className="text-base">
                  {t('tg_wallet_account_2fa_setting.2fa_item3')}
                </div>
                {user.email && (
                  <div className="text-sm font-normal text-t4">
                    {shortEmailAddress(user.email || '')}
                  </div>
                )}
              </>
            ),
            extra: user.email ? (
              <TIcon
                name="tg_wallet_finalize-facetiousness"
                fontSize="16"
                className="text-green"
              />
            ) : (
              <TIcon
                name="tg_wallet_present-facetiousness"
                fontSize="16"
                className="text-orange"
              />
            ),
            onClick: () =>
              navigate(
                user?.email ? '/account/email' : '/account/recovery-email'
              )
          },
          {
            icon: (
              <TIcon name="tg_wallet_gauth" fontSize="20" className="text-t1" />
            ),
            title: (
              <div className="text-base">
                {t('gauth.gauth_name')}
              </div>
            ),
            extra: totpInfo?.isBindTotp ? (
              <TIcon
                name="tg_wallet_finalize-facetiousness"
                fontSize="16"
                className="text-green"
              />
            ) : (
              <TIcon
                name="tg_wallet_present-facetiousness"
                fontSize="16"
                className="text-orange"
              />
            ),
            onClick: () => navigate('/account/gauth/main'),
            disabled: isTotpLoading,
          }
        ]}
      />
    </TContainer>
  )
}
