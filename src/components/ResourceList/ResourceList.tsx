import { lazy, memo, Suspense, useCallback, useEffect, useState } from 'react'
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
import { LinkIcon, TelegramIcon, VideoIcon, FavIcon, Fav1Icon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '../Image/Image'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import SecondaryMenu from '../SecondaryMenu/SecondaryMenu'
import { getLink } from '@/api/list'
// import { ImagePreview } from '../Image/ImagePreview'
const ImagePreview = lazy(() => import('../Image/ImagePreview'))
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import useMobile from '@/hooks/useMobile'
import playIcon from '@/assets/icons/videoSwitch.svg'
import { formatTime } from '@/utils/utils'

import { VideoDialog } from './VideoDialog'
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

const ResourceList = ({ resources: initialResources }: { resources: FormatterListItem[] }) => {
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
      console.log('initialResources', initialResources)
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

  const linkEve = async (post_id: number, boll: boolean) => {
    setLikes((prevLikes) =>
      prevLikes.map((item: any) =>
        item.id === post_id
          ? { ...item, liked: !item.liked, like: item.like + (boll ? 1 : -1) }
          : item
      )
    )
    await postLike({
      act_type: boll ? 1 : 2,
      post_id,
    })
  }
  const savedEve = async (pid: number, boll: boolean) => {
    setSaveds((prevLikes) =>
      prevLikes.map((item: any) => (item.id === pid ? { ...item, saveds: boll } : item))
    )
    if (boll) {
      await favPost(pid)
    } else {
      await favDel(pid)
    }
  }

  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    const shareText = encodeURIComponent(title)
    const { host, ref } = await getLinkHandlerAsync({ pid, uid })
    console.log(host, ref, 'getLinkResult')

    const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}?startapp`)
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
      height={isMobile ? '342px' : '300px'}
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
        <h3 className="font-bold text-2xl mb-[10px] text-[24px]">Share from Bae</h3>
        <div className="text-[15px] text-[#808080]">Earn $Bae every time you share from Bae</div>

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

  return (
    <>
      {resources.map((data, index: number) => {
        if (data.type === POST_TYPE_IMAGE && data.media.length > 1) {
          return (
            <Box pt="32px" key={data.id}>
              <ResourceHeader
                data={data}
                currentUid={launchParams.initData?.user?.id ?? 0}
                onProfileClick={jumpToProfilePage}
              />
              <div
                className="relative px-4"
                style={{ minHeight: data.media?.[0] === '' ? '200px' : '' }}
              >
                <div className="grid grid-cols-3 gap-2">
                  {data.media.map((i, ind) => (
                    <Image
                      src={i}
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
                  <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
                )}
              </div>

              <ResourceFooter
                data={data}
                likes={likes}
                saveds={saveds}
                linkEve={linkEve}
                savedEve={savedEve}
                onShare={() => {
                  getShareLink(data.title, data.id, data.uid)
                  toggle()
                }}
              />
            </Box>
          )
        } else {
          return (
            <Box pt="32px" key={index}>
              <ResourceHeader
                data={data}
                currentUid={launchParams.initData?.user?.id ?? 0}
                onProfileClick={jumpToProfilePage}
              />
              <div className="relative px-4">
                {data.type === POST_TYPE_IMAGE ? (
                  <Box position="relative" minH={data.media?.[0] === '' ? '200px' : 'auto'}>
                    <Image
                      src={data.media?.[0] ?? data?.media ?? ''}
                      alt={data.title}
                      errorClassName="rounded-[4px] h-[150px]"
                      wrapperClassName="rounded-[4px] overflow-hidden"
                      className="object-left w-[100%] m-[auto]"
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
                      <PlayButton onClick={() => handleVideoClick(data)} />
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
                onShare={() => {
                  getShareLink(data.title, data.id, data.uid)
                  toggle()
                }}
              />
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
    </>
  )
}

interface ResourceHeaderProps {
  data: FormatterListItem
  currentUid: number
  onProfileClick: (data: FormatterListItem) => void
}

interface ResourceFooterProps {
  data: FormatterListItem
  likes: Like[]
  saveds: Saveds[]
  linkEve: (postId: number, isLike: boolean) => void
  savedEve: (postId: number, isSaveds: boolean) => void
  onShare: () => void
}

const ResourceHeader = memo<ResourceHeaderProps>(({ data, currentUid, onProfileClick }) => {
  return (
    <div className="p-4 flex items-center">
      <div className="flex items-center justify-between gap-2">
        <Image
          rect
          width={48}
          height={48}
          className="rounded-full"
          onClick={() => onProfileClick(data)}
          src={data.avatar}
          alt={data.username}
        />
        <div className="text-[#E0E2F6] font-bold text-base">{data.username}</div>
      </div>
      <SecondaryMenu className="ml-auto" key={data.id} mediaData={data} currentUid={currentUid} />
    </div>
  )
})

const ResourceFooter = memo<ResourceFooterProps>(
  ({ data, likes, linkEve, onShare, savedEve, saveds }) => {
    return (
      <>
        <div className="px-4 py-3">
          <p className="text-[#62636F] text-sm leading-6">{data.title}</p>
          <p className="text-[#424048] text-xs pt-2">
            {dayjs(data.created_at).format('YYYY-MM-DD HH:mm')}
          </p>
        </div>
        <div className="px-4 flex items-center justify-between">
          <Flex gap="16px">
            <Flex
              as={'button'}
              alignItems={'center'}
              onClick={() =>
                linkEve(data.id, likes.find((like) => like.id === data.id)?.liked === false)
              }
            >
              {likes.find((like) => like.id === data.id)?.liked === true ? (
                <IconLiked />
              ) : (
                <IconLike />
              )}
              <Text fontSize={'sm'} color={'#E0E2F6'} pl={1}>
                {likes.find((like) => like.id === data.id)?.like}
              </Text>
            </Flex>
            <Box
              onClick={() =>
                savedEve(data.id, saveds.find((saved) => saved.id === data.id)?.saveds === false)
              }
            >
              {saveds.find((saved) => saved.id === data.id)?.saveds === true ? (
                <Image src={FavIcon} />
              ) : (
                <Image src={Fav1Icon} />
              )}
            </Box>
          </Flex>
          <IconButton
            onClick={onShare}
            aria-label="share"
            background={'transparent'}
            colorScheme={'transparent'}
            h={6}
            w={6}
            icon={<IconShare />}
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
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-20"
  >
    <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" />
  </div>
))

export default ResourceList
