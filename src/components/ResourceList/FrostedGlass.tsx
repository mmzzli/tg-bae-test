import React, { FC, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean } from '@chakra-ui/react'
import { useTMAUtils } from '@/hooks/useTMAUtils'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { useRequest, useSafeState } from 'ahooks'
import { useStore } from '@/store/store'


import { LockIcon } from '@/assets/icons'
import { botInvoice, logIn, viewPid } from '@/api'

type FrostedGlassProps = {
  price: number
  post_id: number
  resourcesEve: (post_id: number, url:string) => void
}

const FrostedGlass: FC<FrostedGlassProps> = ({ price, post_id, resourcesEve }) => {
  const userInfo = useStore((state) => state.userInfo)
  const { launchParams, shareLink } = useTMAUtils()
  const { initData } = launchParams


  const invoiceEve = async () => {

    try{
      const viewUrl = await viewPid(post_id)
      resourcesEve(post_id,viewUrl)
      return
    } catch (error) {
      const url = await botInvoice({
        amount: price,
        memo: String(post_id),
        post_id: String(post_id),
        user_id: String(initData?.user?.id)
      })
      window.open(url)
    }

    const items = setInterval(async()=>{
      try{
        // const viewUrl = "https://baedev.anyconn.org/2022-01-27_17-32-20_UTC_2.jpg,https://baedev.anyconn.org/2022-01-27_17-32-20_UTC_3.jpg,https://baedev.anyconn.org/2022-01-27_17-32-20_UTC_4.jpg,https://baedev.anyconn.org/2022-01-27_17-32-20_UTC_5.jpg"
        const viewUrl = await viewPid(post_id)
        resourcesEve(post_id,viewUrl)
        clearInterval(items)
      } catch (error) {
        console.log(error,'payment')
      }
    },3000)

  }
  return (
    <>
      <Box
        bg="linear-gradient(135deg, #ccc, #000)"
        color="#333"
        textAlign="center"
        position="absolute"
        top="0px"
        left="0px"
        width="100%"
        height="100%"
        minH="100px"
      >
        <Box position="absolute" top="50%" left="50%" transform=" translate(-50%, -50%)" w="220px">
          <BaseButton
            text={`Unlock Post for ${price}`}
            icon={<Image src={LockIcon} />}
            handler={() => invoiceEve()}
          />
        </Box>
      </Box>
    </>
  )
}
export default FrostedGlass
