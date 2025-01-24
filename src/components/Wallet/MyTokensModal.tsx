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
        // return
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
          <div className="absolute top-[60px] left-6 right-0 pt-[48px] bottom-0">
            <div className="absolute top-0 left-0 right-0 bg-[#fff]">
              <h3 className="font-bold text-2xl mb-[14px] text-[24px] text-[#333]">Select Token</h3>
              <div className="m-4"></div>
            </div>
            <div className="absolute top-[48px] left-0 right-0 pr-6 bottom-0 flex flex-col overflow-y-auto no-scrollbar">
              {supportEVMTokenList.map((token) => {
                return (
                  <TokenCard
                    key={token.chainId + token.token}
                    token={token}
                    onTokenSelect={onTokenSelect}
                  />
                )
              })}
              <div className="min-h-[48px]"></div>
            </div>
          </div>
        </BaseModal>
        {virtualRoutePage?.name === 'SendRewardPage' && (
          <div className="transition-opacity duration-500 opacity-100 fixed z-[10000]">
            <SendRewardPage />
          </div>
        )}
      </>
    )
  }
)

export default MyTokensModal
