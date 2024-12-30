import { Box, Flex, IconButton, useBoolean } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useMemoizedFn, useRequest, useSetState } from 'ahooks'
import { genShareLinkFn } from '@/utils/utils'
import { getLink, getShareInlineMessageId } from '@/api/list'
import { ShareModal } from '@/components/ResourceList/ResourceList'

import Links from '@/components/ResourceList/Links'
import Saved from '@/components/ResourceList/Saved'

interface ResourceFooterProps {
  data: FormatterListItem
}
const ResourceFooter: React.FC<ResourceFooterProps> = ({ data }) => {
  const [links, setLinks] = useSetState<{ shareLink: string; copyLink: string }>({
    shareLink: '',
    copyLink: '',
  })
  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
      setIsLoading(true)
    },
  })
  const [isLoading, setIsLoading] = useState(false)

  const [currentShareData, setCurrentShareData] = useState<{ pid: number; uid: number } | null>(
    null
  )

  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)

  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    const { shareLink, copyLink } = await genShareLinkFn(title, pid, uid, getLinkHandlerAsync)
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
  })


  return (
    <div className="px-4 flex items-center justify-between box-border h-10">
      <Flex gap="4" alignItems="center">
        <Links data={data} className={`text-[#fff]`} iconClassName={`text-[#fff]`}/>
        <Saved data={data} iconClassName={`text-[#fff]`}/>
      </Flex>
      <IconButton
        onClick={() => {
          getShareLink(data.title, data.id, data.uid)
          setCurrentShareData({
            pid: data.id,
            uid: data.uid,
          })
          toggle()
        }}
        aria-label="share"
        background={'transparent'}
        colorScheme={'transparent'}
        h={6}
        w={6}
        icon={<i className="iconfont icon-Frame-2 text-white]" style={{ fontSize: '24px' }}></i>}
      />
      <ShareModal
        isBaseModalOpen={isBaseModalOpen}
        off={off}
        currentShareData={currentShareData}
        links={links}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      ></ShareModal>
    </div>
  )
}

export default ResourceFooter
