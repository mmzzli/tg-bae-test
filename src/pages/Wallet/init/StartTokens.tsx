import useOkxTransactions from '@/store/wallet/hooks/useOkxTransactions'
import useTokens from '@/store/wallet/hooks/useTokens'

export default () => {
  useTokens()
  useOkxTransactions({
    chain_id: -1,
    historyType: 'All',
    status: 'all'
  })
  return <></>
}
