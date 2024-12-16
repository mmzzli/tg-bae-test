import { Box, Flex, IconButton, useBoolean } from '@chakra-ui/react'
import Lottie from 'lottie-react'
import likeAnimationData from '@/assets/animations/like.json'
import React, { useMemo, useState } from 'react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useMemoizedFn, useRequest, useSetState } from 'ahooks'
import { genShareLinkFn } from '@/utils/utils'
import { getLink, getShareInlineMessageId } from '@/api/list'
import { ShareModal } from '@/components/ResourceList/ResourceList'
import { useStore } from '@/store'
import { favDel, favPost, postLike } from '@/api'

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

  const likes = useStore((state) => state.like)
  const saveds = useStore((state) => state.save)

  const liked = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.liked || false
  }, [likes])

  const likeNum = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.like || 0
  }, [likes])

  const saved = useMemo(() => {
    return saveds.find((saved) => saved.id === data.id)?.saveds
  }, [saveds])

  const setLikes = useStore((state) => state.setPatchLike)
  const setSaveds = useStore((state) => state.setPatchSave)

  const linkEve = async (data: FormatterListItem) => {
    const curLiked = likes.find((item) => item.id === data.id)?.liked
    await postLike({
      act_type: !curLiked ? 1 : 2,
      post_id: data.id,
    })
    setLikes(data)
  }

  const savedEve = async (data: FormatterListItem) => {
    const isSaved = saveds.find((item) => item.id === data.id)?.saveds
    if (!isSaved) {
      await favPost(data.id)
    } else {
      await favDel(data.id)
    }
    setSaveds(data)
  }

  return (
    <div className="px-4 flex items-center justify-between box-border h-10">
      <Flex gap="4" alignItems="center">
        <Flex
          as={'button'}
          alignItems={'center'}
          onClick={() => {
            linkEve(data)
          }}
        >
          {liked ? (
            <Lottie
              animationData={likeAnimationData}
              loop={false}
              style={{
                width: '24px',
              }}
            ></Lottie>
          ) : (
            <i className="iconfont icon-like text-white text-6" style={{ fontSize: '24px' }}></i>
          )}
          <span className="pl-1 text-sm text-white">{likeNum}</span>
        </Flex>
        <Box
          className="w-6 h-6 flex items-center justify-center"
          onClick={() => {
            savedEve(data)
          }}
        >
          {saved ? (
            <i className="iconfont icon-saved text-[#FFCC5D]" style={{ fontSize: '24px' }}></i>
          ) : (
            <i className="iconfont icon-bookmark-line text-white" style={{ fontSize: '24px' }}></i>
          )}
        </Box>
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
