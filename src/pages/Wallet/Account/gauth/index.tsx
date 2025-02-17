import { useNavigate } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { Outlet } from 'react-router-dom'

export default function AccountAddress() {
  const navigate = useNavigate()

  return (
    <>
      <div className={`h-screen font-['Switzer'] overflow-y-auto`}>
        <Outlet />
      </div>
    </>
  )
}
