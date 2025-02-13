import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useNavigate } from 'react-router-dom'
import useTheme from '@/stores/userStore/hooks/useTheme'
import { TButton } from '@/components/tmd'
import { Container } from '@/components/tmd/container/Container'

const FreezeLightSvg = '/assets/imgs/login/freeze_light.svg'
const FreezeDarktSvg = '/assets/imgs/login/freeze_dark.svg'

const Freeze = () => {
  const navigate = useNavigate()
  const { theme } = useTheme()
  return (
    <>
      <BackButton onClick={() => navigate(-1)}></BackButton>
      <Container className="flex h-full flex-col justify-between bg-bg1 pb-[16px] pt-[20px]">
        <div className="relative flex size-full flex-col items-center ">
          <img
            className="size-[200px]"
            src={theme === 'light' ? FreezeLightSvg : FreezeDarktSvg}
          />
          <h3 className="mt-[16px] flex items-center text-h2 font-semibold text-t1">
            Account freeze
          </h3>
          <p className="mt-[8px] text-sm text-t3">
            Frozen. Please try again after the next day (UTC+0).
          </p>
        </div>
        <TButton size="large" onClick={() => navigate(-1)}>
          Continue
        </TButton>
      </Container>
    </>
  )
}

export default Freeze
