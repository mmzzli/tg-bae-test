import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Box, Flex, Text, IconButton, useBoolean } from '@chakra-ui/react'
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
import { isLocalEnv } from '@/utils/env'
import { LinkIcon, TelegramIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Image from '../Image/Image'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import SecondaryMenu from '../SecondaryMenu/SecondaryMenu'
import { getLink } from '@/api/list'
import { ImagePreview } from '../Image/ImagePreview'
interface Like {
  id: number
  liked: boolean
  like: number
}

const ResourceList = ({ resources }: { resources: FormatterListItem[] }) => {
  const [likes, setLikes] = useSafeState<Like[]>([])
  const { shareLink, launchParams } = useTMAUtils()
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [preloaded, setPreloaded] = useSafeState<boolean[]>(new Array(resources.length).fill(false))
  const [playingIndex, setPlayingIndex] = useSafeState<number | null>(null)
  const [isMuted, setIsMuted] = useSafeState(true)
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

  const handleImageClick = (images: string[], index: number) => {
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
    if (resources.length > 0) {
      setLikes(resources.map((item) => ({ id: item.id, liked: item.is_liked, like: item.like })))
    }
  }, [resources])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const videoElement = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          videoElement.play().catch((error) => console.error('Video play failed:', error));
        } else {
          videoElement.pause();
        }
      });
    }, options);

    resources.forEach((item, index) => {
      if (Hls.isSupported() && item.type === 0) {
        const hls = new Hls();
        hls.loadSource(item.media[0]);
        hls.attachMedia(videoRefs.current[index]!);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const maxLevel = hls.levels.length - 1;
          hls.startLevel = maxLevel;
          hls.currentLevel = maxLevel;
        });

        const videoElement = videoRefs.current[index];
        if (videoElement) {
          videoElement.addEventListener('canplaythrough', () => {
            setPreloaded((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          });

          observer.observe(videoElement);
        }

        return () => {
          hls.destroy();
          observer.unobserve(videoRefs.current[index]!);
        };
      }
    });

    const handleTouchStart = () => {
      setIsMuted(false);
      videoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.play().catch((error) => console.error('Video play failed:', error));
        }
      });
    };

    window.addEventListener('touchstart', handleTouchStart, { once: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [resources]);

  const handlePlay = (index: number) => {
    if (playingIndex !== null && playingIndex !== index) {
      const currentVideo = videoRefs.current[playingIndex]
      if (currentVideo) {
        currentVideo.pause()
      }
    }
    setPlayingIndex(index)
  }

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

  const getShareLink = useMemoizedFn(
    async (title: string, pid: number, uid: number, type: 'shares' | 'profile') => {
      const shareText = encodeURIComponent(title)
      const { host, ref } = await getLinkHandlerAsync({ pid, uid })
      console.log(host, ref, 'getLinkResult')

      const copyLink = encodeURIComponent(
        !isLocalEnv
          ? `https://t.me/BaeDevBot/BAE?startapp=type=${type}_ref=${ref}_uid=${uid}`
          : ` https://t.me/ditto_gray_tes_bot/ditto_gray_tes?startapp=type=${type}_ref=${ref}_uid=${uid}`
      )
      console.log('copyLink', decodeURIComponent(copyLink))

      const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
      setLinks({ shareLink, copyLink: decodeURIComponent(copyLink) })
    }
  )
  const resourcesEve = (post_id: number) => {
    setPostId(post_id)
    // const updatedUsers = resources.map(user => {
    //   if (user.id === post_id) {
    //     return { ...user, price: 0 };
    //   }
    //   return user;
    // });
    // updatedUsers
  }

  const renderBaseModal = () => (
    <BaseModal
      isOpen={isBaseModalOpen}
      onClose={off}
      height="60vh"
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
        <h3 className="font-bold text-2xl mb-[10px]">Share from Bae</h3>
        <div className="text-[15px] text-[#808080]">Earn $Bae every time you share from Bae</div>
        <div className="mt-12 mb-[18px] mx-4">
          <BaseButton
            text="Share via Telegram"
            icon={<Image src={TelegramIcon} />}
            handler={() => {
              shareLink(links.shareLink ?? '')
              off()
            }}
          />
        </div>
        <div className="mx-4">
          <BaseButton
            text="Copy link"
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
        if (data.type === 1 && data.media.length > 1) {
          return (
            <Box background={'#0D0D0D'} pt="32px" key={data.id}>
              <Flex px={4} py={3} alignItems={'center'} justifyContent={'space-between'}>
                <Flex alignItems={'center'}>
                  <div className="flex items-center justify-between gap-2">
                    <Image
                      rect
                      width={48}
                      height={48}
                      className="rounded-full"
                      src={data.avatar}
                      alt={data.username}
                    />
                    <div className="text-[#E0E2F6] font-medium">{data.username}</div>
                  </div>
                </Flex>
                <SecondaryMenu
                  key={data.id}
                  mediaData={data}
                  currentUid={launchParams.initData?.user?.id ?? 0}
                />
              </Flex>
              <Box minH="200px" position="relative">
                <div className="grid grid-cols-3 gap-1 max-w-[400px]">
                  {data.media.map((i, ind) => (
                    <Image
                      src={i}
                      alt={data.title}
                      width={128}
                      height={128}
                      key={i}
                      images={data.media}
                      currentIndex={ind}
                      onClick={() => handleImageClick(data.media, ind)}
                      rect
                    />
                  ))}
                </div>
                {data.price > 0 && data.id != postId && (
                  <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
                )}
              </Box>
              <Flex px={4} py={3} alignItems={'center'} justifyContent={'space-between'}>
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
                  <Flex as={'button'} alignItems={'center'} ml={4} borderRadius={5}>
                    <IconCommit />
                    <Text fontSize={'sm'} color={'#E0E2F6'} pl={1}>
                      {data.comment ?? 0}
                    </Text>
                  </Flex>
                </Flex>
                <IconButton
                  onClick={() => {
                    getShareLink(data.title, data.id, data.uid, 'shares')
                    toggle()
                  }}
                  aria-label="share"
                  background={'transparent'}
                  colorScheme={'transparent'}
                  h={6}
                  w={6}
                  icon={<IconShare />}
                />
              </Flex>
              <Box px={4}>
                <Text color={'#62636F'} fontSize={'sm'} lineHeight={6}>
                  {data.title}
                </Text>
                <Text color={'#424048'} fontSize={'xs'} pt={2}>
                  {dayjs(data.created_at).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Box>
            </Box>
          )
        } else {
          return (
            <Box background={'#0D0D0D'} pt="32px" key={index}>
              <Flex px={4} py={3} alignItems={'center'} justifyContent={'space-between'}>
                <Flex alignItems={'center'}>
                  <div className="flex items-center justify-between gap-2">
                    <Image rect width={48} height={48} src={data.avatar} alt={data.username} />
                    <div className="text-[#E0E2F6] font-medium">{data.username}</div>
                  </div>
                </Flex>
                <SecondaryMenu
                  key={data.id}
                  mediaData={data}
                  currentUid={launchParams.initData?.user?.id ?? 0}
                />
              </Flex>
              <Box minH="200px">
                {data.type === 1 ? (
                  data.price > 0 ? (
                    <Box position="relative">
                      <Image
                        src={data.media?.[0] ?? data?.media ?? ''}
                        alt={data.title}
                        width={387}
                        height={387}
                        onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
                      />
                      {data.id != postId && (
                        <FrostedGlass
                          price={data.price}
                          post_id={data.id}
                          resourcesEve={resourcesEve}
                        />
                      )}
                    </Box>
                  ) : (
                    <Image
                      src={data.media?.[0] ?? data?.media ?? ''}
                      alt={data.title}
                      width={387}
                      height={387}
                      onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
                    />
                  )
                ) : data.price > 0 ? (
                  <Box position="relative">
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      style={{ display: preloaded[index] ? 'block' : 'none', width: '100%' }}
                      controls={false}
                      muted={isMuted}
                      loop
                      playsInline
                      onPlay={() => handlePlay(index)}
                    />
                    {data.id != postId && (
                      <FrostedGlass
                        price={data.price}
                        post_id={data.id}
                        resourcesEve={resourcesEve}
                      />
                    )}
                  </Box>
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    style={{ display: preloaded[index] ? 'block' : 'none', width: '100%' }}
                    controls={false}
                    muted={isMuted}
                    loop
                    playsInline
                    onPlay={() => handlePlay(index)}
                  />
                )}
              </Box>

              <Flex px={4} py={3} alignItems={'center'} justifyContent={'space-between'}>
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
                  <Flex as={'button'} alignItems={'center'} ml={4} borderRadius={5}>
                    <IconCommit />
                    <Text fontSize={'sm'} color={'#E0E2F6'} pl={1}>
                      {data.comment ?? 0}
                    </Text>
                  </Flex>
                </Flex>
                <IconButton
                  onClick={() => {
                    getShareLink(data.title, data.id, data.uid, 'shares')
                    toggle()
                  }}
                  aria-label="share"
                  background={'transparent'}
                  colorScheme={'transparent'}
                  h={6}
                  w={6}
                  icon={<IconShare />}
                />
              </Flex>

              <Box px={4}>
                <Text color={'#62636F'} fontSize={'sm'} lineHeight={6}>
                  {data.title}
                </Text>
                <Text color={'#424048'} fontSize={'xs'} pt={2}>
                  {dayjs(data.created_at).format('YYYY-MM-DD HH:mm')}
                </Text>
              </Box>
            </Box>
          )
        }
      })}
      <ImagePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        images={previewImages}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
      {/* Components */}
      {renderBaseModal()}
    </>
  )
}

export default ResourceList
