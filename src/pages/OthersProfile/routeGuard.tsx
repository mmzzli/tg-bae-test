import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '@/store'
import { DefaultAvatarIcon } from '@/assets/icons'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { getFollowingList, getSomeoneProfile, getSearchTgidName } from '@/api'

interface ProfileGuardProps {
  children: React.ReactNode
}

const ProfileGuard: FC<ProfileGuardProps> = ({ children }) => {
  const { uid } = useParams()

  const [ready, setReady] = useState(false)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const { othersUserInfo, resetOthersViewList, setOthersUserInfo, resetOthersUserInfo } = useStore()
  const { token, myFollow, setMyFollow } = useStore((state) => ({
    token: state.token,
    myFollow: state.myFollow,
    setMyFollow: state.setMyFollow,
  }))
  useEffect(() => {
    const prepare = async () => {
      try {
        resetOthersViewList()
        resetOthersUserInfo()
        // Reset user info if viewing a different user's profile
        // if (othersUserInfo.uid !== -1 && othersUserInfo.uid !== Number(uid)) {
        //   setOthersUserInfo({
        //     uid: -1,
        //     username: '-',
        //     avatar: DefaultAvatarIcon,
        //     bio: '',
        //     fans: 0,
        //     follower: 0,
        //     user_id: -1,
        //   })
        //   resetOthersViewList()
        // }

        // Fetch user profile data if uid and token are available
        if (uid && token) {
          console.log(uid,123)
          await getSearchTgidName(uid)
          const user = await getSomeoneProfile(Number(uid))
          setOthersUserInfo({ ...user, user_id: user.uid })
        }

        // Get following list if accessed via share link
        if (token && myFollow.length === 0) {
          const followList = await getFollowingList(current_uid)
          setMyFollow(followList)
        }

        setReady(true)
      } catch (error) {
        console.error('Profile preparation failed:', error)
        setReady(true)
      }
    }

    prepare()
  }, [uid, token])

  if (!ready) {
    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center bg-white dark:bg-[#0D0D0D] z-10">
        <i
          className="iconfont icon-loading animate-spin text-[#6254FF]"
          style={{ fontSize: '40px' }}
        ></i>
      </div>
    )
  }

  return <>{children}</>
}

export default ProfileGuard
