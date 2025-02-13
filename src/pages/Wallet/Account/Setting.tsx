import { BackButton } from '@vkruglikov/react-telegram-web-app'
import SecuritySettings from './components/SecuritySettings'
import { useNavigate } from 'react-router-dom'

const SettingPage = () => {
  const navigate = useNavigate()
  return (
    <>
      <BackButton onClick={() => navigate(-1)}></BackButton>
      <SecuritySettings />
    </>
  )
}

export default SettingPage
