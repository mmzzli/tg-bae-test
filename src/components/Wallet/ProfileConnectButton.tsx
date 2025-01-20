import { useRef, useEffect, useState, useMemo } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
// import { config } from '@/config/wagmi-config'
// import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'

import { useAnkrWeb3 } from '@/hooks/useAnkrWeb3'
import ConnectModal from './ConnectModal'
import { CustomToast, typeOptions } from '../comm/Toast'
import BaseButton from '../BaseButton/BaseButton'
import TomoSvg from '@/assets/icons/tomo.svg'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { BaseModal } from '../Modal/BaseModal'

interface BalanceInfo {
  totalBalanceUsd: string
  totalCount: number
  assets: Array<any>
}

const ProfileConnectButton = ({ className }: { className?: string }) => {
  const { launchParams, openLink } = useTMAUtils()
  const { initData } = launchParams
  const toast = useToast()
  const myTokensModalRef = useRef<{ someMethod: () => void }>(null)
  const { status, address, isConnected } = useAccount()
  const { getAccountBalance } = useAnkrWeb3()
  // const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    totalBalanceUsd: '0',
    totalCount: 0,
    assets: [],
  })
  const connectModalRef = useRef<{ someMethod: () => void }>(null)
  // const { connect, connectors } = useConnect({ config })
  const { disconnect } = useDisconnect()
  // const navigate = useNavigate()

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
  useEffect(() => {
    const getBalance = async () => {
      if (!address) return
      const balance = await getAccountBalance({ walletAddress: address })
      setBalanceInfo(balance)
    }
    getBalance()
  }, [address])

  const LoginButton = () => {
    return !isConnected ? (
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
            className="w-[48px] h-[48px] bg-[#F7F9FC] rounded-[50%] flex items-center justify-center"
            onClick={() => {
              disconnect()
            }}
          >
            <i
              className="iconfont icon-logout-box-r-line text-[#333333]"
              style={{ fontSize: '20px' }}
            />
          </div>
          <div
            className="flex-1 h-[48px] relative no-tap flex items-center justify-between gap-2 bg-[#F7F9FC] rounded-[42px] text-[#333333] dark:text-[#E0E2F6] text-sm font-medium cursor-pointer px-[16px]"
            onClick={() => {
              window.open('https://t.me/tomowalletbot/tomo_wallet')
            }}
          >
            <div className="w-full flex items-center justify-center gap-2">
              <img src={TomoSvg} alt="tomo" loading="lazy" className="will-change-transform" />
              <span className="font-[500] truncate">{initData?.user?.username}</span>
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
