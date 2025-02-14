import WalletAvatar from './WalletAvatar'
import { shortenAddress } from '@/store/wallet/util'

export default function AddressItem({
  address,
  onClick
}: {
  address: string
  onClick: (address: string) => void
}) {
  return (
    <div
      className="mt-[24px] flex items-center"
      onClick={() => onClick(address)}
    >
      <div className="size-[40px]">
        <WalletAvatar size={40} address={address} />
      </div>
      <div className="ml-[8px] flex flex-col ">
        <div className="text-sm font-medium text-t1">
          {shortenAddress(address)}
        </div>
        <div style={{ overflowWrap: 'anywhere' }} className=" text-xs text-t3">
          {address}
        </div>
      </div>
    </div>
  )
}
