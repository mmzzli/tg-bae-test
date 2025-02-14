import { UseTransactionsProps } from '@/store/wallet/hooks/useTransactions'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BaseHistoryType } from '.'
import classNames from 'classnames'
import Item from './Item'
import { InfinteScrollToRefresh } from '../../components/InfinteScrollToRefresh'
import { groupByDate } from '@/store/wallet/util/txHelper'
import useOkxTransactions, { UseOkxTransactionsProps } from '@/store/wallet/hooks/useOkxTransactions'

const List = ({
  type = BaseHistoryType.ALL,
  chainId,
  address
}: {
  type: BaseHistoryType | undefined
  chainId?: UseTransactionsProps['chain_id']
  address?: UseTransactionsProps['address']
}) => {
  // const [start, setStart] = useState(false)
  const txsParams: UseOkxTransactionsProps = useMemo(() => {
    switch (type) {
      case BaseHistoryType.SWAP:
        return {
          chain_id: -1,
          historyType: 'Swap',
          status: 'all'
        }
      case BaseHistoryType.DETAIL:
        return {
          chain_id: chainId,
          address,
          historyType: 'All',
          status: 'all'
        }
      default:
        return {
          chain_id: -1,
          historyType: 'All',
          status: 'all'
        }
    }
  }, [address, chainId, type])
  const { txsFlat, txs, loading, hasMore, loadMore } =
    useOkxTransactions(txsParams)

  const nextPage = async () => {
    await loadMore()
  }

  const renderAllHistory = useMemo(() => txsFlat, [JSON.stringify(txsFlat)])
  const filterByChainNameGroupedHistorys = groupByDate(renderAllHistory)

  const loadingFlag = useMemo(() => {
    if (!renderAllHistory.length) {
      return loading
    }
    return false
  }, [loading, renderAllHistory])
  return (
    <div className="flex size-full flex-col">
      {loadingFlag ? (
        <div className="flex size-full items-center justify-center">
          <span>...</span>
        </div>
      ) : renderAllHistory.length ? (
        <InfinteScrollToRefresh hasMore={hasMore} onRefresh={nextPage}>
          {Object.keys(filterByChainNameGroupedHistorys).length === 0 ? (
            <div className="flex h-full items-center justify-center">
              {/* <TNoResult className="mb-[64px]" /> */}
              <span>No Data</span>
            </div>
          ) : (
            Object.keys(filterByChainNameGroupedHistorys).map((date, index) => (
              <div key={date}>
                <p className={classNames('py-2 text-t2 font-normal text-sm')}>
                  {date}
                </p>
                {filterByChainNameGroupedHistorys[date].map((history) => (
                  <Item key={history.time} type={type} history={history} />
                ))}
                {Object.keys(filterByChainNameGroupedHistorys).length > 1 &&
                  index !==
                    Object.keys(filterByChainNameGroupedHistorys).length -
                      1 && <div className="my-4 h-px w-full bg-l1" />}
              </div>
            ))
          )}
        </InfinteScrollToRefresh>
      ) : (
        <div className="flex h-full items-center justify-center ">
          {/* <TNoResult className="base-history-no-result mb-[64px]" /> */}
          <span>No Data</span>
        </div>
      )}
    </div>
  )
}

export default List
