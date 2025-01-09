import { useRef, useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { config } from '@/config/wagmi-config'
import { useNavigate } from 'react-router-dom'
import { useBoolean, useToast } from '@chakra-ui/react'

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
  const { status, address, chainId, isConnected } = useAccount()
  const { getAccountBalance } = useAnkrWeb3()
  const [isBaseModalOpen, { toggle, on, off }] = useBoolean(false)

  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    totalBalanceUsd: '0',
    totalCount: 0,
    assets: [],
  })
  const connectModalRef = useRef<{ someMethod: () => void }>(null)
  const { connect, connectors } = useConnect({ config })
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()

  const handleConnect = async () => {
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

  // 自动重连逻辑
  // useEffect(() => {
  //   console.info(isConnected, connectors, '------->isConnected')
  //   if (!isConnected && connectors.length > 0) {
  //     const defaultConnector = connectors.find((connector) => connector.ready)
  //     if (defaultConnector) {
  //       connect({ connector: defaultConnector })
  //     }
  //   }
  // }, [isConnected, connectors, connect])

  // useEffect(() => {
  //   const x  = getWalletInfo()
  //   console.log(x, '------->x')
  // }, [address])

  useEffect(() => {
    const getBalance = async () => {
      if (!address) return
      const balance = await getAccountBalance({ walletAddress: address })
      console.log(balance, '------->balance')
      setBalanceInfo(balance)
    }
    getBalance()
  }, [address])

  return (
    <div>
      {!isConnected ? (
        <BaseButton
          text="Connect wallet"
          className="h-[48px] mb-[24px] w-[343px] mx-auto"
          icon={
            <i className="iconfont wallet-line text-[#333333]" style={{ fontSize: '20px' }}></i>
          }
          handler={() => {
            handleConnect()
          }}
        />
      ) : null}
      <ConnectModal ref={connectModalRef} afterConnect={() => {}} />
      {status === 'connected' && address && (
        <div
          className="h-[48px] relative no-tap flex items-center justify-between gap-2 bg-[#F7F9FC] rounded-[42px] text-[#333333] dark:text-[#E0E2F6] text-sm font-medium cursor-pointer px-[16px]"
          onClick={() => {
            on()
            // navigate('/profile/myWallet')
          }}
        >
          <div className="flex items-center gap-2">
            <img src={TomoSvg} alt="" />
            <span>{initData?.user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* <div>{formatNumberWithCommas(balanceInfo.totalBalanceUsd)}</div> */}
            <i
              className="iconfont icon-icon_arrow_right text-[#333333]"
              style={{ fontSize: '20px' }}
            ></i>
          </div>
        </div>
      )}
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={off}
        height={'25vh'}
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="w-[100%]">
          <BaseButton
            className="mb-[16px] h-[48px] dark:bg-[#6a5cfc] bg-[#D1D0DE] cursor-not-allowed text-white border-[#D1D0DE]"
            disabled={true}
            text="Launch To Wallet(coming soon)"
            handler={() => {
              openLink('tg://resolve?domain=tomowalletbot&appname=&startapp')
            }}
          />
          <BaseButton
            className="bg-[#F7F9FC] text-[#333333] h-[48px]"
            text="Disconnect"
            handler={() => {
              disconnect()
              off()
            }}
          />
        </div>
      </BaseModal>
    </div>
  )
}

export default ProfileConnectButton
