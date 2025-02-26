import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Box, HStack, IconButton, useBoolean, Text, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { DrawSkeletonItem } from '@/components/Skeketon/ChatSkeleton'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useSharedList } from '@/store/hook/useResourceList'

import Report from '@/components/SecondaryMenu/Report'

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
import Empty from '../comm/Empty'
import Icon from '../comm/Icon'
import Lottie from 'lottie-react'
import likeAnimationData from '@/assets/animations/like.json'
import { CardRecommendProvider } from '@/utils/constants'
import { useStore } from '@/store'
import VideoCard from '@/components/ResourceList/VideoCard'
import ImageCard from '@/components/Image/ImageCard'
import { genShareLinkFn, getTimeStringAutoShort, formatNumber } from '@/utils/utils'
import MoreText from '@/components/More/MoreText'
import { useDailyTaskActions } from '@/hooks/useDailyTask'
import { videoHls } from '@/utils/video/videoHls'
import { totalAvailableInvoice } from '@/api'

export interface ShareDataProps {
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
  const { launchParams } = useTMAUtils()
  const { copy } = useCopy()
  const toast = useToast()

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

          setTimeout(() => {
            WebApp.shareMessage(result.id)

            WebApp.onEvent('prepared_message_sent', function (eventType: any, eventData: any) {
              // 在分享成功后，重置标志
              console.log('Message shared successfully!', eventType, eventData)
            })

            // 监听分享取消的事件
            WebApp.onEvent('shareMessageClosed', function (eventType: any, eventData: any) {
              // 在用户关闭分享窗口时重置标志
              console.log('User closed the share message window.', eventType, eventData)
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
      usePortal={true}
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
            Earn Bae points when you share from Bae
          </div>

          <div className="mt-12 mb-[18px] mx-4">
            <BaseButton
              text="Share via Telegram"
              height="48px"
              loading={getInlineMessageIdLoading}
              icon={<Image src={TelegramIcon} />}
              handler={() => {
                setTimeout(() => {
                  window.Telegram?.WebApp?.resetShareCallback()
                  handShareWithTelegram()
                }, 0)
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
                toast({
                  render: () => {
                    return <CustomToast title="Link copied!" type={typeOptions.success} />
                  },
                  position: 'bottom',
                })
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

interface Props {
  resources: FormatterListItem[]
  type?: string
  hasMore?: boolean
  setCurrentShareData?: (data: ShareDataProps) => void
  getShareLink?: (title: string, pid: number, uid: number) => Promise<void>
}

const ResourceList = ({ resources: initialResources, type, hasMore }: Props) => {
  const navigate = useNavigate()
  const setCacheVideoIndex = useStore((state) => state.setCacheVideoIndex)
  const [resources, setResources] = useState<FormatterListItem[]>([])
  const likes = useStore((state) => state.like)
  const setLikes = useStore((state) => state.setPatchLike)
  const initPatchLikes = useStore((state) => state.initPatchLike)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const toast = useToast()
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const { sharedPostList } = useSharedList()
  const saveds = useStore((state) => state.save)
  const initPatchSaves = useStore((state) => state.initPatchSave)
  const setSaveds = useStore((state) => state.setPatchSave)
  const setImageResource = useStore((state) => state.setImageResource)
  const setFollowResource = useStore((state) => state.setFollowResource)
  const followResource = useStore((state) => state.followResource)
  const videoInfo = useStore((state) => state.videoResource)
  const { launchParams } = useTMAUtils()
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [links, setLinks] = useSetState<ShreLinkProps>({
    shareLink: '',
    copyLink: '',
  })
  const [currentShareData, setCurrentShareData] = useState<ShareDataProps | null>(null)
  const [reportVisible, setReportVisible] = useState(false)
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

    if(token) {
      const fetchExchangeRate = async () => {
        const response = await totalAvailableInvoice()
        console.log('response', response)
        setExchangeRate(response.exchange_rate)
      }
      fetchExchangeRate()
    }
  }, [])

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

      initPatchLikes([...resources, ...sharedPostList])
      initPatchSaves([...resources, ...sharedPostList])
    }
  }, [resources])

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
        }else {
          toast({
            render: () => {
              return <CustomToast title="Saved!" type={typeOptions.success} />
            },
            position: 'bottom',
          })
        }
      } else {
        await favDel(data.id)
        toast({
          render: () => {
            return <CustomToast title="Unsaved!" type={typeOptions.success} />
          },
          position: 'bottom',
        })
      }

