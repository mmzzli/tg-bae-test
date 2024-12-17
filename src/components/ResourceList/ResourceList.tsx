import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Box, Flex, HStack, IconButton, useBoolean, Text, Heading } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { DrawSkeletonItem } from '@/components/Skeketon/ChatSkeleton'

import { favDel, favPost, postLike } from '@/api'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { BaseModal } from '../Modal/BaseModal'
import BaseButton from '../BaseButton/BaseButton'
import useCopy from '@/hooks/useCopy'
import { useMemoizedFn, useRequest, useSetState, useDebounceFn } from 'ahooks'
import { LinkIcon, StarsIcon, TelegramIcon } from '@/assets/icons'
import { followPreview, FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '../Image/Image'
import SecondaryMenu from '../SecondaryMenu/SecondaryMenu'
import { getLink, getShareInlineMessageId } from '@/api/list'
import { useProfileNavigation } from '@/hooks/useProfileNavigation'
import useMobile from '@/hooks/useMobile'
import playIcon from '@/assets/icons/videoSwitch.svg'
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import Lottie from 'lottie-react'
import likeAnimationData from '@/assets/animations/like.json'
import { CardRecommendProvider } from '@/utils/constants'
import { useStore } from '@/store'
import VideoCard from '@/components/ResourceList/VideoCard'
import ImageCard from '@/components/Image/ImageCard'
import { genShareLinkFn, getTimeStringAutoShort } from '@/utils/utils'
import MoreText from '@/components/More/MoreText'
import { useDailyTaskActions } from '@/hooks/useDailyTask'

interface ShareDataProps {
  pid: number
  uid: number
}

interface ShreLinkProps {
  shareLink: string
  copyLink: string
}
interface ShareModalProps {
  isBaseModalOpen: boolean
  off: () => void
  currentShareData: ShareDataProps | null
  links: ShreLinkProps
  isLoading: boolean
  setIsLoading: (value: boolean) => void
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isBaseModalOpen,
  off,
  currentShareData,
  links,
  isLoading,
  setIsLoading,
}) => {
  const { launchParams, getCurrentUid } = useTMAUtils()
  const { copy } = useCopy()

  const { runAsync: getInlineMessageId, loading: getInlineMessageIdLoading } = useRequest(
    getShareInlineMessageId,
    {
      manual: true,
      onSuccess(res) {
        console.log(res)
      },
    }
  )
  const handShareWithTelegram = useMemoizedFn(async () => {
    if (currentShareData) {
      const { result } = await getInlineMessageId({
        pid: currentShareData.pid,
        uid: launchParams.initData?.user?.id ?? 0,
      })
      console.log('result----->', result)
      if (result.id) {
        if (window.Telegram?.WebApp) {
          const WebApp = window.Telegram?.WebApp
          WebApp.onPreparedMessageSent()
          setTimeout(() => {
            WebApp.shareMessage(result.id,(e:any)=>{
              console.log(e,1111)
              return false
            })
          }, 100)
        }
        off()
      } else {
        console.warn('######## shareMessages Error ########', result)
      }
    }
  })
  return (
    <BaseModal
      isOpen={isBaseModalOpen}
      onClose={off}
      height="351px"
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
      {isLoading ? (
        <div className="mt-4 w-full">
          <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333] dark:text-white">
            Share from Bae
          </h3>
          <div className="text-[15px] dark:text-[#808080] text-[#999999]">
            Earn $Bae every time you share from Bae
          </div>

          <div className="mt-12 mb-[18px] mx-4">
            <BaseButton
              text="Share via Telegram"
              height="48px"
              loading={getInlineMessageIdLoading}
              icon={<Image src={TelegramIcon} />}
              handler={() => {
                // shareLink(links.shareLink ?? '')
                handShareWithTelegram()
                // off()
              }}
            />
          </div>

          <div className="mx-4">
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
      ) : (
        <div className="mt-4 w-full">
          <DrawSkeletonItem className="w-full h-[32px] mb-[12px]"></DrawSkeletonItem>
          <DrawSkeletonItem className="w-full h-[32px] mb-[12px]"></DrawSkeletonItem>
          <DrawSkeletonItem className="w-full h-[100px]"></DrawSkeletonItem>
        </div>
      )}
    </BaseModal>
  )
}

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
  const navigate = useNavigate()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const isMobile = useMobile()
  const [resources, setResources] = useState<FormatterListItem[]>([])
  const likes = useStore((state) => state.like)
  const setLikes = useStore((state) => state.setPatchLike)
  const initPatchLikes = useStore((state) => state.initPatchLike)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const saveds = useStore((state) => state.save)

  const initPatchSaves = useStore((state) => state.initPatchSave)

  const setSaveds = useStore((state) => state.setPatchSave)

  const setImageResource = useStore((state) => state.setImageResource)
  const setFollowResource = useStore((state) => state.setFollowResource)
  const followResource = useStore((state) => state.followResource)

  const { launchParams, getCurrentUid } = useTMAUtils()
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [links, setLinks] = useSetState<ShreLinkProps>({
    shareLink: '',
    copyLink: '',
  })
  const [postId, setPostId] = useState<number | null>(null)
  const [currentShareData, setCurrentShareData] = useState<ShareDataProps | null>(null)

  const currentUid = getCurrentUid()
  const jumpToProfilePage = useProfileNavigation()
  const { runDailyWatch } = useDailyTaskActions()

  const handleImageClick = useCallback((images: string[], index: number, post_id: number) => {
    runDailyWatch(post_id)
    setImageResource({
      images,
      currentIndex: index,
    })
  }, [])

  const { runAsync: getLinkHandlerAsync } = useRequest(getLink, {
    manual: true,
    onSuccess(res) {
      console.log(res)
    },
  })

  useEffect(() => {
    const attr: followPreview[] = []
    if (initialResources.length) {
      const res = initialResources.map((item) => {
        const user = followResource?.find((user) => user.uid === item.uid)
        attr.push({
          uid: item.uid,
          is_follow: item.is_follow,
          boll: user?.boll || false,
        })
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
      if (type === 'recommend') {
        const uniqueData: followPreview[] = []
        const seen = new Set<number>()
        for (const value of attr) {
          if (!seen.has(value.uid)) {
            seen.add(value.uid)
            uniqueData.push(value)
          }
        }
        setFollowResource(uniqueData)
      }

      setResources(res)
    } else {
      setResources([])
    }
  }, [initialResources])

  useEffect(() => {
    if (resources.length > 0) {
      // 每次接口更新数据，根据之前接口保存的点赞，和收藏的状态更新到新数据里面
      const likesMap = new Map(likes.map((item) => [item.id, item]))
      const savedsMap = new Map(saveds.map((item) => [item.id, item]))
      resources.forEach((itemA) => {
        const likeMatch = likesMap.get(itemA.id)
        if (likeMatch) {
          itemA.like = likeMatch.like
          itemA.is_liked = likeMatch.liked
        }
        const savedMatch = savedsMap.get(itemA.id)
        if (savedMatch) {
          itemA.is_collected = savedMatch.saveds
        }
      })
      initPatchLikes(resources)
      initPatchSaves(resources)
    }
  }, [resources])

  const { run: linkRun } = useDebounceFn(
    async (data: FormatterListItem) => {
      const curLiked = likes.find((item) => item.id === data.id)?.liked
      await postLike({
        act_type: curLiked ? 1 : 2,
        post_id: data.id,
      })
    },
    { wait: 500 }
  )

  const linkEve = async (data: FormatterListItem) => {
    setLikes(data)
    linkRun(data)
  }
  const { run: favRun } = useDebounceFn(
    async (data: FormatterListItem) => {
      const isSaved = saveds.find((item) => item.id === data.id)?.saveds
      if (isSaved) {
        await favPost(data.id)
      } else {
        await favDel(data.id)
      }

      if (type === 'fav') {
        setResources((favResources) => favResources.filter((item) => item.id !== data.id))
      }
    },
    { wait: 500 }
  )

  const savedEve = async (data: FormatterListItem) => {
    setSaveds(data)
    favRun(data)
  }
  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    toggle()
    setIsLoading(false)
    const { shareLink, copyLink } = await genShareLinkFn(title, pid, uid, getLinkHandlerAsync)
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
    setIsLoading(true)
  })

  const resourcesEve = (post_id: number, url: string, is_pay?: boolean) => {
    setPostId(post_id)
    const updatedUsers = resources.map((item) => {
      if (item.id === post_id) {
        const options = is_pay ? { is_pay } : {}
        return { ...item, media: url.split(','), ...options }
      }
      return item
    })
    setResources(updatedUsers)
  }

  if (type === 'fav' && !hasMore && !resources.length) {
    return (
      <Empty
        title="No post yet."
        className="w-full fixed top-[63%] left-1/2 transform -translate-x-1/2 -translate-y-1/2"
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
          return (
            <Box key={`resource-${data.id}-${index}`} pb={10}>
              <ResourceHeader
                data={data}
                currentUid={launchParams.initData?.user?.id ?? 0}
                onProfileClick={jumpToProfilePage}
                type={type}
              />
              <Box position="relative">
                {data.act_type === 1 && (
                  <Box
                    position="absolute"
                    bottom="0px"
                    w="100%"
                    zIndex={11}
                    onClick={() => navigate('/home/christmas')}
                  >
                    <HStack p="3px 16px" justifyContent="space-between" bg="rgba(0, 0, 0, 0.5)">
                      <Text fontSize={14} color="#fff">
                        {' '}
                        Explore more
                      </Text>
                      <i className="iconfont icon-icon_arrow_right text-[#fff] text-[20px]"></i>
                    </HStack>
                  </Box>
                )}
                {data.type === POST_TYPE_IMAGE ? (
                  <ImageCard
                    data={data}
                    handleImageClick={(images, index) => handleImageClick(images, index, data.id)}
                    resourcesEve={resourcesEve}
                  />
                ) : (
                  <VideoCard resourcesEve={resourcesEve} data={data} />
                )}
              </Box>
              <ResourceFooter
                data={data}
                likes={likes}
                saveds={saveds}
                linkEve={linkEve}
                savedEve={savedEve}
                type={type}
                onShare={() => {
                  getShareLink(data.title, data.id, data.uid)
                  setCurrentShareData({
                    pid: data.id,
                    uid: data.uid,
                  })
                }}
              />
            </Box>
          )
        })}
        <ShareModal
          isBaseModalOpen={isBaseModalOpen}
          off={off}
          currentShareData={currentShareData}
          links={links}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        ></ShareModal>
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
  linkEve: (data: FormatterListItem) => void
  savedEve: (data: FormatterListItem) => void
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
            type={'avatar'}
            alt={data.username}
          />
        </div>
        <div className="flex flex-col">
          <div className="text-[#0F1233] dark:text-[#E0E2F6]  font-bold text-base">
            {data.username}
            {data.is_follow}
          </div>
          <div className="flex gap-1.5 items-center">
            <p className="text-[#868686] dark:text-[#424048] text-xs">
              {getTimeStringAutoShort(new Date(data.created_at).getTime(), true)}
            </p>
            {cardValue?.recommend && !data.is_follow && (
              <div className="text-[#333333] text-[12px]">Bae selected</div>
            )}
          </div>
        </div>
      </div>
      <SecondaryMenu
        className="ml-auto"
        key={data.id}
        mediaData={data}
        currentUid={currentUid}
        type={type}
      />
    </div>
  )
})

