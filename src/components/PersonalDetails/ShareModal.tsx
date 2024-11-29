import React, { forwardRef, useImperativeHandle } from 'react'
import { Image, useBoolean } from '@chakra-ui/react'

import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { ShareIcon, LinkIcon, TelegramIcon } from '@/assets/icons'
import { useMemoizedFn, useRequest, useSetState } from 'ahooks'
import { IUserInfo } from '@/types'
import useCopy from '@/hooks/useCopy'
import { getLink } from '@/api/list'
import useMobile from '@/hooks/useMobile'

interface ChildMethods {
  someMethod: (username: string, uid: number) => void
}

const ShareModal = forwardRef<ChildMethods>(({}, ref) => {
  useImperativeHandle(ref, () => ({
    someMethod: (username: string, uid: number) => {
      getShareLink(username, uid)
      toggle()
    },
  }))
  const { shareLink } = useTMAUtils()
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const isMobile = useMobile()
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

  const getShareLink = useMemoizedFn(async (title: string, uid: number) => {
    const shareText = encodeURIComponent(title)

    const { ref } = await getLinkHandlerAsync({ pid: uid, uid })

    const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}`)
    console.log('copyLink', decodeURIComponent(copyLink))

    const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
  })

  return (
    <>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height={isMobile ? '342px' : '300px'}
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
          <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333]">Share from Bae</h3>
          <div className="text-[15px] text-[#999]">Earn $Bae every time you share from Bae</div>
          {isMobile && (
            <div className="mt-12 mb-[18px] mx-4">
              <BaseButton
                text="Share via Telegram"
                height="48px"
                icon={<Image src={TelegramIcon} />}
                handler={() => {
                  shareLink(links.shareLink ?? '')
                  off()
                }}
              />
            </div>
          )}

          <div className={isMobile ? 'mx-4' : 'mx-4 mt-[50px]'}>
            <BaseButton
              text="Copy link"
              height="48px"
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
})

export default ShareModal
