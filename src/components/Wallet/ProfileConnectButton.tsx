import { useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import ConnectModal from './ConnectModal'
import { CustomToast, typeOptions } from '../comm/Toast'
import BaseButton from '../BaseButton/BaseButton'
import { useAccount } from '@/pages/Wallet/utils/walletProvider'
import { useTokenStore } from '@/store/wallet/walletToken'
import { useUserStore } from '@/store/wallet/walletUser'
import AdaptiveNumber, { NumberType } from '@/pages/Wallet/components/AdaptiveNumber'

interface BalanceInfo {
  totalBalanceUsd: string
  totalCount: number
  assets: Array<any>
}

const ProfileConnectButton = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { status, address } = useAccount()
  const { tokenList } = useTokenStore()
  const { walletUserInfo } = useUserStore()
  const connectModalRef = useRef<{ someMethod: () => void }>(null)

  const totalBal = useMemo(() => {
    return tokenList
      .map((token) => {
        return (token?.price || 0) * Number(token?.formatted ?? 0)
      })
      .reduce((accToken, curToken) => {
        return (accToken || 0) + curToken
      }, 0)
  }, [tokenList])

  const handleConnect = async () => {
    if (status === 'disconnected') {
      connectModalRef.current?.someMethod()
    } else {
      toast({
        render: () => {
          return <CustomToast title="Connecting..." type={typeOptions.info} />
        },
        position: 'bottom',
      })
    }
  }

  const LoginButton = () => {
    return status === 'disconnected' ? (
      <BaseButton
        text="Connect wallet"
        className="h-[48px] mb-[24px] mx-auto "
        icon={<i className="iconfont icon-wallet-line" style={{ fontSize: '20px' }}></i>}
        handler={() => {
          handleConnect()
        }}
      />
    ) : null
  }

  const LoginedButton = useMemo(() => {
    return (
      status === 'connected' &&
      address && (
        <div className="w-full flex justify-between gap-4 mb-[15px]">
          <div
            className="flex-1 h-[48px] relative no-tap flex items-center justify-between gap-2 bg-[#F7F9FC] rounded-[42px] text-[#333333] dark:text-[#E0E2F6] text-sm font-medium cursor-pointer px-[16px]"
            onClick={() => {
              navigate('/wallet')
            }}
          >
            <div>
              <i
                className="iconfont icon-logout-box-r-line text-[#333333]"
                style={{ fontSize: '20px' }}
              />
              <span className="font-[500] truncate">
                {walletUserInfo?.nickname || walletUserInfo.username || walletUserInfo.email}
              </span>
            </div>
            <div className="w-full flex items-center justify-end">
              <span className="font-[500] truncate">
                <AdaptiveNumber value={totalBal} type={NumberType.USD} />
              </span>
            </div>
          </div>
        </div>
      )
    )
  }, [status, address])

  return (
    <div>
      <LoginButton />
      <ConnectModal ref={connectModalRef} afterConnect={() => {}} />
      {LoginedButton}
    </div>
  )
}

export default ProfileConnectButton
