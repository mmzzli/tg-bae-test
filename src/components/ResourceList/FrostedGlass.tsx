import React, { FC, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean } from '@chakra-ui/react'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useGA4EventTrackingReporting } from '@/hooks/useGA4EventTrackingReporting'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { useRequest, useSafeState } from 'ahooks'
import { useStore } from '@/store/store'

import { LockIcon, StarsIcon } from '@/assets/icons'
import { FrostedGlassImg } from '@/assets/image'
import { botInvoice, logIn, viewPid } from '@/api'

type FrostedGlassProps = {
  price: number
  post_id: number
  resourcesEve: (post_id: number, url: string, is_pay?: boolean) => void
}

const FrostedGlass: FC<FrostedGlassProps> = ({ price, post_id, resourcesEve }) => {
  const userInfo = useStore((state) => state.userInfo)
  const { launchParams, openLink } = useTMAUtils()
  const { initData } = launchParams
  const [loading, setLoading] = useState<boolean>(false)
  const [isPay, setIsPay] = useState<boolean>(true)
  const { trackPurchase } = useGA4EventTrackingReporting()

  const invoiceEve = async () => {
    setLoading(true)

    try {
      const viewUrl = await viewPid(post_id)
      resourcesEve(post_id, viewUrl, true)
      return
    } catch (error) {
      const url = await botInvoice({
        amount: price,
        memo: String(post_id),
        post_id: String(post_id),
        user_id: String(initData?.user?.id),
      })

      let retryCount = 0;
      const MAX_RETRIES = 10;

      const items = setInterval(async () => {
        try {
          retryCount++;
          const viewUrl = await viewPid(post_id)
          resourcesEve(post_id, viewUrl, true)
          clearInterval(items)
          setIsPay(false)
        } catch (error) {
          console.log(error, 'payment')
          if (retryCount >= MAX_RETRIES) {
            clearInterval(items)
            setLoading(false)
          }
        }
      }, 3000)
      if (window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp
        tgApp.openInvoice(url, (status: string) => {
          console.log(status, 123)
          if (status === 'paid') {
            const timestamp = Date.now()

            trackPurchase({
              transaction_id: `${initData?.user?.id}_${post_id}_${timestamp}`,
              value: 1,
              user_id: String(initData?.user?.id),
              items: [{
                item_id: String(post_id),
                name: String(post_id),
                price: price,
              }]
            })
          } else {
            setLoading(false)
          }
        })
      } else {
        openLink(url)
      }
    }
  }
  return (
    <>
      {isPay && (
        <div className={'bg-[rgba(0,0,0,0.2)] absolute inset-0 z-[3]'}>
          <Box
            position="absolute"
            bottom="7"
            left="50%"
            transform=" translate(-50%, -50%)"
            w="220px"
            zIndex={3}
          >
            {loading ? (
              <BaseButton
                text=""
                handler={()=>console.log(1)}
                loading={true}
                height="40px"
              />
            ) : (
              <BaseButton
                height="40px"
                text={`Unlock post for ${price}`}
                icon={<i className="iconfont icon-lock text-white"></i>}
                iconRight={<i className="iconfont icon-stars text-[#FFC700]"></i>}
                handler={() => invoiceEve()}
              />
            )}
          </Box>
        </div>
      )}
    </>
  )
}
export default FrostedGlass
