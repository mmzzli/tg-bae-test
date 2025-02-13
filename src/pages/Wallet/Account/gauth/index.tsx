import { useNavigate } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { Outlet } from 'react-router-dom'

export default function AccountAddress() {
  const navigate = useNavigate()

  return (
    <>
      <BackButton onClick={() => navigate(-1)} />
      <div className={`h-screen font-['Switzer'] overflow-y-auto`}>
        <Outlet />
      </div>
    </>
  )
}
