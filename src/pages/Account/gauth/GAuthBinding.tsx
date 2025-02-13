import { useEffect, useState, Fragment } from 'react'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'
import { useTranslation, TCopy, TToast } from '@/components/tmd'
import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { usePurePopup } from '@/hooks/useProgressPopup'
import { TIcon, TButton } from '@/components/tmd'
import GAController from '@/controllers/gauth'
import { isWebInTg } from '@/utils'
import QRCode from 'qrcode'

const GAuthBinding = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { totpInfo } = useUserStore()
  const [secret, setSecret] = useState('')
  const [imgUrl, setImgUrl] = useState('')

  useEffect(() => {
    initSecretString()
    initQrCode()
  }, [totpInfo])

  const initSecretString = () => {
    if (!totpInfo?.url) return
    const secret = new URL(totpInfo.url)?.searchParams?.get('secret') || ''
    setSecret(secret)
  }

  const initQrCode = async () => {
    if (!totpInfo?.url) return
    const urlWithName = urlHandler(totpInfo?.url)
    const imgUrlBase64 = await QRCode.toDataURL(urlWithName, { margin: 1 })
    setImgUrl(imgUrlBase64)
  }

  const urlHandler = (urlStr: string) => {
    const name = 'Tomo'
    const splitKey = 'Cubist:'
    const arrStrs = urlStr.split(splitKey)
    return (arrStrs[0] || '') + splitKey + name + (arrStrs[1] || '')
  }

  const onContinueClick = () => {
    setConfirmOpen(true)
  }

  const gotoVerify = () => {
    navigate(GAController.combinePath('/account/gauth/verify'))
  }

  const closeConfirm = () => {
    setConfirmOpen(false)
  }

  const gotoDownloadApp = () => {
    const galink = GAController.getGoogleAuthenticatorLink()
    if (isWebInTg()) {
      window.Telegram.WebApp.openLink(galink)
    } else {
      window.open(galink, '_blank')
    }
  }

  const formatSecretString = (str: string) => {
    if (str.length <= 20) return str
    return `${str.slice(0, 10)}...${str.slice(-10)}`
  }

  const { setOpen: setConfirmOpen, component: ComfirmComponent } =
    usePurePopup({
      content: <ComfirmPopup onPassClick={gotoVerify} onCancelClick={closeConfirm} />,
      enableMaskClick: true,
      classNames: 'bg-bg1',
    })

  return (
    <Fragment>
      {ComfirmComponent}
      <div className="h-full flex flex-col bg-bg1 pt-1 px-5 pb-[46px]">
        <div className="flex-1">
          <div className="text-2xl text-t1 font-semibold h-12 leading-[48px] mb-8">
            <span>{t('gauth.gauth_name')}</span>
          </div>
          <div className="text-sm mb-2">
            <span className="text-t1 font-medium">{t('gauth.binding_key_1')}</span>
            <span className="text-t3">{t('gauth.binding_val_1')}</span>
          </div>
          <div className="text-sm mb-8">
            <span className="text-t1 font-medium">{t('gauth.binding_key_2')}</span>
            <span className="text-[#2B6BFF] underline" onClick={gotoDownloadApp}>
              {t('gauth.binding_val_2')}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-t1 font-medium">{t('gauth.binding_key_3')}</span>
            <span className="text-t3">{t('gauth.binding_val_3')}</span>
          </div>
          <div className="mt-3 mb-4 flex justify-center">
            <div className="w-[172px] h-[172px] border-[1px] border-l1 rounded-[4px] flex justify-center items-center">
              {imgUrl ? (
                <img src={imgUrl} alt="qrcode" />
              ) : (
                <TIcon
                  name="tg_wallet_load"
                  fontSize="20"
                  className="tm-animation-spin leading-[unset] text-t3"
                />
              )}
            </div>
          </div>
          <div className="bg-bg3 text-t1 px-4 py-3 text-[16px] font-medium flex justify-between items-center">
            <span className="flex-1 text-t1">{formatSecretString(secret)}</span>
            <div>
              <TCopy
                text={secret}
                className="!size-full text-t1"
                onCopy={() => TToast.success('Copied to clipboard successfully')}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="py-3 pl-[14px] pr-[10px] rounded-lg border-[1px] border-#ebebf4 mb-3">
            <div className="flex items-center">
              <TIcon
                name="tg_wallet_present-facetiousness"
                fontSize="16"
                className="mr-2 text-[#FF9142]"
              />
              <span className="text-[14px] font-medium text-t1">
                {t('gauth.binding_tip_title')}
              </span>
            </div>
            <div className="flex mt-1 pr-[10px] pl-[24px] text-t2">
              <span className="text-[12px]">{t('gauth.binding_tip_content')}</span>
            </div>
          </div>
          <div>
            <TButton
              className="w-full h-[52px]"
              onClick={onContinueClick}
            >
              {t('gauth.binding_btn_text')}
            </TButton>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

interface IComfirmPopup {
  onPassClick: () => void
  onCancelClick: () => void
}

const ComfirmPopup = observer(({ onPassClick, onCancelClick }: IComfirmPopup) => {
  const { t } = useTranslation()
  return (
    <div className="pt-1 pb-[26px] w-full font-['Switzer'] flex flex-col">
      <div className="flex-1">
        <div className="text-[20px] font-semibold mb-3 text-t1">
          <span>{t('gauth.binding_confirm_title')}</span>
        </div>
        <div className="text-[14px] font-medium mb-5 text-t1">
          <span>{t('gauth.binding_confirm_desc_1')}</span>
        </div>
        <div className="text-[14px] mb-6 text-t2">
          <span>{t('gauth.binding_confirm_desc_2')}</span>
        </div>
      </div>
      <div>
        <div className="mb-3">
          <TButton
            className="w-full h-[52px]"
            onClick={onPassClick}
          >
            {t('gauth.binding_confirm_btn_1')}
          </TButton>
        </div>
        <div className="mt-3">
          <TButton
            className="w-full h-[52px]"
            onClick={onCancelClick}
            theme="ghost"
          >
            {t('gauth.binding_confirm_btn_2')}
          </TButton>
        </div>
      </div>
    </div>
  )
})

export default observer(GAuthBinding)
