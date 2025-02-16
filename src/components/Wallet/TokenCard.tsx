import { supportEVMTokenList } from '@/config/wagmi-config'
import PriceService from '@/utils/wallet/PriceService'
import { formatUnits } from 'viem'
// import { useBalance } from 'wagmi'
// import { useAccount } from 'wagmi'
import TokenIcon from './TokenIcon'
import BigNumber from 'bignumber.js'
import { useAccount, useBalance } from '@/pages/Wallet/utils/walletProvider'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import AdaptiveNumber, { NumberType } from '@/pages/Wallet/components/AdaptiveNumber'

interface TokenCardProps {
  token: (typeof supportEVMTokenList)[0]
  onTokenSelect: (
    token: (typeof supportEVMTokenList)[0],
    balance: AssetsToken | undefined
  ) => void
}

export const TokenCard = ({ token, onTokenSelect }: TokenCardProps) => {
  const { address } = useAccount()

  const balance = useBalance(
    address,
    token.chainId,
    token.address
  )

  const balanceValue = balance?.formatted ?? 0

  const price = balance?.price || 0

  // const usdValue = +balanceValue * price
  // const usdValueFormat = usdValue
  //   ? Number(usdValue).toString().split('.')[1]?.length > 2
  //     ? Number(usdValue).toFixed(2)
  //     : Number(usdValue)
  //   : 0
  const formatToUsd = (value: string, price: number) => {
    if (!price) {
      return '$0'
    }
    const usdValue = new BigNumber(value || '0').multipliedBy(price)
    if (usdValue.eq(0)) {
      return '$0'
    }
    if (usdValue.lt(0.01)) {
      return '<$0.01'
    }
    return `$${usdValue.toFixed(2, 1)}`
  }

  const usdValueFormat = formatToUsd(balanceValue.toString(), price)

  return (
    <div
      className="flex justify-between items-center min-h-[74px]"
      onClick={() => onTokenSelect(token, balance)}
    >
      <div className="flex flex-1 items-center gap-2">
        <TokenIcon token={token.token} chainName={token.chainName} />
        <div className="flex flex-col">
          <span className="text-[16px] font-medium text-[#12122A]">{token.token}</span>
          <span className="text-[12px] font-normal text-[#616184]">
            <AdaptiveNumber type={NumberType.BALANCE} value={balanceValue} decimalSubLen={4} />
          </span>
        </div>
      </div>

      <div className="text-[16px] font-medium text-[#12122A]">{usdValueFormat}</div>
    </div>
  )
}
