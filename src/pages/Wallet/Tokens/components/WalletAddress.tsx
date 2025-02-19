import { TCopy, TTokenImage } from '@/components/tmd'
import bsc from '@/store/wallet/chains/wagmiConfig/bsc'
import ethereum from '@/store/wallet/chains/wagmiConfig/ethereum'
import solana from '@/store/wallet/chains/wagmiConfig/solana'
import ton from '@/store/wallet/chains/wagmiConfig/ton'
import { IWeb3ChainType } from '@/store/wallet/chainType'
import { useUserStore } from '@/store/wallet/walletUser'

const WalletAddressItem = ({ address, chain }: { address: string; chain: IWeb3ChainType }) => {
  return (
    <div className="p-2 rounded-lg bg-bg2 flex items-center overflow-hidden">
      <TTokenImage
        image={chain.icon}
        symbol={chain.chain?.nativeCurrency?.symbol}
        size={32}
        className="flex-none"
      />

      <div className="overflow-hidden ml-3 mr-6">
        <h3 className="text-b1 text-[18px] leading-[13px] font-semibold">{chain.name}</h3>
        <p className="text-b3 mt-2.5 text-sm">{address}</p>
      </div>

      <TCopy text={address} className="size-5 flex-none" />
    </div>
  )
}

const WalletAddress = () => {
  const {
    walletUserInfo: { solanaAddress, ethereumAddress, tonAddress },
  } = useUserStore()

  const wallets = [
    {
      chain: ethereum,
      address: ethereumAddress,
    },
    {
      chain: bsc,
      address: ethereumAddress,
    },
    {
      chain: solana,
      address: solanaAddress,
    },
    {
      chain: ton,
      address: tonAddress,
    },
  ]

  return (
    <div className="size-full pt-[48px] flex flex-col">
      <h3 className="text-[#333333] text-[24px] leading-normal px-2 w-full">Wallet</h3>

      <div className="space-y-3 mt-[28px]">
        {wallets.map((wallet) => (
          <WalletAddressItem key={wallet.chain.id} chain={wallet.chain} address={wallet.address} />
        ))}
      </div>
    </div>
  )
}

export default WalletAddress
