import Image from '@/components/Image/Image'
import { useStore } from '@/store/store'
import { TransferPanel } from './TransferPanel'
import { isMobileDevice } from '@/utils/utils'
import TokenIcon from './TokenIcon'
import PriceService from '@/utils/wallet/PriceService'
import { userefetchBalance } from '@/pages/Wallet/utils/walletProvider'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
const SendRewardPage = () => {
  const { virtualRoutePage, resetVirtualRoutePage } = useStore((state) => ({
    virtualRoutePage: state.virtualRoutePage,
    resetVirtualRoutePage: state.resetVirtualRoutePage,
  }))
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
  const incomeToken: AssetsToken | undefined = useStore().tokenList.find(
    (i) =>
      i.address === (balance as AssetsToken).address &&
      i.chainId === (balance as AssetsToken).chainId &&
      i.symbol === (balance as AssetsToken).symbol
  )

  const { refreshTokenStore } = userefetchBalance()

  // const { data: accountBalance, refetch: refetchBalance } = useBalance({
  //   query: {
  //     enabled: false,
  //     retry: 3,
  //     retryDelay: 1000,
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: true,
  //     refetchOnReconnect: false,
  //     refetchInterval: 20000,
  //   },
  //   address: account,
  //   ...(token.isNative
  //     ? { chainId: token.chainId }
  //     : { token: address as `0x${string}`, chainId: token.chainId }),
  // })

  // const formattedBalance = useMemo(() => {
  //   return formatNumber(accountBalance?.formatted || balance.formatted, {
  //     thousandsSeparator: ',',
  //   })
  // }, [accountBalance, balance])

  const handleAmountChange = (amount: string) => {
    if (amount === '') {
      refreshTokenStore()
    }
  }

  // useEffect(() => {
  //   refetchBalance()
  // }, [])

  // useEffect(() => {
  //   refetchBalance()
  // }, [currentChainId])
  const price = PriceService.getInstance().getPrice(token)
  return (
    <div
      className="fixed top-0 left-0 bottom-0 right-0 bg-white z-[10000] px-[20px] prevent-touch-back"
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
            <span className="whitespace-nowrap">{incomeToken?.formatted}</span>
          </div>
        </div>

        <TransferPanel
          balance={BigInt(incomeToken?.balance || 0)}
          symbol={token}
          decimals={incomeToken?.decimals || 18}
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

export default SendRewardPage
