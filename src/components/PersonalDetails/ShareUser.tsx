import { Image, useBoolean } from '@chakra-ui/react'

import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { ShareIcon, LinkIcon, TelegramIcon } from '@/assets/icons'
import { useMemoizedFn, useRequest, useSetState } from 'ahooks'
import { IUserInfo } from '@/types'
import useCopy from '@/hooks/useCopy'
import { getLink } from '@/api/list'

const ShareUser = ({ userInfo }: { userInfo: IUserInfo }) => {
  const { shareLink, launchParams } = useTMAUtils()
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [links, setLinks] = useSetState<{ shareLink: string; copyLink: string }>({
    shareLink: '',
    copyLink: '',
  })
  const { copy } = useCopy()
  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  const getShareLink = useMemoizedFn(async (title: string) => {
    const shareText = encodeURIComponent(title)
    const uid = launchParams.initData?.user?.id ?? 0

    const { ref } = await getLinkHandlerAsync({ pid: uid, uid })

    const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}?startapp`)
    console.log('copyLink', decodeURIComponent(copyLink))

    const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
  })
  return (
    <>
      <div
        className="flex items-center justify-center w-[36px] h-[36px] rounded-full ml-[10px] bg-[#CFCBFF20]"
        onClick={() => {
          getShareLink(userInfo.username)
          toggle()
        }}
      >
        <Image src={ShareIcon} />
      </div>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="340px"
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="mt-4 w-full">
          <h3 className="font-bold text-2xl mb-[10px]">Share from Bae</h3>
          <div className="text-[15px] text-[#808080]">Earn $Bae every time you share from Bae</div>
          <div className="mt-12 mb-[18px] mx-4">
            <BaseButton
              text="Share via Telegram"
              icon={<Image src={TelegramIcon} />}
              handler={() => {
                shareLink(links.shareLink ?? '')
                off()
              }}
            />
          </div>
          <div className="mx-4">
            <BaseButton
              text="Copy link"
              icon={<Image src={LinkIcon} />}
              handler={() => {
                copy(links.copyLink)
                off()
              }}
            />
          </div>
        </div>
      </BaseModal>
    </>
  )
}
export default ShareUser