      if (type === 'fav') {
        setResources((favResources) => favResources.filter((item) => item.id !== data.id))
      }
    },
    { wait: 500 }
  )

  const savedEve = async (data: FormatterListItem) => {
    setSaveds(data)
    await favRun(data)
  }
  const getShareLink = useMemoizedFn(async (title: string, pid: number, uid: number) => {
    toggle()
    setIsLoading(false)
    const { shareLink, copyLink } = await genShareLinkFn(title, pid, uid, getLinkHandlerAsync)
    setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
    setIsLoading(true)
  })

  const resourcesEve = (post_id: number, url: string, is_pay?: boolean) => {
    const updatedUsers = resources.map((item) => {
      if (item.id === post_id) {
        const options = is_pay ? { is_pay } : {}

        console.log(item.act_type, '=======jacob')
        console.log(url, '=======jacob')
        runDailyWatch(post_id)
        if (item.act_type === 0) {
          const medias = url.split(',')
          const picUrl = medias.find((item) => !item.endsWith('.m3u8') && !item.endsWith('.mp4'))
          const media = medias.find((item) => item.endsWith('.m3u8'))
          const r2 = medias.find((item) => item.endsWith('.mp4'))
          setCacheVideoIndex(item.id)
          const videos = document.querySelectorAll('.video-card')
          const mostVisibleElement = Array.prototype.slice
            .call(videos)
            .find((video) => parseInt(video.getAttribute('data-id')) === item.id)
          if (media) {
            console.log('play', '=======jacob', {
              ...item,
              media: [media],
              mediaCover: picUrl,
              ...options,
            })
            videoHls(
              {
                ...item,
                media: [media],
                mediaCover: picUrl,
                ...options,
              },
              mostVisibleElement
            )
            return { ...item, media: [media], mediaCover: picUrl, ...options, r2 }
          }
        }
        return { ...item, media: url.split(','), ...options }
      }
      return item
    })
    setResources(updatedUsers)
  }

  useEffect(() => {
    if (videoInfo && videoInfo.is_pay) {
      const mediaUrl = [...videoInfo.media, videoInfo.mediaCover].filter((v) => !!v).join(',')
      resourcesEve(videoInfo.id, mediaUrl, true)
    }
  }, [videoInfo])

  if (type === 'fav' && !hasMore && resources.length <= 0) {
    return (
      <Empty
        title="No post yet."
        className="w-full min-h-[240px]"
        icon={
          <Icon name="icon-Empty_white_post" style={{ width: '164px', height: '164px' }}></Icon>
        }
      />
    )
  }

  const getUrl = (act_type: number) => {
    switch (act_type) {
      case 1:
        return '/christmas'
      case 2:
        return '/jkf-campaign'
      default:
        return '/christmas'
    }
  }

  return (
    <>
      {reportVisible && <Report isOpen={reportVisible} onClose={setReportVisible} />}
      <div className="pt-[24px] bg-white">
        {resources.map((data, index: number) => {
          return (
            <Box key={`resource-${data.id}-${index}`} pb={10}>
              <ResourceHeader
                data={data}
                currentUid={launchParams.initData?.user?.id ?? 0}
                onProfileClick={jumpToProfilePage}
                type={type}
                setReportVisible={setReportVisible}
              />
              <Box position="relative">
                {(data.act_type === 1 || data.act_type === 2) && type === 'recommend' && (
                  <Box
                    position="absolute"
                    bottom="0px"
                    w="100%"
                    zIndex={11}
                    onClick={() => navigate(getUrl(data.act_type || 1))}
                  >
                    <HStack p="3px 16px" justifyContent="space-between" bg="rgba(0, 0, 0, 0.5)">
                      <Text fontSize={14} color="#fff">
                        {' '}
                        {data.act_type === 1 ? 'Explore more' : 'Vote now'}
                      </Text>
                      <i className="iconfont icon-icon_arrow_right text-[#fff] text-[20px]"></i>
                    </HStack>
                  </Box>
                )}
                {data.type === POST_TYPE_VIDEO ? (
                  <VideoCard
                    data={data}
                    resourcesEve={resourcesEve}
                    exchangeRate={exchangeRate}
                  />
                ) : data.type === POST_TYPE_IMAGE ? (
                  <ImageCard
                    data={data}
                    handleImageClick={(images, index) => handleImageClick(images, index, data.id)}
                    resourcesEve={resourcesEve}
                    exchangeRate={exchangeRate}
                  />
                ) : ( <VideoCard
                  data={data}
                  resourcesEve={resourcesEve}
                  exchangeRate={exchangeRate}
                />
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
                  if (getShareLink) {
                    getShareLink(data.title, data.id, data.uid)
                  }
                  if (setCurrentShareData) {
                    setCurrentShareData({
                      pid: data.id,
                      uid: data.uid,
                    })
                  }
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
  setReportVisible: (boll: boolean) => void
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

const ResourceHeader = memo<ResourceHeaderProps>(
  ({ data, currentUid, onProfileClick, type, setReportVisible }) => {
    const cardValue = useContext(CardRecommendProvider)
    return (
      <div className="pl-4 pr-4 pb-4 flex items-center">
        <div
          className="flex items-center justify-between gap-2"
          onClick={() => onProfileClick(data)}
        >
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
            <div className="flex items-center gap-1.5">
              <h3 className="text-[#333] dark:text-[#E0E2F6]  font-bold text-base">
                {data.username}
              </h3>
              <p className="text-[#868686] dark:text-[#424048] text-xs mt-[2px]">
                {getTimeStringAutoShort(
                  new Date(data.created_at).getTime() - new Date().getTimezoneOffset() * 60000,
                  true
                )}
              </p>
            </div>
            <div className="flex gap-1.5 items-center">
              {data.act_type === 1 && type === 'recommend' ? (
                <div className="text-[#333333] text-[12px]">Featured</div>
              ) : (
                cardValue?.recommend &&
                !data.is_follow && <div className="text-[#333333] text-[12px]">Bae selected</div>
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
          setReportVisible={setReportVisible}
        />
      </div>
    )
  }
)

const ResourceFooter = memo<ResourceFooterProps>(({ data, linkEve, onShare, savedEve, type }) => {
  const likes = useStore((state) => state.like)
  const saveds = useStore((state) => state.save)
  const { getCurrentUid } = useTMAUtils()

  const liked = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.liked || false
  }, [likes])

  const likeNum = useMemo(() => {
    return likes.find((like) => like.id === data.id)?.like || 0
  }, [likes])

  const saved = useMemo(() => {
    return saveds.find((saved) => saved.id === data.id)?.saveds
  }, [saveds])

  const renderPriceText = (uid: number, price: number) => {
    return uid !== getCurrentUid() ? `Purchased for ${price}` : `Unlock post for ${price}`
  }
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
            <span className="pl-1 text-sm font-medium text-[##0D0D0D] mb-[1px]">
              {formatNumber(likeNum)}
            </span>
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
      {(data.title || data.is_pay || data.uid == getCurrentUid()) && (
        <div className="px-4 pt-[10px]">
          <div className="text-[#0F1419] dark:text-[#ccc] font-normal text-sm leading-4">
            <MoreText text={data.title} bgColor={'#fff'} textColor={'#333'} type="post" />
          </div>
          <div className="flex items-center justify-between">
            {(((type === 'view' || type === 'recommend') && data.price > 0) || data.is_pay) && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[#666666] dark:text-[#424048] text-[12px]">
                  {renderPriceText(data.uid, data.price)}
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
    onClick={(e) => {
      e.stopPropagation()
      onClick(e)
    }}
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 no-tap z-[5] video-card-switch"
  >
    {/* <Image src={playIcon} alt="play" className="w-[72px] h-[72px] no-tap" /> */}
  </div>
))

export default ResourceList
