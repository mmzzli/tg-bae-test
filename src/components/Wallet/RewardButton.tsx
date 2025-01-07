import { useRef } from 'react'
import { useAccount } from 'wagmi'
import ConnectModal from './ConnectModal'
import { cn } from '@/utils/utils'
import MyTokensModal from './MyTokensModal'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { OthersUserInfo } from '@/types'

const RewardButton = ({
  className,
  userInfo,
}: {
  className?: string
  userInfo: OthersUserInfo
}) => {
  const toast = useToast()
  const myTokensModalRef = useRef<{ someMethod: () => void }>(null)
  const { address, chain, status } = useAccount()

  const connectModalRef = useRef<{ someMethod: () => void }>(null)
  const handleReward = async () => {
    console.log('status', status)
    console.log('address', address)
    console.log('chain', chain)
    if (status === 'disconnected') {
      connectModalRef.current?.someMethod()
    } else if (status === 'connected') {
      myTokensModalRef.current?.someMethod()
    } else {
      toast({
        render: () => {
          return <CustomToast title="Connecting..." type={typeOptions.info} />
        },
        position: 'bottom',
      })
    }
  }

  const handleAfterConnect = () => {
    status === 'connected' && address && myTokensModalRef.current?.someMethod()
  }

  return (
    <div>
      <div className={cn('flex items-center justify-center', className)}>
        <i
          className="iconfont icon-bit-coin-line"
          style={{ fontSize: '28px' }}
          onClick={() => handleReward()}
        ></i>
      </div>
      <ConnectModal ref={connectModalRef} afterConnect={handleAfterConnect} />
      {status === 'connected' && address && (
        <MyTokensModal ref={myTokensModalRef} userInfo={userInfo} />
      )}
    </div>
  )
}

export default RewardButton