const ResourceFooter = memo<ResourceFooterProps>(({ data, linkEve, onShare, savedEve, type }) => {
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
  return (
    <>
      <div className="px-4 flex items-center justify-between h-6 mt-3 box-content">
        <div className="flex items-center gap-4">
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
              <i className="iconfont icon-like text-[#0D0D0D]" style={{ fontSize: '22px' }}></i>
            )}
            <span className="pl-1 text-sm font-medium text-[##0D0D0D] mb-[1px]">{likeNum}</span>
          </div>
          <div
            className="flex items-center justify-center"
            onClick={() => {
              savedEve(data)
            }}
          >
            {saved ? (
              <i className="iconfont icon-saved text-[#FFCC5D]" style={{ fontSize: '22px' }}></i>
            ) : (
              <i
                className="iconfont icon-bookmark-line text-[#0D0D0D]"
                style={{ fontSize: '22px' }}
              ></i>
            )}
          </div>
        </div>

        <IconButton
          onClick={onShare}
          aria-label="share"
          background={'transparent'}
          colorScheme={'transparent'}
          h={6}
          w={6}
          icon={
            <i className="iconfont icon-Frame-2 text-[#0F1233]" style={{ fontSize: '24px' }}></i>
          }
        />
      </div>

      {(data.title || data.is_pay) && (
        <div className="px-4 pt-[10px]">
          <div className="text-[#0F1419] dark:text-[#ccc] font-normal text-sm leading-4">
            <MoreText text={data.title} />
          </div>
          <div className="flex items-center justify-between">
            {data.is_pay && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[#666666] dark:text-[#424048] text-[12px]">
                  Purchased for {data.price}
                </p>
                <Image src={StarsIcon} className="mb-1" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
})

export const PlayButton = memo(({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <div
    onClick={onClick}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-[5] video-card-switch"
  >
    <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" />
  </div>
))

export default ResourceList
