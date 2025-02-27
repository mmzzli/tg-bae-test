import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { WrappedMessage } from '../types'
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

const PostCard: React.FC<{ message: WrappedMessage }> = ({ message }) => {
  const navigate = useNavigate()

  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [post, setPost] = useState<FormatterListItem[]>([])
  const [shareData, setShareData] = useState<ListItem[]>([])
  const [postRef, setPostRef] = useState('')
  const { setSharedPostList } = useStore((state) => ({
    setSharedPostList: state.setSharedPostList,
  }))

  console.log(message)
  const getPost = async (url: string) => {
    const parsedUrl = new URL(url)

    const pathSegments = parsedUrl.pathname.split('/')
    const lastParam = pathSegments[pathSegments.length - 1]
    setPostRef(lastParam)

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

        setTimeout(() => {
          setLoading(false)
        }, 300)
      } else {
        setError(true)
      }
    } catch (err) {
      setError(true)
    }
  }
  useEffect(() => {
    if (message.url) {
      getPost(message.url)
    }
  }, [])
  if (loading)
    return (
      <div className="w-[255px] rounded-lg bg-[#ffffff]">
        <PostMsgSkeleton />
      </div>
    )
  return (
    <div className="cursor-pointer w-[255px] min-h-[300px] rounded-lg bg-[#ffffff]">
      {post.map((data: FormatterListItem) => (
        <>
          <div
            className="relative"
            onClick={() => {
              setSharedPostList(shareData)
              navigate(`/shares?ref=${postRef}`)
            }}
          >
            {(data?.act_type === 1 || data?.act_type === 2) && ( // 使用可选链操作符
              <div
                className="absolute bottom-0 w-full z-[11]"
                onClick={() => {
                  // navigate(getUrl(data.act_type || 1))
                }}
              >
                <div className="px-[3px] py-[16px] flex justify-between bg-[rgba(0, 0, 0, 0.5)]">
                  <p className="text-sm text-white">
                    {' '}
                    {data?.act_type === 1 ? 'Explore more' : 'Vote now'} // 使用可选链操作符
                  </p>
                  <i className="iconfont icon-icon_arrow_right text-[#fff] text-[20px]"></i>
                </div>
              </div>
            )}
            {data?.type === POST_TYPE_IMAGE ? ( // 使用可选链操作符
              <ImageCard data={data} />
            ) : (
              <VideoCard data={data} />
            )}
          </div>

          <div className="mx-3 mt-2 mb-3">
            <span className="text-sm">{data?.title}</span>
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
        </>
      ))}
    </div>
  )
}

export default PostCard

const ImageCard = ({ data }: { data: FormatterListItem }) => {
  const { getCurrentUid } = useTMAUtils()

  const [currentIndex, SetCurrentIndex] = useState(0)

  const firImageHeight = useMemo(() => {
    if (data.pic_height && data.pic_width) {
      const { width } = document.body.getBoundingClientRect()
      const pic_width = Number(data.pic_width.split(':')[0])
      const pic_height = Number(data.pic_height.split(':')[0])
      return (pic_height * width) / pic_width
    }
    return 0
  }, [data])
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
                  height: '280px',
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
                          height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
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
  const cacheVideoIndex = useStore((state) => state.cacheVideoIndex)

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null)

  const [playVideoTime, setPlayVideoTime] = useState(data.duration)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null

    const handleTimeUpdate = () => {
      // 获取它的播放时间
      // videoPlayerRef.current.
      const lostTime = Number(data.duration) - (videoPlayerRef.current?.currentTime || 0)
      setPlayVideoTime(lostTime < 0 ? 0 : lostTime)
    }

    const findVideoPlayer = () => {
      videoPlayerRef.current = document.querySelector('#default-video-player')

      if (cacheVideoIndex === data.id) {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.addEventListener('timeupdate', handleTimeUpdate)

          return () => {
            if (videoPlayerRef.current) {
              videoPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate)
            }
          }
        } else {
          timeoutId = setTimeout(findVideoPlayer, 100)
        }
      } else {
        if (playVideoTime !== data.duration) {
          setPlayVideoTime(data.duration)
        }
      }
    }

    findVideoPlayer()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (videoPlayerRef.current) {
        videoPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [cacheVideoIndex])

  const { getCurrentUid } = useTMAUtils()

  const firImageHeight = useMemo(() => {
    const { width } = document.body.getBoundingClientRect()
    const pic_width = Number(data.width)
    const pic_height = Number(data.height)
    return (pic_height * width) / pic_width
  }, [data])

  return (
    <div className="video-card" data-id={data.id} ref={videoCardContainer}>
      <div className="relative">
        <div
          style={{
            height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
            maxHeight: 'calc(62.8vh)',
          }}
          className={
            'absolute items-center justify-center overflow-hidden relative object-contain video-container z-[4] flex'
          }
          onClick={(e) => {
            e.stopPropagation()
            handleVideoClick(data)
          }}
        >
          <Image
            src={data.mediaCover ? formatImage(data.mediaCover, false) : ''}
            alt={data.title}
            wrapperClassName=" overflow-hidden z-[3]"
            errorClassName="rounded-[0px] h-[150px]"
            className="object-left w-[100%] m-[auto]"
            // onClick={() => handleVideoClick(data)}
          />
          {data.media?.[0] && <PlayButton onClick={() => handleVideoClick(data)} />}
        </div>
        <div className="absolute top-3 right-3 bg-black bg-opacity-40 rounded-[4px] z-4 p-1.5 flex items-center gap-1">
          <i className="iconfont icon-a-Frame2085661742 text-[12px] text-white"></i>
          <p className="text-white text-sm">{formatTime(Number(playVideoTime))}</p>
        </div>
        {data.type === 0 &&
          data.price > 0 &&
          !data.is_pay &&
          data.uid != getCurrentUid() &&
          data.trailer && (
            <HStack
              borderRadius="20px"
              bg="rgba(0, 0, 0, 0.40)"
              position="absolute"
              top="12px"
              left="12px"
              p="6px 12px"
              zIndex={4}
            >
              <Text color="white" fontSize="14px" fontWeight="500">
                Preview
              </Text>
            </HStack>
          )}
        {data.uid !== getCurrentUid() && data.price > 0 && !data.is_pay && (
          <>
            <Box
              position="absolute"
              top="0"
              left="0"
              w="100%"
              zIndex={1}
              style={{
                height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                maxHeight: 'calc(62.8vh)',
              }}
              overflow="hidden"
            >
              <Image
                className="h-[100%] w-[100%]"
                style={{
                  height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                  maxHeight: 'calc(62.8vh)',
                }}
                src={data.media[0]}
              />
            </Box>
            {/* <FrostedGlass
                    price={data.price}
                    post_id={data.id}
                    resourcesEve={resourcesEve}
                    maskOnClick={() => {
                      if (data?.trailer) {
                        handleVideoClick(data)
                      }
                    }}
                    exchangeRate={exchangeRate || 0}
                  /> */}
          </>
        )}
      </div>
    </div>
  )
}
