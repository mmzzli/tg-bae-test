import React, { FC, useEffect, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean, HStack } from '@chakra-ui/react'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useGA4EventTrackingReporting } from '@/hooks/useGA4EventTrackingReporting'
import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { useRequest, useSafeState } from 'ahooks'
import { useStore } from '@/store/store'

import { LockIcon, StarsIcon } from '@/assets/icons'
import { FrostedGlassImg } from '@/assets/image'
import { botInvoice, logIn, totalAvailableInvoice, viewPid } from '@/api'
import PurchaseButton from './PurchaseButton'

type FrostedGlassProps = {
  price: number
  post_id: number
  resourcesEve: (post_id: number, url: string, is_pay?: boolean) => void
  maskOnClick?: () => void
  exchangeRate: number
}

const FrostedGlass: FC<FrostedGlassProps> = ({ price, post_id, resourcesEve, maskOnClick, exchangeRate }) => {
  const [isPaid, setIsPaid] = useState<boolean>(false)

  return (
    <>
      {!isPaid && (
        // <div className={'bg-[rgba(0,0,0,0.2)] absolute inset-0 z-[3]'} onClick={maskOnClick}>
        <HStack
            position="absolute"
            bottom="0"
            left="50%"
            // p="5px"
            // gap="4px"
            rounded="full"
            zIndex={4}
            bg="rgba(0, 0, 0, 0.40)"
            cursor="pointer"
          >
          <Box
            position="absolute"
            bottom="7"
            left="50%"
            transform=" translate(-50%, -50%)"
            w="220px"
            zIndex={666}
          >
            <PurchaseButton
              price={price}
              post_id={post_id}
              resourcesEve={resourcesEve}
              setIsPaid={setIsPaid}
              exchangeRate={exchangeRate}
            />
          </Box>

        </HStack>

      )}
    </>
  )
}
export default FrostedGlass
