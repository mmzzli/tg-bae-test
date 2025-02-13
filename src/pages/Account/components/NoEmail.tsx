import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useNavigate } from 'react-router-dom'
import useTheme from '@/stores/userStore/hooks/useTheme'
import Container from '@/components/Container'
import { TButton } from '@/components/tmd'

const NoEmailLightSvg = '/assets/imgs/login/no_email_light.svg'
const NoEmailDarktSvg = '/assets/imgs/login/no_email_dark.svg'

const NoEmail = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  return (
    <>
      <BackButton onClick={() => navigate(-1)}></BackButton>
      <Container className="h-full justify-between bg-bg1 px-[20px] pb-[16px] pt-[20px]">
        <div className="relative flex size-full flex-col items-center ">
          <img
            className="size-[200px]"
            src={theme === 'light' ? NoEmailLightSvg : NoEmailDarktSvg}
          />
          <h3 className="flex items-center text-h3 font-semibold text-t1">
            Oops! You Have Not Linked A Backup Email
          </h3>
        </div>
        <TButton size="large" block onClick={() => navigate(-1)}>
          Continue
        </TButton>
      </Container>
    </>
  )
}

export default NoEmail
