import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Box, Flex, Text, IconButton, useBoolean, HStack } from '@chakra-ui/react'
import { IconLike } from '@/components/icons/like'
import { IconLiked } from '@/components/icons/liked'
import { IconCommit } from '@/components/icons/commit'
import { IconShare } from '@/components/icons/share'
import { postLike } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { BaseModal } from '../Modal/BaseModal'
import BaseButton from '../BaseButton/BaseButton'
import useCopy from '@/hooks/useCopy'
import { useMemoizedFn, useRequest, useSafeState, useSetState } from 'ahooks'
import dayjs from 'dayjs'
import { LinkIcon, TelegramIcon, VideoIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '../Image/Image'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import SecondaryMenu from '../SecondaryMenu/SecondaryMenu'
import { getLink } from '@/api/list'
// import { ImagePreview } from '../Image/ImagePreview'
const ImagePreview = lazy(() => import('../Image/ImagePreview'))
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import useMobile from '@/hooks/useMobile'
interface Like {
  id: number
  liked: boolean
  like: number
}

const POST_TYPE_IMAGE = 1
const POST_TYPE_VIDEO = 0

const ResourceList = ({ resources: initialResources }: { resources: FormatterListItem[] }) => {
  const isMobile = useMobile()
  const [resources, setResources] = useState<FormatterListItem[]>([])
  const [likes, setLikes] = useSafeState<Like[]>([])
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

  const jumpToProfilePage = useProfileNavigation()

  const handleImageClick = (images: string[], index: number) => {
    console.log(images, 'images')
    setPreviewImages(images)
    setCurrentIndex(index)
    setIsPreviewOpen(true)
  }

  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  useEffect(() => {
    if (initialResources.length) {
      console.log(initialResources)
      const res = initialResources.map((item) => {
        if (item.type === 0 && item.media.length > 0) {
          const [mediaCover, media] = item.media[0].split(',')
          return {
            ...item,
            media: [media || mediaCover],
            mediaCover: `https://baedev.anyconn.org/bg2.png`,
          }
        }
        return item
      })
      setResources(res)
    }
  }, [initialResources])
  useEffect(() => {
    if (resources.length > 0) {
      setLikes(resources.map((item) => ({ id: item.id, liked: item.is_liked, like: item.like })))
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
      height={isMobile ? '60vh' : '300px'}
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
              <div className="relative px-4">
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
                linkEve={linkEve}
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
                  <Box position="relative">
                    <Image
                      src={data.media?.[0] ?? data?.media ?? ''}
                      alt={data.title}
                      errorClassName="rounded-[2px] h-[150px]"
                      className="object-left max-h-[387px] rounded-[2px] m-[auto]"
                      onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
                    />
                    {data.media?.[0] === '' && <FrostedGlass
                      price={data.price}
                      post_id={data.id}
                      resourcesEve={resourcesEve}
                    />}
                  </Box>
                ) : (
                  <Box position="relative">
                    <Box minH="130px">
                      <Image
                        src={data.mediaCover}
                        alt={data.title}
                        errorClassName="rounded-[2px] h-[150px]"
                        className="object-left max-h-[387px] rounded-[2px] m-[auto]"
                        onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
                      />
                    </Box>
                    <HStack
                      borderRadius="4px"
                      bg="rgba(0, 0, 0, 0.20)"
                      position="absolute"
                      top="12px"
                      left="28px"
                      p="4px 8px"
                    >
                      <Image src={VideoIcon} />
                      <Text color="#E0E2F6" fontSize="12px">
                        {data.duration}
                      </Text>
                    </HStack>

                    {data.media?.[0] === '' &&
                    <FrostedGlass
                      price={data.price}
                      post_id={data.id}
                      resourcesEve={resourcesEve}
                    />}
                  </Box>
                )}
              </div>

              <ResourceFooter
                data={data}
                likes={likes}
                linkEve={linkEve}
                onShare={() => {
                  getShareLink(data.title, data.id, data.uid)
                  toggle()
                }}
              />
            </Box>
          )
        }
      })}
      {/* <ImagePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={previewImages}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      /> */}
      {isPreviewOpen && (
        <Suspense fallback={null}>
          <ImagePreview
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            images={previewImages}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
          />
        </Suspense>
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

const ResourceHeader: React.FC<ResourceHeaderProps> = ({ data, currentUid, onProfileClick }) => {
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
}

interface ResourceFooterProps {
  data: FormatterListItem
  likes: Like[]
  linkEve: (postId: number, isLike: boolean) => void
  onShare: () => void
}

const ResourceFooter: React.FC<ResourceFooterProps> = ({ data, likes, linkEve, onShare }) => {
  return (
    <>
      <div className="px-4 py-3">
        <p className="text-[#62636F] text-sm leading-6">{data.title}</p>
        <p className="text-[#424048] text-xs pt-2">
          {dayjs(data.created_at).format('YYYY-MM-DD HH:mm')}
        </p>
      </div>
      <div className="px-4 flex items-center justify-between">
        <Flex>
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

export default ResourceList
