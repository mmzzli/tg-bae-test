import MyPostsList from './MyPostsList'
import MyOrderList from './MyOrderList'
import MyFavList from './MyFavList'
import OthersViewList from './OthersViewList'
interface PostListProps {
  type: 'view' | 'payment' | 'fav' | 'othersProfile'
}

const ProfileList = ({ type }: PostListProps) => {
  const renderList = () => {
    switch (type) {
      case 'view':
        return <MyPostsList />
      case 'payment':
        return <MyOrderList />
      case 'fav':
        return <MyFavList />
      case 'othersProfile':
        return <OthersViewList />
      default:
        return null
    }
  }
  return renderList()
}

export default ProfileList
