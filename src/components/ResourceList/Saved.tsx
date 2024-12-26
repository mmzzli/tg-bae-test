
import { Box, Flex, HStack, IconButton, useBoolean, Text, useToast } from '@chakra-ui/react'
import Lottie from 'lottie-react'
import likeAnimationData from '@/assets/animations/like.json'

import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { followPreview, FormatterListItem } from '@/store/slices/resourceListSlice'
import { useStore } from '@/store'
import { useMemoizedFn, useRequest, useSetState, useDebounceFn } from 'ahooks'
import { favDel, favPost, postLike } from '@/api'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { genShareLinkFn, getTimeStringAutoShort, formatNumber } from '@/utils/utils'


interface ResourceFooterProps {
  data: FormatterListItem
  setResources?: React.Dispatch<React.SetStateAction<FormatterListItem[]>>
  type?: string
  iconClassName?: string
}


const Saved = memo<ResourceFooterProps>(({ data, setResources, type, iconClassName }) => {
  const toast = useToast()
  const likes = useStore((state) => state.like)
  const setLikes = useStore((state) => state.setPatchLike)

  const setSaveds = useStore((state) => state.setPatchSave)
  const saveds = useStore((state) => state.save)



  const saved = useMemo(() => {
    return saveds.find((saved) => saved.id === data.id)?.saveds
  }, [saveds])

  const savedEve = async (data: FormatterListItem) => {
    setSaveds(data)
    favRun(data)
  }
  const { run: favRun } = useDebounceFn(
    async (data: FormatterListItem) => {
      const isSaved = saveds.find((item) => item.id === data.id)?.saveds
      if (isSaved) {
        const res = await favPost(data.id)
        if (res !== 'OK') {
          toast({
            render: () => {
              return (
                <CustomToast
                  title="This content has been deleted by the creator and cannot be accessed."
                  type={typeOptions.error}
                />
              )
            },
            position: 'bottom',
          })
          setSaveds(data)
        }
      } else {
        await favDel(data.id)
      }
      if (type === 'fav' && setResources) {
        setResources((favResources) => favResources.filter((item) => item.id !== data.id))
      }
    },
    { wait: 500 }
  )

  return (

    <div
      className="flex items-center justify-center"
      onClick={() => {
        savedEve(data)
      }}
    >
      {saved ? (
        <i className={`iconfont icon-saved text-[#FFCC5D]`} style={{ fontSize: '22px' }}></i>
      ) : (
        <i
          className={`iconfont icon-bookmark-line text-[#0D0D0D] ${iconClassName}`}
          style={{ fontSize: '22px' }}
        ></i>
      )}
    </div>
  )
})
export default Saved
