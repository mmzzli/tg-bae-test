import { BackButton } from '@vkruglikov/react-telegram-web-app'
import EmailCurrent from './components/EmailCurrent'
import { useNavigate } from 'react-router-dom'

const EmailPage = () => {
  const navigate = useNavigate()
  return (
    <>
      <BackButton onClick={() => navigate(-1)}></BackButton>
      <EmailCurrent />
    </>
  )
}

export default EmailPage
