import { FC } from 'react'
import { Button, Image } from '@chakra-ui/react'
import ResourceList from '@/components/ResourceList/ResourceList'
import { Menu } from '@/components/Menu'
import { useRequest, useSafeState } from 'ahooks'
import { getSingleMedia } from '@/api/list'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AddIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import RecommendList from '@/components/RecommendList/RecommendList'
import { useStore } from '@/store'

const Shares: FC = () => {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')
  const token = useStore((state) => state.token)
  console.log('shares page', ref, token)
  const navigate = useNavigate()
  const [singleList, setSingleList] = useSafeState<Array<FormatterListItem>>()
  useRequest(getSingleMedia, {
    ready: !!ref && !!token,
    defaultParams: [ref ?? ''],
    onSuccess({ post, user }) {
      let media: string[]
      if (!post.id) return setSingleList([])
      if (post.media.includes(',')) {
        media = post.media.split(',')
      } else {
        media = [post.media]
      }
      setSingleList([{ ...post, ...user, media }])
    },
  })

  return (
    <>
      <div className="flex items-center justify-between mt-4 mx-4">
        <div className="font-bold text-xl text-[#E0E2F6]">Share post</div>
        <Button
          size="xl"
          fontSize="14px"
          variant="primary-dark"
          p="9px 12px"
          onClick={() => {
            navigate('/post')
          }}
        >
          <Image src={AddIcon} mr="5px" /> Create
        </Button>
      </div>
      <div className="mb-12">
        <ResourceList resources={singleList ? singleList : []} />
      </div>
      <div className="font-bold text-xl text-[#E0E2F6] mt-4 mx-4">Selected Posts</div>
      <RecommendList className="mb-12" />
      <Menu selectedIndex={-1} />
    </>
  )
}

export default Shares
