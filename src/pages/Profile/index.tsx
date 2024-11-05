import { FC } from 'react'
import { Menu } from '@/components/Menu'
import UserProfile from '@/components/PersonalDetails/UserProfile'

import ViewList from '@/components/ViewList/ViewList'

const Profile: FC = () => {
  return (
    <>
      <UserProfile />
      <ViewList />
      <Menu selectedIndex={1} />
    </>
  )
}

export default Profile
