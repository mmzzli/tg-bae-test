import React, { useRef, forwardRef, useImperativeHandle } from 'react';
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
import ShareModal from './ShareModal'

interface ChildMethods {
  someMethod: (username:string, uid:number) => void;
}

const ShareUser = ({ userInfo }: { userInfo: IUserInfo }) => {
  const childRef = useRef<ChildMethods>(null);
  const { launchParams } = useTMAUtils()

  const handleClick = () => {
    const uid = launchParams.initData?.user?.id ?? 0
    childRef.current?.someMethod(userInfo.username, uid);
  };


  return (
    <>
      <div
        className="flex items-center justify-center w-[36px] h-[36px] rounded-full ml-[12px] bg-[#F8F8F8]"
        onClick={() => {
          handleClick()
        }}
      >
        <Image src={ShareIcon} />
      </div>
      <ShareModal ref={childRef} />

    </>
  )
}
export default ShareUser
