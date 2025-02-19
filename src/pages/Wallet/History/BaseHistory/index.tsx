import { UseTransactionsProps } from '@/store/wallet/hooks/useTransactions'
import Header from './Header'
import List from './List'

export enum BaseHistoryType {
  SWAP = 'swap',
  DETAIL = 'detail',
  ALL = 'all'
}
const BaseHistory = ({
  type = BaseHistoryType.ALL,
  chainId,
  address,
  showHeader = true
}: {
  type: BaseHistoryType | undefined
  chainId?: UseTransactionsProps['chain_id']
  address?: UseTransactionsProps['address']
  showHeader?: boolean
}) => {
  return (
    <div className="flex size-full flex-col">
      {showHeader && <Header type={type} />}
      <div className="no-scrollbar flex-1 grow overflow-y-auto">
        <List chainId={chainId} address={address} type={type} />
      </div>
    </div>
  )
}

export default BaseHistory
