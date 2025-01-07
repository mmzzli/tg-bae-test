import { chainIconMap, tokenIconMap } from '@/config/token-icon'
import Image from '@/components/Image/Image'

interface TokenIconProps {
  token: string
  chainName: string
  size?: string
}
const ChainName2Icon: Record<string, string> = {
  'DuckChain Testnet': 'ETH',
  'BSC Testnet': 'BNB',
  'Arbitrum One': 'ARB',
  'BNB Smart Chain': 'BNB',
  Ethereum: 'ETH',
  'OP Mainnet': 'OP',
}

const TokenIcon = ({ chainName, token, size = '40px' }: TokenIconProps) => {
  return (
    <div
      className="rounded-full relative"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      <Image src={tokenIconMap[token]} rect type="avatar" width={size} height={size} />
      <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-white rounded-full flex items-center justify-center">
        <Image
          src={chainIconMap[ChainName2Icon[chainName]]}
          rect
          type="avatar"
          width={13}
          height={13}
        />
      </div>
    </div>
  )
}

export default TokenIcon
