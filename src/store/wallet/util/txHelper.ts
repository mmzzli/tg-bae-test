import { IChainId } from "../chainType"
import { IHistoryType, TransactionsType } from "../type"

export const findTxs = (txs: TransactionsType, hash: string) => {
  return Object.values(txs)
    .flat()
    .find((tx: any) => tx?.hash === hash)
}

export const txStatusChange = (
  txsOld: TransactionsType,
  txsNew: TransactionsType
) => {
  const temp: {
    current: IHistoryType | undefined
    changed: IHistoryType | undefined
  }[] = []
  Object.values(txsOld)
    .flat()
    .forEach((t) => {
      const txNew = findTxs(txsNew, t?.hash || '')
      if (txNew && t?.status !== txNew.status) {
        temp.push({
          current: t,
          changed: txNew
        })
      }
    })
  return temp
}

export const txsFilter = (
  txs: TransactionsType,
  selectFunc: (item: IHistoryType) => void
) => {
  return Object.keys(txs)
    .map((key) => {
      const intKey = Number(key) as IChainId
      return txs[intKey]
    })
    .filter((item) => !!item)
    .flat()
    .filter(selectFunc)
}


export const mergeTxs = (oldTxs: TransactionsType, neTxs: TransactionsType) => {
  const arr = txStatusChange(oldTxs, neTxs)
  //Toast
  // arr.forEach((i) => i.changed && sendHistoryToast(i.changed))
  if (!Object.keys(oldTxs).length) return neTxs
  const temp: TransactionsType = { ...oldTxs }
  for (const txChainId in neTxs) {
    const chainId = Number(txChainId) as IChainId
    const txChainList = neTxs[chainId]
    txChainList?.forEach((history, idx) => {
      let oldChainList = temp[txChainId]
      if (!oldChainList) {
        temp[txChainId] = []
        oldChainList = temp[txChainId]
      }
      const finds = txsFilter(
        temp,
        (iHistory) => iHistory.hash === history.hash
      )
      if (finds?.length) {
        const findIndex = temp[txChainId]?.findIndex(
          (o) => o.hash === history.hash
        ) as number
        oldChainList[findIndex] = {
          ...history,
          status:
            history.status === 'success' || finds[0].status === 'success'
              ? 'success'
              : history.status,
          gasAmount: history.gasAmount || finds[0].gasAmount
        }
      } else {
        oldChainList.push(history)
      }
    })
  }
  return temp
}

export const updateSignleTx = (
  txs: TransactionsType,
  history: IHistoryType
) => {
  if (!history) return
  const temp: TransactionsType = { ...txs }
  let findFlag = false
  for (const txChainId in temp) {
    const chainId = Number(txChainId) as IChainId
    const txChainList = temp[chainId]
    txChainList?.forEach((iHistoryType, idx) => {
      if (iHistoryType.hash === history.hash) {
        findFlag = true
        txChainList[idx] = history
      }
    })
  }
  if (!findFlag) {
    return addSignleTx(txs, history, history.chain?.id || -1)
  }
  sortByTime(temp)
  return temp
}

export const addSignleTx = (
  txs: TransactionsType,
  history: IHistoryType,
  chainId: IChainId
) => {
  const temp: TransactionsType = { ...txs }
  //check if give a wrong data
  if (!history) return
  if (!chainId && chainId !== 0) return
  if (!history.hash) return
  //check if find
  const finds = txsFilter(temp, (iHistory) => iHistory.hash === history.hash)
  if (finds.length) return
  const txsKey = chainId as IChainId
  const items = temp[txsKey] ?? []
  temp[txsKey] = [history as IHistoryType, ...(items ? items : [])]
  sortByTime(temp)
  return temp
}

export const sortByTime = (txs: TransactionsType) => {
  for (const txChainId in txs) {
    const chainId = Number(txChainId) as IChainId
    const txChainList = txs[chainId]
    txChainList?.sort((a, b) => b.time - a.time)
    txs[chainId] = txChainList
  }
}
