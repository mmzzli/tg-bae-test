import { forwardRef, useImperativeHandle, useState } from 'react'
import { Image, useBoolean } from '@chakra-ui/react'
import { DrawSkeletonItem } from '@/components/Skeketon/ChatSkeleton'

import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { LinkIcon, TelegramIcon } from '@/assets/icons'
import { useMemoizedFn, useRequest, useSetState } from 'ahooks'
import useCopy from '@/hooks/useCopy'
import { getLink, getShareInlineMessageId } from '@/api/list'

interface ChildMethods {
  someMethod: (username: string, uid: number) => void
}

const ShareModal = forwardRef<ChildMethods>(({}, ref) => {
  useImperativeHandle(ref, () => ({
    someMethod: (username: string, uid: number) => {
      getShareLink(username, uid)
      setState({ uid })
    },
  }))
  const [state, setState] = useSetState<Record<string, any>>({
    hello: '',
  })
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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

  const { runAsync: getInlineMessageId, loading: getInlineMessageIdLoading } = useRequest(
    getShareInlineMessageId,
    {
      manual: true,
      onSuccess(res) {
        console.log(res)
      },
    }
  )

  const getShareLink = useMemoizedFn(async (title: string, uid: number) => {
    const shareText = encodeURIComponent(title)

    toggle()
    setIsLoading(false)
    const { ref } = await getLinkHandlerAsync({ pid: uid, uid })
    setIsLoading(true)

    const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}`)
    console.log('copyLink', decodeURIComponent(copyLink))

    const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
    // TODO 尝试使用新的api shareMessages
    // savePreparedInlineMessage 使用InlineQueryResultPhoto数据格式 获取包装好的消息实体(PreparedInlineMessage) https://core.telegram.org/bots/api#preparedinlinemessage
    // if (window.Telegram?.WebApp) {
    //   console.warn('######## preparedInlineMessage start ########')
    //   const WebApp = window.Telegram?.WebApp
    //   try {
    //     const response = await axios.post(
    //       'https://api.telegram.org/bot7471427114:AAHQavHhTte8QIoo-0F8MpAkO6yaBW2TfeA/savePreparedInlineMessage',
    //       JSON.stringify({
    //         user_id: current_uid,
    //         allow_user_chats: true,
    //         allow_group_chats: true,
    //         allow_bot_chats: true,

    //         result: {
    //           type: 'photo',
    //           id: generateUUID(),
    //           photo_url:
    //             'https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/29c86574a9f2c05b6df9841b5475a307/thumbnails/thumbnail.jpg?time=1s&height=1080',
    //           thumbnail_url:
    //             'https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/29c86574a9f2c05b6df9841b5475a307/thumbnails/thumbnail.jpg?time=1s&height=400',
    //           show_caption_above_media: true,
    //           caption: `Bae If beauty were a crime, you’d be serving life`,
    //           caption_entities: [
    //             {
    //               type: 'bold',
    //               offset: 0,
    //               length: 49,
    //             },
    //             {
    //               type: 'expandable_blockquote',
    //               offset: 4,
    //               length: 45,
    //             },
    //           ],
    //           reply_markup: {
    //             inline_keyboard: [
    //               [
    //                 {
    //                   text: 'Open the Share',
    //                   url: `tg://resolve?domain=BaeDevBot&appname=BAE&startapp=ref=16775ac1e99f846e80de5a0218ada3cb13ea86936f4871853c80bdc8c997649f`,
    //                 },
    //               ],
    //             ],
    //           },
    //         },
    //       }),
    //       {
    //         headers: {
    //           'Content-Type': 'application/json',
    //         },
    //       }
    //     )
    //     const preparedInlineMessage = response.data
    //     console.warn(
    //       '######## preparedInlineMessage result ########',
    //       preparedInlineMessage.result.id
    //     )
    //     WebApp.shareMessage(preparedInlineMessage.result.id)
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
    // 使用 shareMessages 发送包装好的消息的id
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
  })

  const handShareWithTelegram = useMemoizedFn(async () => {
    const { result } = await getInlineMessageId({ pid: state?.uid, uid: state?.uid })
    console.log('result----->', result)
    if (result.id) {
      if (window.Telegram?.WebApp) {
        const WebApp = window.Telegram?.WebApp
        setTimeout(() => {
          WebApp.shareMessage(result.id)
        }, 100)
      }
      off()
    } else {
      console.warn('######## shareMessages Error ########', result)
    }
  })

  return (
    <>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height="342px"
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
        {isLoading ? (
          <div className="mt-4 w-full">
            <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333]">Share from Bae</h3>
            <div className="text-[15px] text-[#999]">Earn Bae points when you share from Bae</div>
            <div className="mt-12 mb-[18px] mx-4">
              <BaseButton
                text="Share via Telegram"
                height="48px"
                loading={getInlineMessageIdLoading}
                icon={<Image src={TelegramIcon} />}
                handler={() => {
                  // shareLink(links.shareLink ?? '')
                  setTimeout(() => {
                    window.Telegram?.WebApp?.resetShareCallback()
                    handShareWithTelegram()
                  }, 0)
                  // off()
                }}
              />
            </div>

            <div className={'mx-4'}>
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
        ) : (
          <div className="mt-4 w-full">
            <DrawSkeletonItem className="w-full h-[32px] mb-[12px]"></DrawSkeletonItem>
            <DrawSkeletonItem className="w-full h-[32px] mb-[12px]"></DrawSkeletonItem>
            <DrawSkeletonItem className="w-full h-[100px]"></DrawSkeletonItem>
          </div>
        )}
      </BaseModal>
    </>
  )
})

export default ShareModal
