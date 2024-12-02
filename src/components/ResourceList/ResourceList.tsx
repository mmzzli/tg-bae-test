import { lazy, memo, Suspense, useCallback, useContext, useEffect, useState } from 'react'
import { Box, Flex, Text, IconButton, useBoolean, HStack } from '@chakra-ui/react'
import { IconLike } from '@/components/icons/like'
import { IconLiked } from '@/components/icons/liked'
// import { IconCommit } from '@/components/icons/commit'
import { IconShare } from '@/components/icons/share'
import { postLike, favPost, favDel } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { BaseModal } from '../Modal/BaseModal'
import BaseButton from '../BaseButton/BaseButton'
import useCopy from '@/hooks/useCopy'
import { useMemoizedFn, useRequest, useSafeState, useSetState } from 'ahooks'
import dayjs from 'dayjs'
import { LinkIcon, TelegramIcon, VideoIcon, FavIcon, Fav1Icon, StarsIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '../Image/Image'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import SecondaryMenu from '../SecondaryMenu/SecondaryMenu'
import { getLink } from '@/api/list'
import ImagePreview from '../Image/ImagePreview'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import useMobile from '@/hooks/useMobile'
import playIcon from '@/assets/icons/videoSwitch.svg'
import { formatImage, formatTime } from '@/utils/utils'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'

import { VideoDialog } from './VideoDialog'
import { CardRecommendProvider } from '@/utils/constants'
import { useStore } from '@/store'
interface Like {
  id: number
  liked: boolean
  like: number
}
interface Saveds {
  id: number
  saveds: boolean
}

const POST_TYPE_IMAGE = 1
const POST_TYPE_VIDEO = 0

const ResourceList = ({
  resources: initialResources,
  type,
  hasMore,
}: {
  resources: FormatterListItem[]
  type?: string
  hasMore?: boolean
}) => {
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const loadFullVideo = useStore((state) => state.loadFullVideo)
  const isMobile = useMobile()
  const [resources, setResources] = useState<FormatterListItem[]>([])
  const [likes, setLikes] = useSafeState<Like[]>([])
  const [saveds, setSaveds] = useState<Saveds[]>([])

  const { shareLink, launchParams } = useTMAUtils()
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [links, setLinks] = useSetState<{ shareLink: string; copyLink: string }>({
    shareLink: '',
    copyLink: '',
  })
  const [postId, setPostId] = useState<number | null>(null)
  const { copy } = useCopy()

  // image preview
  const [previewImages, setPreviewImages] = useState<string[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  //
  const [isVideoPreviewOpen, setIsVideoPreviewOpen] = useState<boolean>(false)
  const [previewVideo, setPreviewVideo] = useState<FormatterListItem | null>(null)

  const jumpToProfilePage = useProfileNavigation()

  const handleImageClick = useCallback((images: string[], index: number) => {
    setPreviewImages(images)
    setCurrentIndex(index)
    setIsPreviewOpen(true)
  }, [])

  const handleVideoClick = useCallback((video: FormatterListItem) => {
    setPreviewVideo(video)
    setCacheVideoIndex(video.id)
    loadFullVideo(video)
    setIsVideoPreviewOpen(true)
  }, [])

  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  useEffect(() => {
    if (initialResources.length) {
      const res = initialResources.map((item) => {
        if (item.type === 0 && item.media.length > 0) {
          const [mediaCover, media] = item.media[0].split(',')
          return {
            ...item,
            media: [media || mediaCover],
            mediaCover: item.thumbnail,
          }
        }
        return item
      })
      setResources(res)
    } else {
      setResources([])
    }
  }, [initialResources])

  useEffect(() => {
    if (resources.length > 0) {
      setLikes(resources.map((item) => ({ id: item.id, liked: item.is_liked, like: item.like })))
      setSaveds(resources.map((item) => ({ id: item.id, saveds: item.is_collected })))
    }
  }, [resources])

  const [linksBoll, setLinksBoll] = useState(false)
  const linkEve = async (post_id: number, boll: boolean) => {
    if (linksBoll) return
    setLikes((prevLikes) =>
      prevLikes.map((item: any) =>
        item.id === post_id
          ? { ...item, liked: !item.liked, like: item.like + (boll ? 1 : -1) }
          : item
      )
    )
    setLinksBoll((prev) => !prev)
    await postLike({
      act_type: boll ? 1 : 2,
      post_id,
    })
    setLinksBoll((prev) => !prev)
  }
  const [favBoll, setFavBoll] = useState(false)
  const savedEve = async (pid: number, boll: boolean) => {
    if (favBoll) return
    setSaveds((prevLikes) =>
      prevLikes.map((item: any) => (item.id === pid ? { ...item, saveds: boll } : item))
    )
    if (type === 'fav') {
      setResources((favResources) => favResources.filter((item) => item.id !== pid))
    }
    setFavBoll((prev) => !prev)
    if (boll) {
      await favPost(pid)
    } else {
      await favDel(pid)
    }
    setFavBoll((prev) => !prev)
  }

  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    const shareText = encodeURIComponent(title)
    const { host, ref } = await getLinkHandlerAsync({ pid, uid })
    console.log(host, ref, 'getLinkResult')

    const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}`)
    console.log('copyLink', decodeURIComponent(copyLink))

    const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
  })

  const resourcesEve = (post_id: number, url: string) => {
    setPostId(post_id)
    const updatedUsers = resources.map((item) => {
      if (item.id === post_id) {
        return { ...item, media: url.split(',') }
      }
      return item
    })
    setResources(updatedUsers)
  }

  const renderBaseModal = () => (
    <BaseModal
      isOpen={isBaseModalOpen}
      onClose={off}
      height={isMobile ? '351px' : '300px'}
      animation={{
        duration: 400,
        timingFunction: 'ease-in-out',
      }}
      theme={{
        darkBackgroundColor: '#1a1a1a',
        lightBackgroundColor: '#ffffff',
        handleColor: '#d1d5db',
      }}
      closeOnBackdropClick={true}
      showHandle={false}
    >
      <div className="mt-4 w-full">
        <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333] dark:text-white">
          Share from Bae
        </h3>
        <div className="text-[15px] dark:text-[#808080] text-[#999999]">
          Earn $Bae every time you share from Bae
        </div>

        {isMobile && (
          <div className="mt-12 mb-[18px] mx-4">
            <BaseButton
              text="Share via Telegram"
              height="48px"
              icon={<Image src={TelegramIcon} />}
              handler={() => {
                shareLink(links.shareLink ?? '')
                off()
              }}
            />
          </div>
        )}

        <div className={isMobile ? 'mx-4' : 'mx-4 mt-[50px]'}>
          <BaseButton
            text="Copy link"
            height="48px"
            icon={<Image src={LinkIcon} />}
            handler={() => {
              copy(links.copyLink)
              off()
            }}
          />
        </div>
      </div>
    </BaseModal>
  )
  if (type === 'fav' && !hasMore && !resources.length) {
    return (
      <Empty
        title="No post yet."
        icon={
          <Icon name="icon-Empty_white_post" style={{ width: '164px', height: '164px' }}></Icon>
        }
      ></Empty>
    )
  }
  return (
    <>
      <div className="pt-[24px]">
        {resources.map((data, index: number) => {
          if (data.type === POST_TYPE_IMAGE && data.media.length > 1) {
            if (data.media.length === 4) {
              return (
                <Box key={data.id} mb="40px">
                  <ResourceHeader
                    data={data}
                    currentUid={launchParams.initData?.user?.id ?? 0}
                    onProfileClick={jumpToProfilePage}
                    type={type}
                  />
                  <div
                    className="relative px-4"
                    style={{ minHeight: data.media?.[0] === '' ? '200px' : '' }}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      <div className="grid grid-cols-2 gap-2 col-span-2">
                        {data.media.map((i, ind) => (
                          <Image
                            src={formatImage(i, false)}
                            alt={data.title}
                            width="100%"
                            height="100%"
                            key={i}
                            onClick={() => handleImageClick(data.media, ind)}
                            rect
                          />
                        ))}
                      </div>
                      <div className=""></div>
                    </div>
                    {data.media?.[0] == '' && (
                      <FrostedGlass
                        price={data.price}
                        post_id={data.id}
                        resourcesEve={resourcesEve}
                      />
                    )}
                  </div>

                  <ResourceFooter
                    data={data}
                    likes={likes}
                    saveds={saveds}
                    linkEve={linkEve}
                    savedEve={savedEve}
                    type={type}
                    onShare={() => {
                      getShareLink(data.title, data.id, data.uid)
                      toggle()
                    }}
                  />
                  {/* <div className="pt-8 pb-8 pl-4 pr-4">
                    <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}></div>
                  </div> */}
                </Box>
              )
            } else {
              return (
                <Box key={data.id} mb="40px">
                  <ResourceHeader
                    data={data}
                    currentUid={launchParams.initData?.user?.id ?? 0}
                    onProfileClick={jumpToProfilePage}
                    type={type}
                  />
                  <div
                    className="relative px-4"
                    style={{ minHeight: data.media?.[0] === '' ? '200px' : '' }}
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {data.media.map((i, ind) => (
                        <Image
                          src={formatImage(i, false)}
                          alt={data.title}
                          width="100%"
                          height="100%"
                          key={i}
                          onClick={() => handleImageClick(data.media, ind)}
                          rect
                        />
                      ))}
                    </div>
                    {data.media?.[0] == '' && (
                      <FrostedGlass
                        price={data.price}
                        post_id={data.id}
                        resourcesEve={resourcesEve}
                      />
                    )}
                  </div>

                  <ResourceFooter
                    data={data}
                    likes={likes}
                    saveds={saveds}
                    linkEve={linkEve}
                    savedEve={savedEve}
                    type={type}
                    onShare={() => {
                      getShareLink(data.title, data.id, data.uid)
                      toggle()
                    }}
                  />
                  {/* <div className="pt-8 pb-8 pl-4 pr-4">
                    <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}></div>
                  </div> */}
                </Box>
              )
            }
          } else {
            return (
              <Box key={index} className="video-card" data-id={data.id} mb="40px">
                <ResourceHeader
                  data={data}
                  currentUid={launchParams.initData?.user?.id ?? 0}
                  onProfileClick={jumpToProfilePage}
                  type={type}
                />
                <div className="relative px-4">
                  {data.type === POST_TYPE_IMAGE ? (
                    <Box position="relative" minH={data.media?.[0] === '' ? '200px' : 'auto'}>
                      <Image
                        src={formatImage(data.media?.[0] ?? data?.media ?? '', false)}
                        alt={data.title}
                        errorClassName="rounded-[4px] h-[150px]"
                        width={data.pic_width}
                        height={data.pic_height}
                        className={`w-[230px] rounded-[4px]`}
                        style={{
                          height: (230 * Number(data.pic_height)) / Number(data.pic_width) + 'px',
                        }}
                        onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
                      />
                      {data.media?.[0] === '' && (
                        <FrostedGlass
                          price={data.price}
                          post_id={data.id}
                          resourcesEve={resourcesEve}
                        />
                      )}
                    </Box>
                  ) : (
                    <Box position="relative">
                      <Box minH={data.media?.[0] === '' ? '200px' : '130px'}>
                        <Image
                          src={data.mediaCover}
                          alt={data.title}
                          wrapperClassName="rounded-[4px] overflow-hidden"
                          errorClassName="rounded-[4px] h-[150px]"
                          className="object-left w-[100%] rounded-[4px] m-[auto]"
                          onClick={() => handleVideoClick(data)}
                        />
                        {data.media?.[0] && <PlayButton onClick={() => handleVideoClick(data)} />}
                      </Box>
                      <HStack
                        borderRadius="4px"
                        bg="rgba(0, 0, 0, 0.20)"
                        position="absolute"
                        top="18px"
                        left="18px"
                        p="4px 8px"
                        gap="4px"
                      >
                        <Image src={VideoIcon} />
                        <Text color="#E0E2F6" fontSize="12px">
                          {formatTime(Number(data.duration))}
                        </Text>
                      </HStack>

                      {data.media?.[0] === '' && (
                        <FrostedGlass
                          price={data.price}
                          post_id={data.id}
                          resourcesEve={resourcesEve}
                        />
                      )}
                    </Box>
                  )}
                </div>

                <ResourceFooter
                  data={data}
                  likes={likes}
                  saveds={saveds}
                  linkEve={linkEve}
                  savedEve={savedEve}
                  type={type}
                  onShare={() => {
                    getShareLink(data.title, data.id, data.uid)
                    toggle()
                  }}
                />
                {/* <div className="pt-8 pb-8 pl-4 pr-4">
                  <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.15)' }}></div>
                </div> */}
              </Box>
            )
          }
        })}

        {isVideoPreviewOpen && (
          <VideoDialog info={previewVideo} onClose={() => setIsVideoPreviewOpen(false)} />
        )}

        {isPreviewOpen && (
          <ImagePreviewWrapper
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            images={previewImages}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
          />
        )}
        {/* Components */}
        {renderBaseModal()}
      </div>
    </>
  )
}

interface ResourceHeaderProps {
  data: FormatterListItem
  currentUid: number
  onProfileClick: (data: FormatterListItem) => void
  type?: string
}

interface ResourceFooterProps {
  data: FormatterListItem
  likes: Like[]
  saveds: Saveds[]
  linkEve: (postId: number, isLike: boolean) => void
  savedEve: (postId: number, isSaveds: boolean) => void
  onShare: () => void
  type?: string
}

const ResourceHeader = memo<ResourceHeaderProps>(({ data, currentUid, onProfileClick, type }) => {
  const cardValue = useContext(CardRecommendProvider)
  return (
    <div className="pl-4 pr-4 pb-4 flex items-center">
      <div className="flex items-center justify-between gap-2" onClick={() => onProfileClick(data)}>
        <div className="w-[48px] h-[48px] overflow-hidden rounded-[50%]">
          <Image
            rect
            width={48}
            height={48}
            className="rounded-full"
            src={data.avatar}
            alt={data.username}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-[#0F1233] dark:text-[#E0E2F6]  font-bold text-base">
            {data.username}
            {data.is_follow}
          </div>

          {cardValue?.recommend && !data.is_follow && (
            <div className="text-[#333333] text-[12px]">Bae selected</div>
          )}
        </div>
      </div>
      <SecondaryMenu className="ml-auto" key={data.id} mediaData={data} currentUid={currentUid} type={type} />
    </div>
  )
})

const ResourceFooter = memo<ResourceFooterProps>(
  ({ data, likes, linkEve, onShare, savedEve, saveds, type }) => {
    return (
      <>
        <div className="px-4 py-3">
          <p className="text-[#0F1419] dark:text-[#ccc] text-sm leading-6">{data.title}</p>
          <HStack pt="2" justifyContent="space-between">
            <p className="text-[#868686] dark:text-[#424048] text-xs">
              {dayjs(data.created_at).format('YYYY-MM-DD HH:mm')}
            </p>
            {type === 'payment' && (
              <HStack gap="4px">
                <p className="text-[#666666] dark:text-[#424048] text-[12px]">
                  Purchased for {data.price}
                </p>
                <Image src={StarsIcon} />
              </HStack>
            )}
          </HStack>
        </div>
        <div className="px-4 flex items-center justify-between">
          <Flex gap="16px">
            {data.media && data.media[0] && (
              <Flex
                as={'button'}
                alignItems={'center'}
                onClick={() =>
                  linkEve(data.id, likes.find((like) => like.id === data.id)?.liked === false)
                }
              >
                {likes.find((like) => like.id === data.id)?.liked === true ? (
                  <i
                    className="iconfont icon-Frame text-[#FF5596]"
                    style={{ fontSize: '24px' }}
                  ></i>
                ) : (
                  <i className="iconfont icon-like text-[#0D0D0D]" style={{ fontSize: '24px' }}></i>
                )}
                <span className="pl-1 text-sm text-[##0D0D0D]">
                  {likes.find((like) => like.id === data.id)?.like}
                </span>
              </Flex>
            )}
            {data.media && data.media[0] && (
              <Box
                onClick={() =>
                  savedEve(data.id, saveds.find((saved) => saved.id === data.id)?.saveds === false)
                }
              >
                {saveds.find((saved) => saved.id === data.id)?.saveds === true ? (
                  <i
                    className="iconfont icon-saved text-[#FFCC5D]"
                    style={{ fontSize: '24px' }}
                  ></i>
                ) : (
                  <i
                    className="iconfont icon-bookmark-line text-[#0D0D0D]"
                    style={{ fontSize: '24px' }}
                  ></i>
                )}
              </Box>
            )}
          </Flex>
          <IconButton
            onClick={onShare}
            aria-label="share"
            background={'transparent'}
            colorScheme={'transparent'}
            h={6}
            w={6}
            icon={
              <i className="iconfont icon-Frame-2 text-[#0D0D0D]" style={{ fontSize: '24px' }}></i>
            }
          />
        </div>
      </>
    )
  }
)

const ImagePreviewWrapper = memo(
  ({
    isOpen,
    images,
    currentIndex,
    onClose,
    onIndexChange,
  }: {
    isOpen: boolean
    images: string[]
    currentIndex: number
    onClose: () => void
    onIndexChange: (index: number) => void
  }) => {
    if (!isOpen) return null

    return (
      <Suspense fallback={null}>
        <ImagePreview
          isOpen={isOpen}
          onClose={onClose}
          images={images}
          currentIndex={currentIndex}
          onIndexChange={onIndexChange}
        />
      </Suspense>
    )
  }
)

const PlayButton = memo(({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-1"
  >
    <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" />
  </div>
))

export default ResourceList
