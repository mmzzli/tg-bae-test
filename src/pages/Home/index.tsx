import { useEffect, type FC, useRef, useState } from 'react'
import { HStack, Heading, Image, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { AddIcon1 } from '@/assets/icons'
import { COMMUNITY_LINK } from '@/utils/constants'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import RecommendList from '@/components/RecommendList/RecommendList'
import BaseButton from '@/components/BaseButton/BaseButton'
const HomePage: FC = () => {
  const navigate = useNavigate()
  const { shareLink } = useTMAUtils()
  // const { startParam } = retrieveLaunchParams()
  // const { token, setSharedPostList, setOthersUserInfo } = useStore((state) => ({
  //   setSharedPostList: state.setSharedPostList,
  //   setOthersUserInfo: state.setOthersUserInfo,
  //   token: state.token,
  // }))
  const selectedPostsRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('Following')
  const [fadeClass, setFadeClass] = useState('fade-in');

  // const handleNavigate = async (ref: string) => {
  //   if (!token) {
  //     console.log('waiting for token...')
  //     setTimeout(() => {
  //       handleNavigate(ref)
  //     }, 100)
  //     return
  //   }
  //   console.log('token ready, navigating...')
  //   // Get Ref Data
  //   try {
  //     const data = await getSingleMedia(ref)
  //     console.log('getSingleMedia', data)
  //     if (data.type === SHARE_POST) {
  //       setSharedPostList(data.media)
  //       navigate(`/shares?ref=${ref}`)
  //     } else if (data.type === SHARE_PROFILE) {
  //       setOthersUserInfo({ ...data.userInfo, uid: data.userInfo.user_id })
  //       navigate(`/profile/${data.userInfo.uid || data.userInfo.user_id}`)
  //     }
  //   } catch (error) {
  //     console.warn('API ERROR', error)
  //   }
  // }

  // useEffect(() => {
  //   if (!isInTMA || !startParam || history.length > 2) return
  //   const params = startParam.split('_')
  //   console.log('startParam', params)

  //   params.forEach((p) => {
  //     const pairs = p.split('=')
  //     if (pairs[0] === 'ref' && pairs[1]) {
  //       handleNavigate(pairs[1])
  //     }
  //   })
  // }, [startParam, isInTMA])
  const styles = {
    fadeIn: {
      opacity: 1,
      transition: 'opacity 0.3s ease-in',
    },
    fadeOut: {
      opacity: 0,
      transition: 'opacity 0.3s ease-out',
    },
  };
  useEffect(() => {
    const handleScroll = () => {
      if (selectedPostsRef.current) {
        const rect = selectedPostsRef.current.getBoundingClientRect();
        const isVisible = rect.top < 0;

        if (isVisible && title !== 'Selected Posts') {
          triggerTitleChange('Selected Posts');
        } else if (!isVisible && title !== 'Following') {
          triggerTitleChange('Following');
        }
      }
    };

    const scrollableDiv = document.getElementById('recommendScrollableDiv');
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll);
      }
    };
  }, [title]);

  const triggerTitleChange = (newTitle:string) => {
    setFadeClass('fade-out');
    setTimeout(() => {
      setTitle(newTitle);
      setFadeClass('fade-in');
    }, 300);
  };
  return (
    <div className="relative w-full h-full overflow-auto" id="recommendScrollableDiv">
      <HStack
        justifyContent="space-between"
        p="10px 16px"
        position="fixed"
        w="100%"
        bg="#000"
        zIndex="111"
      >
        <Heading as="h3" fontSize="20px" color="#E0E2F6" style={fadeClass === 'fade-in' ? styles.fadeIn : styles.fadeOut}>
          {title}
        </Heading>
        <BaseButton
          text="Create"
          icon={<Image src={AddIcon1} />}
          width="87px"
          handler={() => navigate('/post')}
        />
      </HStack>
      <div className="mx-auto w-full text-center pt-[92px]">
        <p className="text-[#62636F]">Join our community to meet creators</p>
        <p className="text-[#62636F]">and start to follow them</p>
      </div>
      <div className="mt-[28px] mb-[48px] text-center">
        <Button
          variant="primary-dark-border"
          m="auto"
          w="126px"
          h="40px"
          onClick={() => shareLink(COMMUNITY_LINK)}
        >
          Community
        </Button>
      </div>
      {/* <button
        onClick={() => shareLink(COMMUNITY_LINK)}
        className="text-[14px] py-[14px] px-6 w-[126px] h-[40px] bg-[#4A3AFF] rounded-[32px] flex items-center justify-center font-medium text-[#fff] mx-auto mt-[28px] mb-12"
      >
        Community
      </button> */}
      <div className="px-4">
        <h3 className="text-[#E0E2F6] font-bold text-xl" ref={selectedPostsRef}>
          Selected Posts
        </h3>
      </div>
      <RecommendList />
    </div>
  )
}
export default HomePage
