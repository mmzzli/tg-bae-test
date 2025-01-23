import Image from '@/components/Image/Image'
import { useStore } from '@/store/store'
import { TransferPanel } from './TransferPanel'
import { isMobileDevice } from '@/utils/utils'
import TokenIcon from './TokenIcon'
import PriceService from '@/utils/wallet/PriceService'
import { useEffect, useMemo } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
const SendRewardPage = () => {
  const { virtualRoutePage, resetVirtualRoutePage } = useStore((state) => ({
    virtualRoutePage: state.virtualRoutePage,
    resetVirtualRoutePage: state.resetVirtualRoutePage,
  }))
  console.log('virtualRoutePage', virtualRoutePage)
  const {
    token,
    balance,
    avatar,
    username,
    address,
    rewardContractAddress,
    chainId,
    chainName,
    uid,
  } = virtualRoutePage?.params || {}

  const { address: account } = useAccount()
  const currentChainId = useChainId()

  const { data: accountBalance, refetch: refetchBalance } = useBalance({
    query: {
      enabled: false,
      retry: 3,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchInterval: 20000,
    },
    address: account,
    ...(token.isNative
      ? { chainId: token.chainId }
      : { token: address as `0x${string}`, chainId: token.chainId }),
  })

  const formattedBalance = useMemo(() => {
    return formatNumber(accountBalance?.formatted || balance.formatted, {
      thousandsSeparator: ',',
    })
  }, [accountBalance, balance])

  const handleAmountChange = (amount: string) => {
    if (amount === '') {
      refetchBalance()
    }
  }

  useEffect(() => {
    refetchBalance()
  }, [])

  useEffect(() => {
    refetchBalance()
  }, [currentChainId])
  const price = PriceService.getInstance().getPrice(token)
  return (
    <div
      className="fixed top-0 left-0 bottom-0 right-0 bg-white z-[9999] px-[20px]"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        paddingBottom:
          'calc(var(--tg-safe-area-inset-bottom) + var(--tg-content-safe-area-inset-bottom))',
      }}
    >
      <div className="flex flex-col items-center pt-[10px]">
        {/* User Info */}
        <div className="flex items-center h-[48px] w-full">
          <div className="w-[32px] h-[32px]">
            <Image
              type="avatar"
              rect
              src={avatar}
              alt="avatar"
              className="w-[32px] h-[32px] rounded-full"
            />
          </div>
          <span className="dark:text-white text-[#333] text-lg ml-2">to {username}</span>

          {!isMobileDevice() && (
            <div
              className="text-[#616184] text-lg ml-auto"
              onClick={() => {
                resetVirtualRoutePage()
              }}
            >
              {'<<'}
            </div>
          )}
        </div>

        {/* Token Balance */}
        <div className="flex items-center justify-center h-[48px] mt-8 min-w-[210px] rounded-full overflow-hidden bg-[#F5F5FA] text-sm mb-7 pl-2 pr-4">
          <div className="w-8 h-8 overflow-hidden mr-2 min-w-8">
            <TokenIcon token={token} chainName={chainName} size="32px" />
          </div>
          <span className="text-[#616184] text-nowrap">Balance :&nbsp;</span>
          <div className="dark:text-white text-[#12122A] text-nowrap">
            <span className="whitespace-nowrap">{formattedBalance}</span>
          </div>
        </div>

        <TransferPanel
          balance={accountBalance?.value || 0n}
          symbol={token}
          decimals={accountBalance?.decimals || 18}
          price={price || 0}
          tokenAddress={address ? address : '0x0000000000000000000000000000000000000000'}
          contractAddress={rewardContractAddress}
          chainId={chainId}
          chainName={chainName}
          toUid={uid}
          onAmountChange={handleAmountChange}
        />
      </div>
    </div>
  )
}

function formatNumber(value: string | number, { thousandsSeparator = ',' } = {}) {
  const num = Number(value)
  if (isNaN(num)) return '0'

  const [int, decimal] = value.toString().split('.')
  const formattedInt = Number(int).toLocaleString('en-US').replace(/,/g, thousandsSeparator)
  return decimal ? `${formattedInt}.${decimal}` : formattedInt
}
export default SendRewardPage
