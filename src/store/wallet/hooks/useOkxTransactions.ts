import { useEffect, useMemo, useState } from 'react'
import { getHistoryFromOkxAccount } from './useOkxAccount'
import useAsyncEffect from 'ahooks/lib/useAsyncEffect'
import { mergeOkxHistory, sameHashMerge } from '../util/txHelper'
import { IHistoryType, IOKXHistoryType, TransactionsType } from '../type'
import { IChainId } from '../chainType'
import { useTokenStore } from '../walletToken'
import { UNSUPPROT_HISTORY_CHAIN } from '../chains'
import { useStore } from '@/store'

const filterHistory = (source: TransactionsType, selectFunc: (i: IHistoryType) => void) => {
  for (const txChainId in source) {
    const chainId = Number(txChainId) as IChainId
    const txChainList = source[chainId]
    source[chainId] = txChainList?.filter(selectFunc)
  }
}

export interface UseOkxTransactionsProps {
  chain_id?: number // -1, 1, 56...
  historyType?: 'All' | 'Swap' | 'Send' | 'Approve'
  status?: 'all' | 'pending' | 'success' | 'failed'
  address?: string | undefined
}

const useOkxTransactions = (props?: UseOkxTransactionsProps) => {
  const user = useStore((state) => state.walletUserInfo)
  const { tokenList, walletReportTxs, walletTxs, walletTxsActions } = useTokenStore()

  const [cursor, setCursor] = useState('')
  const [okxList, setOkxList] = useState<IOKXHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setMore] = useState(true)
  const [cacheTxs, setCache] = useState<IHistoryType[]>([])

  useAsyncEffect(async () => {
    if (!user.okxAccount) return
    await loadMore()
  }, [user.okxAccount])

  const transferHistory = useMemo(() => {
    const { txs } = mergeOkxHistory(okxList, user, walletReportTxs, tokenList)
    if (!Object.keys(txs).length) {
      return walletTxs //only once
    }
    walletTxsActions(txs)
    return txs
  }, [JSON.stringify(okxList), JSON.stringify(walletReportTxs), loading])

  const txs: TransactionsType = useMemo(() => {
    let temp: TransactionsType = transferHistory
    if (typeof props?.chain_id === 'number' && props?.chain_id !== -1) {
      const chainId = Number(props.chain_id) as IChainId
      temp = {
        [props.chain_id]: temp[chainId],
      }
    }
    if (typeof props?.historyType === 'string' && props?.historyType !== 'All') {
      filterHistory(temp, (i: IHistoryType) => i.historyType === props.historyType)
    }
    if (typeof props?.status === 'string' && props?.status !== 'all') {
      filterHistory(temp, (i: IHistoryType) => i.status === props?.status)
    }
    if (typeof props?.address === 'string') {
      filterHistory(temp, (i: IHistoryType) => {
        return (
          i.fromSwapTokens?.token?.address === props.address ||
          i.toSwapTokens?.token?.address === props.address
        )
      })
    }
    return temp
  }, [transferHistory, props?.chain_id, props?.historyType, props?.status])

  const txsFlat: IHistoryType[] = useMemo(() => {
    if (loading) return cacheTxs
    const result = Object.keys(txs)
      .map((key) => {
        const intKey = Number(key) as IChainId
        return txs[intKey]
      })
      .filter((item) => !!item)
      .flat()
      .sort((a, b) => b.time - a.time)
    setCache(result)
    return result
  }, [txs, loading])

  const loadMore = async () => {
    let chainIndex = ''
    if (props?.chain_id && props?.chain_id > 0) {
      chainIndex = props?.chain_id?.toString()
    }
    const unDone = UNSUPPROT_HISTORY_CHAIN.find((id) => id === Number(chainIndex))
    if (unDone) {
      setLoading(false)
      setMore(false)
      return
    }

    setLoading(true)
    const resTop = await getHistoryFromOkxAccount({
      accountId: user.okxAccount || '',
      cursor,
      chainIndex,
    })
    let resBottom = {
      cursor: '',
      transactionList: [] as IOKXHistoryType[],
    }
    if (resTop?.cursor) {
      const twice = await getHistoryFromOkxAccount({
        accountId: user.okxAccount || '',
        cursor: resTop.cursor,
        chainIndex,
      })
      if (twice) {
        resBottom = twice
      }
    }
    let bottomList: IOKXHistoryType[] = []
    if (resBottom.transactionList.length === 20 && resBottom.cursor !== resTop?.cursor) {
      // remove last same hax Item
      const cachelist = sameHashMerge(resBottom.transactionList)
      cachelist.pop()
      bottomList = cachelist.flat()
    }
    setLoading(false)
    setCursor(resBottom.cursor)
    setMore(resBottom?.cursor !== resTop?.cursor && resBottom?.cursor !== '')
    const seen = new Set()
    const result: IOKXHistoryType[] = []
    const tempArr = [...okxList, ...(resTop?.transactionList || []), ...bottomList]
    tempArr.forEach((item) => {
      const jsonString = JSON.stringify(item)
      if (!seen.has(jsonString)) {
        seen.add(jsonString)
        result.push(item)
      }
    })
    setOkxList(result)
  }

  return {
    loading,
    hasMore,
    loadMore,
    txs,
    txsFlat,
  }
}

export default useOkxTransactions
