import { IconHistory } from '@/components/tmd/icons/history'
import { IconReceive } from '@/components/tmd/icons/receive'
import { IconSend } from '@/components/tmd/icons/send'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

const WalletMenus = ({ className }: { className?: string }) => {
  const navigate = useNavigate()

  const iconList = [
    {
      icon: (
        <button className="size-12 bg-bg3 rounded-full">
          <IconSend className="size-6 text-b1" />
        </button>
      ),
      title: 'Send',
      handle: () => navigate('/wallet/send/select-token'),
    },
    {
      icon: (
        <button className="size-12 bg-bg3 rounded-full">
          <IconReceive className="size-6 text-b1" />
        </button>
      ),
      title: 'Receive',
      handle: () => navigate('/wallet/receive/select-token'),
    },
    {
      icon: (
        <button className="size-12 bg-bg3 rounded-full">
          <IconHistory className="size-6 text-b1" />
        </button>
      ),
      title: 'History',
      handle: () => {
        navigate('/wallet/history')
      },
    },
  ]

  return (
    <div className={clsx('flex items-center justify-center gap-12', className)}>
      {iconList.map((item, index) => (
        <div
          className="flex flex-col items-center justify-center gap-2 cursor-pointer"
          key={index}
          onClick={item.handle}
        >
          {item.icon}
          <span className="text-xs font-normal text-t1">{item.title}</span>
        </div>
      ))}
    </div>
  )
}

export default WalletMenus
