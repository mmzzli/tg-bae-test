import React, { FC, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { useRequest, useSafeState } from 'ahooks'
import { useStore } from '@/store/store'


import { LockIcon } from '@/assets/icons'
import { botInvoice, logIn } from '@/api'

type FrostedGlassProps = {
  price: number
  post_id: number
  resourcesEve: (post_id: number) => void
}

const FrostedGlass: FC<FrostedGlassProps> = ({ price, post_id }) => {
  const userInfo = useStore((state) => state.userInfo)
  const invoiceEve = async () => {
    console.log(price, post_id, userInfo.user_id)
    await botInvoice({
      amount: price,
      memo: String(post_id),
      post_id: String(post_id),
      user_id: String(userInfo.user_id),
    })
  }
  return (
    <>
      <Box
        backdropFilter="blur(60px) brightness(1.1)"
        boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
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
