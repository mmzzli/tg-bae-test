import { useEffect, type FC, useRef, useState } from 'react'
import { HStack, Heading, Image, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { AddIcon1 } from '@/assets/icons'
import { COMMUNITY_LINK } from '@/utils/constants'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import RecommendList from '@/components/RecommendList/RecommendList'
import FollowingList from '@/components/RecommendList/FollowingList'
import BaseButton from '@/components/BaseButton/BaseButton'
const HomePage: FC = () => {
  const navigate = useNavigate()
  const { shareLink } = useTMAUtils()
  const selectedPostsRef = useRef<HTMLDivElement>(null)
  const [title, setTitle] = useState('Following')
  const [fadeClass, setFadeClass] = useState('fade-in')

  const styles = {
    fadeIn: {
      opacity: 1,
      transition: 'opacity 0.3s ease-in',
    },
    fadeOut: {
      opacity: 0,
      transition: 'opacity 0.3s ease-out',
    },
  }
  useEffect(() => {
    const handleScroll = () => {
      if (selectedPostsRef.current) {
        const rect = selectedPostsRef.current.getBoundingClientRect()
        const isVisible = rect.top < 0

        if (isVisible && title !== 'Selected Posts') {
          triggerTitleChange('Selected Posts')
        } else if (!isVisible && title !== 'Following') {
          triggerTitleChange('Following')
        }
      }
    }

    const scrollableDiv = document.getElementById('recommendScrollableDiv')
    if (scrollableDiv) {
      scrollableDiv.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener('scroll', handleScroll)
      }
    }
  }, [title])

  const triggerTitleChange = (newTitle: string) => {
    setFadeClass('fade-out')
    setTimeout(() => {
      setTitle(newTitle)
      setFadeClass('fade-in')
    }, 300)
  }
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
        <Heading
          as="h3"
          fontSize="20px"
          color="#E0E2F6"
          style={fadeClass === 'fade-in' ? styles.fadeIn : styles.fadeOut}
        >
          {title}
        </Heading>
        <BaseButton
          text="Create"
          icon={<Image src={AddIcon1} />}
          width="87px"
          handler={() => navigate('/post')}
        />
      </HStack>
      <FollowingList />
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
