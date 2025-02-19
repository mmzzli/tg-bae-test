import BaseButton from '@/components/BaseButton/BaseButton'
// import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useNavigate } from 'react-router-dom'
import FreezeLightSvg from '@/components/tmd/svgs/freeze_light.svg'
import FreezeDarktSvg from '@/components/tmd/svgs/freeze_dark.svg'

const Freeze = () => {
  const navigate = useNavigate()
  // const { theme } = useTheme()
  const theme = 'light'
  return (
    <>
      {/* <BackButton onClick={() => navigate(-1)}></BackButton> */}
      <div className="flex size-full flex-col justify-between bg-bg1 px-[20px] pb-[16px] pt-[20px]">
        <div className="relative flex size-full flex-col items-center ">
          <img className="size-[200px]" src={theme === 'light' ? FreezeLightSvg : FreezeDarktSvg} />

          <h3 className="mt-[16px] flex items-center text-h2 font-semibold text-t1">
            Account freeze
          </h3>
          <p className="mt-[8px] text-sm text-t3">
            Frozen. Please try again after the next day (UTC+0).
          </p>
        </div>

        <div className="w-full">
          <BaseButton handler={() => navigate(-1)} text="Continue" height="52px" />
        </div>
      </div>
    </>
  )
}

export default Freeze
