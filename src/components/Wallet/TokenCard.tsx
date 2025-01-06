import { supportEVMTokenList } from '@/config/wagmi-config'
import PriceService from '@/utils/wallet/PriceService'
import { formatUnits } from 'viem'
import { useBalance } from 'wagmi'
import { useAccount } from 'wagmi'

interface TokenCardProps {
  token: (typeof supportEVMTokenList)[0]
  onTokenSelect: (
    token: (typeof supportEVMTokenList)[0],
    balance: ReturnType<typeof useBalance>['data']
  ) => void
}

export const TokenCard = ({ token, onTokenSelect }: TokenCardProps) => {
  const { address } = useAccount()

  const { data: balance } = useBalance({
    query: {
      retry: 3,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
    address,
    ...(token.isNative
      ? { chainId: token.chainId }
      : { token: token.address as `0x${string}`, chainId: token.chainId }),
  })

  const balanceValue = balance
    ? Number(formatUnits(balance.value, balance.decimals)).toString().split('.')[1]?.length > 5
      ? Number(formatUnits(balance.value, balance.decimals)).toFixed(5)
      : Number(formatUnits(balance.value, balance.decimals))
    : 0

  const price = PriceService.getInstance().getPrice(token.token) || 0

  const usdValue = +balanceValue * price
  const usdValueFormat = usdValue
    ? Number(usdValue).toString().split('.')[1]?.length > 5
      ? Number(usdValue).toFixed(5)
      : Number(usdValue)
    : 0

  return (
    <div
      className="flex justify-between items-center h-[74px]"
      onClick={() => onTokenSelect(token, balance)}
    >
      <div className="flex items-center gap-2">
        <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
          <img src={token.icon} alt={token.token} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-[16px] font-medium text-[#12122A]">
            {token.chainName}-{token.token}
          </span>
          <span className="text-[12px] font-normal text-[#616184]">{balanceValue}</span>
        </div>
      </div>

      <div className="text-[16px] font-medium text-[#12122A]">${usdValueFormat}</div>
    </div>
  )
}
