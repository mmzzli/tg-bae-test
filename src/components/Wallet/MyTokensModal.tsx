import { forwardRef, useImperativeHandle } from 'react'
import { useBoolean } from '@chakra-ui/react'

import { BaseModal } from '@/components/Modal/BaseModal'
import { supportEVMTokenList } from '@/config/wagmi-config'
import { useBalance } from 'wagmi'
import SendRewardPage from './SendRewardPage'
import { useStore } from '@/store/store'
import { OthersUserInfo } from '@/types'
import { TokenCard } from './TokenCard'
// import { CustomToast, typeOptions } from '../comm/Toast'

interface ChildMethods {
  someMethod: () => void
}

const MyTokensModal = forwardRef<ChildMethods, { userInfo: OthersUserInfo }>(
  ({ userInfo }, ref) => {
    // const toast = useToast()

    useImperativeHandle(ref, () => ({
      someMethod: () => {
        toggle()
      },
    }))

    const { setVirtualRoutePage, virtualRoutePage } = useStore((state) => ({
      setVirtualRoutePage: state.setVirtualRoutePage,
      virtualRoutePage: state.virtualRoutePage,
    }))

    const onTokenSelect = (
      token: (typeof supportEVMTokenList)[0],
      balance: ReturnType<typeof useBalance>['data']
    ) => {
      if (import.meta.env.VITE_APP_ENV === 'production') {
        // toast({
        //   render: () => {
        //     return <CustomToast title="Coming soon" type={typeOptions.info} />
        //   },
        //   position: 'bottom',
        // })
        return
      }
      setVirtualRoutePage({
        name: 'SendRewardPage',
        params: {
          ...token,
          balance,
          ...userInfo,
        },
        enterFrom: '/chat/' + userInfo.uid,
      })
    }

    const [isBaseModalOpen, { toggle, off }] = useBoolean(false)

    console.log('MyTokensModal', isBaseModalOpen)

    return (
      <>
        <BaseModal
          isOpen={isBaseModalOpen}
          onClose={off}
          height="70vh"
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
          <div className="flex flex-col w-full">
            <div className="mt-1 w-full">
              <h3 className="font-bold text-2xl mb-[14px] text-[24px] text-[#333]">Select Token</h3>
              <div className="m-4"></div>
            </div>
            <div className="flex flex-col">
              {supportEVMTokenList.map((token) => {
                return (
                  <TokenCard
                    key={token.chainId + token.token}
                    token={token}
                    onTokenSelect={onTokenSelect}
                  />
                )
              })}
            </div>
          </div>
        </BaseModal>
        {virtualRoutePage?.name === 'SendRewardPage' && <SendRewardPage />}
      </>
    )
  }
)

export default MyTokensModal
