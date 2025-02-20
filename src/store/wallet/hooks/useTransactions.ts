import { useState, useEffect, useMemo } from 'react'
import { IChainId } from '../chainType'
import { IHistoryType, ReportHistoryType, TransactionsType } from '../type'
import {
  recordDataByHistory,
  ReportSourcePendingToIHistoryType,
  reportTx,
  txListToTransactionsType,
} from '../util/txHelper'
import { useTokenStore } from '../walletToken'
import { txReportListGet } from '@/api/wallet'
import { sleep } from '../util'
import { jsonFilter } from '../util/tokenHelper'

export interface UseTransactionsProps {
  chain_id?: number // -1, 1, 56...
  historyType?: 'All' | 'Swap' | 'Send' | 'Approve'
  status?: 'all' | 'pending' | 'success' | 'failed'
  address?: string | undefined
}

const filterHistory = (source: TransactionsType, selectFunc: (i: IHistoryType) => void) => {
  for (const txChainId in source) {
    const chainId = Number(txChainId) as IChainId
    const txChainList = source[chainId]
    source[chainId] = txChainList?.filter(selectFunc)
  }
}

const useTransactions = (props?: UseTransactionsProps) => {
  const chain_id = props?.chain_id
  const historyType = props?.historyType
  const status = props?.status
  const address = props?.address

  const [loading, setLoading] = useState(false) // not need
  const {
    walletUserInfo: user,
    tokenList,
    walletTxs,
    walletTxUpdateActions,
    walletTxReportActions,
    walletTxsActions,
  } = useTokenStore()

  const txs: TransactionsType = useMemo(() => {
    let temp: TransactionsType = walletTxs
    if (typeof chain_id === 'number' && chain_id !== -1) {
      const chainId = Number(chain_id) as IChainId
      temp = {
        [chain_id]: temp[chainId],
      }
    }
    console.log({
      key: 'TransactionsType',
      temp,
    })
    if (typeof historyType === 'string' && historyType !== 'All') {
      filterHistory(temp, (i: IHistoryType) => i.historyType === historyType)
    }
    if (typeof status === 'string' && status !== 'all') {
      filterHistory(temp, (i: IHistoryType) => i.status === status)
    }
    if (typeof address === 'string') {
      filterHistory(temp, (i: IHistoryType) => {
        return (
          i.fromSwapTokens?.token?.address === address || i.toSwapTokens?.token?.address === address
        )
      })
    }

    return temp
  }, [JSON.stringify(walletTxs), chain_id, historyType, status, address])

  const txsFlat: IHistoryType[] = useMemo(
    () =>
      Object.keys(txs)
        .map((key) => {
          const intKey = Number(key) as IChainId
          return txs[intKey]
        })
        .filter((item) => !!item)
        .flat()
        .sort((a, b) => b.time - a.time),
    [txs]
  )

  const addTx = async ({ history, chainId }: { history: IHistoryType; chainId: IChainId }) => {
    recordDataByHistory(history, user)
    await updateTxs({ history })
  }

  const updateTxs = async ({ history }: { history: IHistoryType }) => {
    walletTxUpdateActions(history)
    await reportTx(history)
    sleep(200)
    const txsResult = await txReportListGet({
      page: 0,
      limit: 250,
      userID: user.id,
    })
    if (txsResult.data && txsResult.data.records) {
      walletTxReportActions(txsResult.data.records)
      const walletTxs = txsResult.data.records
        .filter((i: ReportHistoryType) => jsonFilter(i.source))
        .map((i: ReportHistoryType) => ReportSourcePendingToIHistoryType(i, tokenList))
      walletTxsActions(txListToTransactionsType(walletTxs))
    }
  }

  return {
    addTx,
    txs,
    txsFlat,
    updateTxs,
    loading,
  }
}

export default useTransactions
