import { UseTransactionsProps } from '@/store/wallet/hooks/useTransactions'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BaseHistory, { BaseHistoryType } from './BaseHistory'

const History = () => {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const typeParam = search.get('type')
  const chainIdParam = search.get('chainId')
  const addressParam = search.get('address')
  const type = (typeParam ? typeParam : undefined) as BaseHistoryType | undefined
  const chainId = (chainIdParam ? Number(chainIdParam) : undefined) as
    | UseTransactionsProps['chain_id']
    | undefined
  const address = (addressParam ? addressParam : undefined) as
    | UseTransactionsProps['address']
    | undefined

  return (
    <div className="size-full flex bg-bg1 px-[20px] pb-[16px] pt-[4px]">
      <BaseHistory chainId={chainId} address={address} type={type} />
    </div>
  )
}

export default History
