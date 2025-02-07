import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useBoolean } from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { config } from '@/config/wagmi-config'
import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '@/components/Image/Image'
import { TomoIcon } from '@/assets/icons'

const WalletIcon = () => {
  return (
    <div
      className="relative mr-[4px]"
      style={{
        width: '28px',
        height: '28px',
      }}
    >
      <Image src={TomoIcon} rect type="avatar" width={28} height={28} />
      <div className="absolute bottom-[2px] -right-1 w-[16px] h-[16px] bg-[#2badff] rounded-full flex items-center justify-center border border-solid border-[#fff]">
        <i className="iconfont icon-a-Frame2085661744 text-[12px] mt-1 text-[#fff]" />
      </div>
    </div>
  )
}

interface ChildMethods {
  someMethod: () => void
}

interface Props {
  afterConnect?: () => void
}

const ConnectModal = forwardRef<ChildMethods, Props>(({ afterConnect }, ref) => {
  useImperativeHandle(ref, () => ({
    someMethod: () => {
      toggle()
    },
  }))

  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const awaitConnectRef = useRef(false)
  const { connect } = useConnect({ config })
  const { disconnect } = useDisconnect()
  const { status: accountStatus } = useAccount()

  useEffect(() => {
    if (accountStatus === 'connected' && awaitConnectRef.current) {
      off()
      afterConnect?.()
      awaitConnectRef.current = false
    }
  }, [accountStatus, awaitConnectRef.current])

  return (
    <>
      <BaseModal
        isOpen={isBaseModalOpen}
        onClose={() => {
          if (accountStatus !== 'connected') {
            disconnect()
          } else if (accountStatus === 'connected') {
            afterConnect?.()
          }
          off()
        }}
        height="289px"
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
        <div className="mt-1 w-full">
          <h3 className="font-bold text-2xl mb-[14px] text-[24px] text-[#333]">Connect wallet</h3>
          <div className="text-[15px] text-[#999] font-normal">
            Connect your wallet to send crypto directly to your favorite creator via direct message.
          </div>
          <div className="mt-10 mx-4">
            <BaseButton
              text="TOMO Wallet"
              height="48px"
              loading={accountStatus === 'connecting'}
              icon={<WalletIcon />}
              handler={() => {
                awaitConnectRef.current = true
                connect({ connector: injected() })
              }}
            />
          </div>
        </div>
      </BaseModal>
    </>
  )
})

export default ConnectModal
