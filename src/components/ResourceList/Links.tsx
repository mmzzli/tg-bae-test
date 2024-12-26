
import { useToast } from '@chakra-ui/react'
import Lottie from 'lottie-react'
import likeAnimationData from '@/assets/animations/like.json'

import { memo, useMemo } from 'react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { useStore } from '@/store'
import { useDebounceFn } from 'ahooks'
import { postLike } from '@/api'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { formatNumber } from '@/utils/utils'


interface ResourceFooterProps {
  data: FormatterListItem,
  className?: string
  iconClassName?: string
}


const Links = memo<ResourceFooterProps>(({ data, className, iconClassName }) => {
  const toast = useToast()
  const likes = useStore((state) => state.like)
  const setLikes = useStore((state) => state.setPatchLike)

  const { run: linkRun } = useDebounceFn(
    async (data: FormatterListItem) => {
      const curLiked = likes.find((item) => item.id === data.id)?.liked
      const res = await postLike({
        act_type: curLiked ? 1 : 2,
        post_id: data.id,
      })
      if (!res?.post_id) {
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
        setLikes(data)
      }
    },
    { wait: 500 }
  )

  const linkEve = async (data: FormatterListItem) => {
    setLikes(data)
    linkRun(data)
  }
  const liked = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.liked || false
  }, [likes])

  const likeNum = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.like || 0
  }, [likes])

  return (
    <div
      className="flex h-6 items-center"
      onClick={() => {
        linkEve(data)
      }}
    >
      {liked ? (
        <Lottie
          animationData={likeAnimationData}
          loop={false}
          style={{
            width: '22px',
          }}
        ></Lottie>
      ) : (
        <i className={`iconfont icon-like text-[#0D0D0D] ${iconClassName}`} style={{ fontSize: '22px' }}></i>
      )}
      <span className={`pl-1 text-sm font-medium text-[##0D0D0D] mb-[1px] ${className}`}>{formatNumber(likeNum)}</span>
    </div>
  )
})
export default Links
