import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PostMetadata, WrappedMessage } from '../types'
import PostMsgSkeleton from '@/components/Skeketon/PostMsgSkeleton'
import { getSingleMedia } from '@/api/list'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '@/components/Image/Image'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { Swiper } from 'antd-mobile'
import { formatImage, formatTime } from '@/utils/utils'
import { useStore } from '@/store'
import { ListItem } from '@/types'
import { useNavigate } from 'react-router-dom'

const POST_TYPE_IMAGE = 1
const processText = (text: string) => {
  const trimmedText = text.replace(/\n/g, ' ').trim()
  const replacedText = trimmedText.replace(
    /<span style="color: rgb\(0, 0, 0\);">(.*?)<\/span>/g,
    '$1'
  )
  const parts = replacedText.split(/(@\w+)/)
  let processedText = ''

  parts.forEach((part) => {
    if (part.startsWith('@')) {
      processedText += `<span style="color: #6761FF; cursor: pointer;">${part}</span>`
    } else {
      processedText += part
    }
  })

  return processedText
}
const PostCard: React.FC<{ message: WrappedMessage & { metadata: PostMetadata } }> = ({
  message,
}) => {
  const navigate = useNavigate()

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<FormatterListItem[]>([])
  const [shareData, setShareData] = useState<ListItem[]>([])
  const postRef = useRef('')
  const { setSharedPostList } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
  }))
  const { getCurrentUid } = useTMAUtils()

  const getPost = useCallback(
    async (url: string) => {
      const parsedUrl = new URL(url)

      const pathSegments = parsedUrl.pathname.split('/')
      const lastParam = pathSegments[pathSegments.length - 1]
      postRef.current = lastParam

      try {
        const data = await getSingleMedia(lastParam)
        console.log(data)
        if (data.media.length > 0) {
          setShareData(data.media)
          const { user, post } = data.media[0]
          const formattedPost = {
            ...user,
            ...post,
            media:
              post.type === 1 && typeof post.media === 'string'
                ? post.media.split(',')
                : post.media.split(',').length > 1
                  ? [post.media.split(',').find((item: string) => item.endsWith('.m3u8')) || '']
                  : [post.media],
          }
          setPost([formattedPost])

          updateMessageByID({
            ...message,
            metadata: {
              postData: data.media[0],
              formattedData: formattedPost,
            },
          })

          setTimeout(() => {
            setLoading(false)
          }, 300)
        } else {
          setError(true)
        }
      } catch (err) {
        setError(true)
      }
    },
    [message]
  )

  const getMessageWindow = (channelId: string) => {
    return useStore.getState().messageWindowList.find((msg) => msg.channel.channelID === channelId)
  }

  const updateMessageByID = useCallback((message: WrappedMessage) => {
    const messageWindow = getMessageWindow(String(message.channelID))
    if (messageWindow) {
      useStore.getState().updateMessageWindowListItem({
        ...messageWindow,
        messages: messageWindow.messages.map((msg) => (msg.id === message.id ? message : msg)),
      })
    }
  }, [])

  useEffect(() => {
    if (!message.metadata && message.url) {
      getPost(message.url)
    }
    if (message.metadata && message.url) {
      setLoading(false)
      setShareData([message.metadata?.postData])
      setPost([message?.metadata?.formattedData])
      const parsedUrl = new URL(message.url)

      const pathSegments = parsedUrl.pathname.split('/')
      const lastParam = pathSegments[pathSegments.length - 1]
      postRef.current = lastParam
    }
  }, [])
  if (loading)
    return (
      <div className="w-[255px] rounded-lg bg-[#ffffff]">
        <PostMsgSkeleton />
      </div>
    )
  return (
    <div className="cursor-pointer w-[255px] rounded-lg bg-[#ffffff]">
      {post.map((data: FormatterListItem) => (
        <div key={data.id}>
          <div
            className="relative"
            onClick={() => {
              setSharedPostList(shareData)
              console.warn(data)
              navigate(`/shares?ref=${postRef.current}`)
            }}
          >
            {(data?.act_type === 1 || data?.act_type === 2) && (
              <div className="absolute bottom-0 w-full z-[11]">
                <div className="px-[3px] flex justify-between items-center bg-[#00000085] h-[36px]">
                  <p className="text-sm text-white">
                    {' '}
                    {data?.act_type === 1 ? 'Explore more' : 'Vote now'}
                  </p>
                  <i className="iconfont icon-icon_arrow_right text-[#fff] text-[20px]"></i>
                </div>
              </div>
            )}

            {data?.type === POST_TYPE_IMAGE ? <ImageCard data={data} /> : <VideoCard data={data} />}
          </div>

          <div className="mx-3 mt-2 mb-3">
            <div
              className="text-sm font-normal line-clamp-2 text-[#333333]"
              dangerouslySetInnerHTML={{ __html: processText(data?.title) }}
            ></div>

            <div className="flex items-center gap-1 mt-[6px]">
              <Image
                rect
                width={18}
                height={18}
                className="rounded-full"
                src={data?.avatar}
                type={'avatar'}
                alt={data?.username}
              />
              <span className="text-[11px] text-[#666666]">{data?.username}</span>
            </div>
          </div>

          {data.uid !== getCurrentUid() && data.price > 0 && !data.is_pay && (
            <div
              className="h-[36px] flex items-center justify-center gap-1 mx-3 bg-[#6254FF] rounded-full mb-4"
              onClick={() => {
                setSharedPostList(shareData)
                console.warn(data)
                navigate(`/shares?ref=${postRef.current}`)
              }}
            >
              <i className="iconfont icon-lock text-white"></i>
              <span className="text-[13px] text-white">Unlock post for {data.price}</span>
              <i className="iconfont icon-stars text-[#FFC700]"></i>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default PostCard

const ImageCard = ({ data }: { data: FormatterListItem }) => {
  const { getCurrentUid } = useTMAUtils()

  const [currentIndex, SetCurrentIndex] = useState(0)
  return (
    <>
      <div className="border-t-[0.5px] border-[rgba(0,0,0,0.1)] relative z-[1]">
        <Swiper
          className={'z-[1]'}
          indicator={(total, current) => {
            SetCurrentIndex(current)
            return null
          }}
          allowTouchMove={!(data.uid !== getCurrentUid() && !data.is_pay && data.price > 0)}
        >
          {data.media.map((image, index) => {
            return (
              <Swiper.Item
                key={`${data.id}-${image}-${index}`}
                style={{
                  maxHeight: '280px',
                }}
                className={'flex items-center overflow-hidden justify-center'}
              >
                <Image
                  src={[1, 2].includes(data?.act_type || 0) ? image : formatImage(image, false)}
                  alt={data.title}
                  // style={{ maxWidth: '100%', maxHeight: '100%' }}
                  style={{
                    ...(index === 0
                      ? {
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover',
                        }
                      : {
                          width: '100%',
                          objectFit: 'contain',
                        }),
                  }}
                />
              </Swiper.Item>
            )
          })}
        </Swiper>
        {/* {data.uid !== getCurrentUid() && !data.is_pay && data.price > 0 && (
          <FrostedGlass
            price={data.price}
            post_id={data.id}
            resourcesEve={resourcesEve}
            exchangeRate={exchangeRate || 0}
          />
        )} */}
        {data && data.type === 1 ? (
          <div className={'absolute z-10 top-0 right-0'}>
            <div className="absolute top-3 right-3 bg-black bg-opacity-40 rounded-[4px] z-10 p-1.5 flex items-center gap-1 h-[29px]">
              <p className="text-white text-sm">
                {data.uid !== getCurrentUid() && !data.is_pay && data.price > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <i className="iconfont icon-image"></i> {data.pic_num}
                    </div>
                  </>
                ) : (
                  <>
                    {currentIndex + 1}/{data.pic_num}
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  )
}

const VideoCard = ({ data }: { data: FormatterListItem }) => {
  const videoCardContainer = useRef<HTMLDivElement>(null)

  const { getCurrentUid } = useTMAUtils()

  return (
    <div className="video-card" data-id={data.id} ref={videoCardContainer}>
      <div className="relative">
        <div
          style={{
            maxHeight: '280px',
          }}
          className={
            'items-center justify-center overflow-hidden object-contain video-container z-[4] flex'
          }
        >
          <Image
            src={formatImage(data.thumbnail || data.media[0], false)}
            alt={data.title}
            wrapperClassName=" overflow-hidden z-[3]"
            errorClassName="rounded-[0px] h-[150px]"
            className="object-left w-[100%] m-[auto]"
          />
        </div>
        {/* 媒体时间 */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-40 rounded-[4px] z-[4] p-1.5 flex items-center gap-1">
          <i className="iconfont icon-a-Frame2085661742 text-[12px] text-white"></i>
          <p className="text-white text-sm">{formatTime(Number(data.duration))}</p>
        </div>
        {data.type === 0 &&
          data.price > 0 &&
          !data.is_pay &&
          data.uid != getCurrentUid() &&
          data.trailer && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-40 rounded-[20px] z-[4] p-1.5">
              <p className="text-white text-sm font-medium">Preview</p>
            </div>
          )}
      </div>
    </div>
  )
}

// https://test-b.bae.boo/link/79b59c88b807ea64f4ca84416e6340a9a5472683907b974567e2c2c3f16ba42d
// https://test-b.bae.boo/link/86f0c2ea7e76eaa22a3e9cd326261520eabf3b11393f77395751222157005868
// https://test-b.bae.boo/link/dc4a814444103524299159b85b70b3e7655a5eb2d7590efdade6182a511d7d60
// https://test-b.bae.boo/link/8731980cad20b5746532bcdee31c34f18d3fea95c23d415188020611cc60b63a
// https://test-b.bae.boo/link/422977cef7d0b88b0551bd827628f47a598740e62e5b1861545f7b311839be59
// https://test-b.bae.boo/link/2a7daa89f9f112643f0148d1044056dbb021236f3d9968479d14a7a94e9433a8
// https://test-b.bae.boo/link/65158113ff850d53c1b8a4667ff3b4b0fb2727653b2f2462ef9a6542dce98ce5

// https://ditto-dev.anyconn.org/link/49f851fa02c1a7e3271cae75086ee2b43e3a56cd12cb3c64562aa64c8b304985
// https://ditto-dev.anyconn.org/link/b52dd340d3f64acd67a04c0853a3d21184840a5d52087026a9b0cace8ce23eef
