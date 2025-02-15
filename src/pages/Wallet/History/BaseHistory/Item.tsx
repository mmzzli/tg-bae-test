import { BaseHistoryType } from '.'
import ItemValueChange from './ItemValueChange'
import { useNavigate } from 'react-router-dom'
import ItemTokenSymbol from './ItemTokenSymbol'
import { IHistoryType } from '@/store/wallet/type'

const Item = ({
  history,
  type
}: {
  history: IHistoryType
  type: BaseHistoryType
}) => {
  const navigate = useNavigate()

  const fromChainId = history.fromSwapTokens?.chain?.id
  const toChainId = history.toSwapTokens?.chain?.id

  const onClick = () => {
    if (history.hash && history.historyType !== 'Pay') {
      navigate(`/wallet/history/detail?hash=${encodeURIComponent(history.hash)}`)
    }
  }

  return (
    <div
      className="flex min-h-[73px] w-full flex-col justify-center py-4"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <ItemTokenSymbol history={history} />
        <ItemValueChange type={type} history={history} />
      </div>

      {history.status === 'pending' && fromChainId !== toChainId && (
        <span className="mt-3">Funds may take up to 20 minutes to arrive in your wallet after the transaction is successful.</span>
      )}
    </div>
  )
}

export default Item
