import { TIcon } from '@/components/tmd'
import Backup from '../components/Backup'
import usePopup from '@/hooks/popup/usePopup'

const useBackup = ({
  onSkip,
  onConfirm,
  afterClose
}: {
  onSkip: () => void
  onConfirm?: () => void
  afterClose?: () => void
}) => {
  return usePopup({
    afterClose,
    showCloseButton: false,
    maskGesture: false,
    closeIcon: <TIcon name="tg_wallet_disable text-t1" fontSize="20" />,
    bodyStyle: {
      height: 'calc(100vh - 15px)'
    },
    fullscreen: true,
    contentClassName: 'flex flex-col justify-between',
    content: <Backup onConfirm={onConfirm} onSkip={onSkip} />
  })
}

export default useBackup
