import MyPostsList from './MyPostsList'
import MyOrderList from './MyOrderList'
import MyFavList from './MyFavList'

interface PostListProps {
  type: 'view' | 'payment' | 'fav'
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
      default:
        return null
    }
  }
  return renderList()
}

export default ProfileList
