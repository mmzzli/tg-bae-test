import React, { FC, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean } from '@chakra-ui/react'
import { useTMAUtils } from '@/hooks/useTMAUtils'

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
      if (window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp
        tgApp.openInvoice(url, (status: string) => {
          console.log(status, 123)
          if (status === 'paid') {
            const items = setInterval(async () => {
              try {
                const viewUrl = await viewPid(post_id)
                resourcesEve(post_id, viewUrl, true)
                clearInterval(items)
                setIsPay(false)
              } catch (error) {
                console.log(error, 'payment')
              }
            }, 3000)
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
        <Box
          position="absolute"
          bottom="7"
          left="50%"
          transform=" translate(-50%, -50%)"
          w="220px"
          zIndex={3}
        >
          {loading ? (
            <BaseButton height="40px" text={`loading ...`} handler={() => console.log(1)} />
          ) : (
            <BaseButton
              height="40px"
              text={`Unlock Post for ${price}`}
              icon={<i className="iconfont icon-lock text-white"></i>}
              iconRight={<i className="iconfont icon-stars text-[#FFC700]"></i>}
              handler={() => invoiceEve()}
            />
          )}
        </Box>
      )}
    </>
  )
}
export default FrostedGlass
