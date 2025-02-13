import { Link } from 'react-router-dom'
import useTheme from '@/stores/userStore/hooks/useTheme'
import { TButton } from '@/components/tmd'

const EmailLightSvg = '/assets/imgs/login/email_light.svg'
const EmailDarktSvg = '/assets/imgs/login/email_dark.svg'
const Backup = ({
  onConfirm,
  onSkip
}: {
  onConfirm: (() => void) | undefined
  onSkip: (() => void) | undefined
}) => {
  const { theme } = useTheme()
  return (
    <>
      <div className="mt-[60px] flex flex-1 flex-col items-center gap-[16px] text-xl">
        <img
          className="size-[200px]"
          src={theme === 'light' ? EmailLightSvg : EmailDarktSvg}
        />

        <div className="items-left flex flex-col justify-center">
          <span className="text-h2 font-semibold text-t1">
            Add recovery email
          </span>
          <p className="mt-[8px] text-sm text-t3">
            To ensure you can recover your password if you ever forget it,
            please add your email to your account now. Without a linked email,
            you may not be able to regain access to your account or the assets
            in your wallet. Please understand that our ability to assist in such
            situations may be limited.
          </p>
        </div>
      </div>
      <div className="mb-[8px] w-full flex-none text-xl">
        <Link to="/account/recovery-email">
          <TButton block size="large" onClick={onConfirm}>
            Confirm
          </TButton>
        </Link>

        {/* <div className="mb-[8px] mt-[12px]">
          <TButton block size="large" theme="ghost" onClick={onSkip}>
            Skip
          </TButton>
        </div> */}
      </div>
    </>
  )
}

export default Backup
