import { postSendPoint, txReportPost } from '@/api/wallet'
import { IChainId, IWeb3ChainType } from '../chainType'
import { AssetsToken } from '../tokenType/AssetsToken'
import {
  IHistoryType,
  IOKXHistoryType,
  ReportHistoryType,
  ReportSourceType,
  TransactionsType,
  UserType,
} from '../type'
import { initUserInfo } from '../walletUser'
import { getChainByChainId, userChainAddressList } from './tokenHelper'
import { formatUnits, GetTransactionReceiptReturnType } from 'viem'
import dayjs from 'dayjs'
import chains, { UNSUPPROT_HISTORY_CHAIN } from '../chains'
import { BigNumber } from 'bignumber.js'

BigNumber.config({
  FORMAT: {
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
    secondaryGroupSize: 0,
    fractionGroupSeparator: ' ',
    fractionGroupSize: 0,
    suffix: ''
  },
  EXPONENTIAL_AT: [-18, 30]
})


export const findTxs = (txs: TransactionsType, hash: string) => {
  return Object.values(txs)
    .flat()
    .find((tx: any) => tx?.hash === hash)
}

export const txStatusChange = (txsOld: TransactionsType, txsNew: TransactionsType) => {
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
          changed: txNew,
        })
      }
    })
  return temp
}

export const txsFilter = (txs: TransactionsType, selectFunc: (item: IHistoryType) => void) => {
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
      const finds = txsFilter(temp, (iHistory) => iHistory.hash === history.hash)
      if (finds?.length) {
        const findIndex = temp[txChainId]?.findIndex((o) => o.hash === history.hash) as number
        oldChainList[findIndex] = {
          ...history,
          status:
            history.status === 'success' || finds[0].status === 'success'
              ? 'success'
              : history.status,
          gasAmount: history.gasAmount || finds[0].gasAmount,
        }
      } else {
        oldChainList.push(history)
      }
    })
  }
  return temp
}

export const updateSignleTx = (txs: TransactionsType, history: IHistoryType) => {
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

export const addSignleTx = (txs: TransactionsType, history: IHistoryType, chainId: IChainId) => {
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

/*
 * report tx
 **/
export const reportTx = async (
  tx: IHistoryType,
  plugins?: {
    trackSwap: any
    trackSend: any
    tokenList: AssetsToken[]
  }
) => {
  if (tx.historyType !== 'Swap' && tx.historyType !== 'Send') return
  const user = initUserInfo()
  const chainId = tx.fromSwapTokens.chain?.id ?? -1

  const source: ReportSourceType = {
    plat: tx.type || '',
    status: tx.status || '',
    sourceType: tx.fromSwapTokens.chain?.id !== tx.toSwapTokens.chain?.id ? 'cross' : 'normal',
    requestId: tx.requestId || '',
    time: tx.endTime || tx.time,
    from: {
      chainID: (tx.fromSwapTokens.chain as IWeb3ChainType).id,
      symbol: tx.fromSwapTokens.token.symbol,
      tokenAddress: tx.fromSwapTokens.token.address || '',
      amount: tx.fromAmount || '0',
      decimals: tx.fromSwapTokens.token.decimals,
    },
    hash: tx.hash,
    to: {
      chainID: (tx.toSwapTokens.chain as IWeb3ChainType)?.id,
      symbol: tx.toSwapTokens.token.symbol,
      tokenAddress: tx.toSwapTokens.token.address || '',
      amount: tx.toAmount || '0',
      decimals: tx.toSwapTokens.token.decimals,
    },
    toHash: tx.toHash || '',
    toAddress: tx.historyType === 'Send' ? (tx.toAddress ?? '') : '',
    toBlock: tx.blocknumber || '',
    routeInfo: tx.routeInfo,
  }

  if (plugins)
    reportMixpanel({
      tx: source,
      history: tx,
      tokenList: plugins.tokenList,
      trackSwap: plugins.trackSwap,
      trackSend: plugins.trackSend,
    })

  return await txReportPost({
    chainID: chainId,
    gas: tx.gasAmount || '',
    source: JSON.stringify(source),
    tx: tx.hash,
    type: tx.historyType === 'Swap' ? 'swap' : 'send',
    userID: user.id,
  })
}

export const getTxTokenInfo = ({
  tx,
  history,
  tokenList,
}: {
  tx: ReportSourceType
  history: IHistoryType
  tokenList: AssetsToken[]
}) => {
  const fromTokenInfo = tokenList.find(
    (o) =>
      o.address.toLowerCase() === tx.from.tokenAddress.toLowerCase() &&
      o.chainId === tx.from.chainID
  )
  let isNativeFrom = !tx.from.tokenAddress
  // if (tx.from.chainID === chains.sui.id) {
  //   if (tx.from.tokenAddress === SUI_TYPE_ARG) {
  //     isNativeFrom = true
  //   }
  // }
  let fromToken: AssetsToken = {
    isNative: isNativeFrom,
    isToken: !isNativeFrom,
    chainId: tx.from.chainID,
    decimals: tx.from.decimals,
    symbol: tx.from.symbol,
    name: tx.from.symbol,
    address: tx.from.tokenAddress,
    balance: '',
    price: 0,
    image: '',
    source: 'all',
    id: `${tx.from.tokenAddress}-${tx.from.chainID}-${tx.from.symbol}`,
    formatted: '',
  }
  const nativeTokenInfo = tokenList.find((o) => o.chainId === tx.from.chainID && o.isNative)
  const nativeInfo = getChainByChainId(tx.from.chainID)
  const naviteCurrency = nativeInfo?.chain?.nativeCurrency
  let nativeToken: AssetsToken = {
    isNative: true,
    isToken: false,
    chainId: tx.from.chainID,
    decimals: naviteCurrency?.decimals || 18,
    symbol: naviteCurrency?.symbol || '',
    name: naviteCurrency?.name || '',
    address: '',
    balance: '',
    price: 0,
    image: '',
    source: 'all',
    id: `${tx.from.chainID}-${naviteCurrency?.symbol}`,
    formatted: '',
  }
  if (fromTokenInfo) {
    fromToken = fromTokenInfo
  }
  if (nativeTokenInfo) {
    nativeToken = nativeTokenInfo
  }
  return {
    fromTokenInfo: fromToken,
    nativeTokenInfo: nativeToken,
  }
}

export const reportMixpanel = ({
  tx,
  history,
  trackSwap,
  trackSend,
  tokenList,
}: {
  tx: ReportSourceType
  history: IHistoryType
  trackSwap: any
  trackSend: any
  tokenList: AssetsToken[]
}) => {
  try {
    if (tx.status !== 'pending' && tx.status !== 'loading') {
      const fromChain = getChainByChainId(tx.from.chainID)
      const toChain = getChainByChainId(tx.to.chainID)

      const catchNumber = (amount: any, decimals: number) => {
        try {
          return formatUnits(BigInt(amount), decimals)
        } catch (error) {
          return amount
        }
      }

      const fromAmount = catchNumber(tx.from.amount, tx.from.decimals) || ''
      const toAmount = catchNumber(tx.to.amount, tx.from.decimals) || ''

      const { fromTokenInfo, nativeTokenInfo } = getTxTokenInfo({
        tx,
        history,
        tokenList,
      })

      switch (history.historyType) {
        case 'Swap':
          trackSwap({
            fromChain: fromChain?.name || '',
            toChain: toChain?.name || '',
            fromTokenSymbol: tx.from.symbol || '',
            toTokenSymbol: tx.to.symbol || '',
            fromAmount: fromAmount,
            toAmount: toAmount,
            totalTokenUsd: (Number(fromAmount) * fromTokenInfo.price).toString(), //todo get from token usd price
            providerType: tx.plat || '',
            providerTypeInfo: history.routeInfo?.swapperTitle || '',
            status: tx.status === 'success',
            fromAddress: history.fromAddress || '',
            gasUsd: (Number(history.gasAmount || '0') * nativeTokenInfo.price).toString() || '', //todo get from native token usd price
          })
          break
        case 'Send':
          trackSend({
            chain: fromChain?.name || '',
            tokenSymbol: tx.from.symbol || '',
            amount: fromAmount,
            totalTokenUsd: (Number(fromAmount) * fromTokenInfo.price).toString(), //todo get from token usd price
            status: tx.status === 'success',
            gasUsd: (Number(history.gasAmount || '0') * nativeTokenInfo.price).toString() || '', //todo get from native token usd price
            fromAddress: history.fromAddress || '',
            toAddress: tx.toAddress || '',
          })
          break
        default:
          break
      }
    }
  } catch (error) {
    console.warn('track', error)
  }
}

export const recordDataByHistory = (iHistoryType: IHistoryType, user: UserType) => {
  switch (iHistoryType.historyType) {
    case 'Send':
      pendingChangedForSend(iHistoryType, user)
      break

    default:
      break
  }
}

export const pendingChangedForSend = async (tx: IHistoryType, user: UserType) => {
  if (tx.historyType !== 'Send') return
  // if (tx.status !== 'success') return

  const amount = BigInt(tx.fromAmount ?? '0')
  const decimals = tx.fromSwapTokens.token.decimals || 18
  const formatted = formatUnits(amount, decimals)
  const price = +formatted * (tx.fromSwapTokens.token.price || 1)

  const parmas = {
    chainId: tx.chain?.id.toString() || '',
    txId: tx.hash,
    senderUserId: user.id,
    senderAddress: tx.fromAddress || '',
    receiverAddress: tx.toAddress || '',
    amount: amount.toString(),
    tokenContract: tx.fromSwapTokens.token.address,
    decimals: decimals,
    symbol: tx.fromSwapTokens.token.symbol,
    priceUsd: price,
  }
  postSendPoint(parmas)
}

export const ReportSourcePendingToIHistoryType = (
  tx: ReportHistoryType,
  tokenList: AssetsToken[]
) => {
  const result: IHistoryType = {} as any as IHistoryType
  try {
    const dataJSON: ReportSourceType = JSON.parse(tx.source)
    const status = dataJSON.status as any
    const user = initUserInfo()
    const userAddr = userChainAddressList(user, tx.chainID)
    result.fromAddress = userAddr
    result.nonce = 0
    result.networkFee = ''
    result.hash = tx.tx
    result.endTime = 0
    result.gasAmount = ''
    const chainId = Number(tx.chainID)
    result.chain = getChainByChainId(chainId)

    result.fromAmount = dataJSON.from.amount
    result.toAmount = dataJSON.to.amount
    let isNativeFrom = !dataJSON.from.tokenAddress
    // if (dataJSON.from.chainID === chains.sui.id) {
    //   if (dataJSON.from.tokenAddress === SUI_TYPE_ARG) {
    //     isNativeFrom = true
    //   }
    // }
    const findFromToken = tokenList.find(
      (o) =>
        o.address.toLowerCase() === dataJSON.from.tokenAddress.toLowerCase() &&
        o.chainId === dataJSON.from.chainID
    )
    let fromToken: AssetsToken = {
      isNative: isNativeFrom,
      isToken: !isNativeFrom,
      chainId: dataJSON.from.chainID,
      decimals: dataJSON.from.decimals,
      symbol: dataJSON.from.symbol,
      name: dataJSON.from.symbol,
      address: dataJSON.from.tokenAddress,
      balance: '',
      price: 0,
      image: '',
      source: 'all',
      id: `${dataJSON.from.tokenAddress}-${dataJSON.from.chainID}-${dataJSON.from.symbol}`,
      formatted: '',
    }
    if (findFromToken) {
      fromToken = findFromToken
    }
    result.fromSwapTokens = {
      token: fromToken,
      chain: getChainByChainId(dataJSON.from.chainID),
      balance: undefined,
    }
    let isNativeTo = !dataJSON.to.tokenAddress
    // if (dataJSON.to.chainID === chains.sui.id) {
    //   if (dataJSON.to.tokenAddress === SUI_TYPE_ARG) {
    //     isNativeTo = true
    //   }
    // }
    const findToToken = tokenList.find(
      (o) =>
        o.address.toLowerCase() === dataJSON.to.tokenAddress.toLowerCase() &&
        o.chainId === dataJSON.to.chainID
    )
    let toSwapToken: AssetsToken = {
      isNative: isNativeTo,
      isToken: !isNativeTo,
      chainId: dataJSON.to.chainID,
      decimals: dataJSON.to.decimals,
      symbol: dataJSON.to.symbol,
      name: dataJSON.to.symbol,
      address: dataJSON.to.tokenAddress,
      balance: '',
      price: 0,
      image: '',
      source: 'all',
      id: `${dataJSON.to.tokenAddress}-${dataJSON.to.chainID}-${dataJSON.to.symbol}`,
      formatted: '',
    }
    if (findToToken) {
      toSwapToken = findToToken
    }
    result.toSwapTokens = {
      token: toSwapToken,
      chain: getChainByChainId(dataJSON.to.chainID),
      balance: undefined,
    }
    result.historyType = tx.type === 'swap' ? 'Swap' : 'Send'
    result.time = dataJSON.time
    result.type = dataJSON.plat
    result.requestId = dataJSON.requestId
    result.status = dataJSON.sourceType == 'normal' ? (status as any) : 'pending'
    if (dataJSON.sourceType === 'cross') {
      if (dataJSON.toHash) {
        result.status = 'success'
      }
      if (dataJSON.status !== 'pending') {
        result.status = dataJSON.status as any
      }
    }
    if (result.historyType === 'Send') {
      result.toAddress = dataJSON.toAddress || ''
    }
    result.routeInfo = dataJSON.routeInfo
  } catch (error) {
    console.warn('ReportSourcePendingToIHistoryType', error, tx)
  }
  return result
}

export const txListToTransactionsType = (list: IHistoryType[]) => {
  const txs: TransactionsType = {}
  list.forEach((i: IHistoryType) => {
    const chainId = i.chain?.id
    if (!chainId) return
    if (!txs[chainId]) {
      txs[chainId] = []
    }
    txs[chainId].push(i)
  })
  return txs
}

export const groupByDate = (txs: IHistoryType[]) =>
  txs.reduce(
    (obj, i) => {
      // const date = convertTimestampToDateText(i.time)
      const date = dayjs(i.time).format('YYYY/MM/DD')
      if (!obj[date]) {
        obj[date] = []
      }
      obj[date].push(i)
      obj[date] = obj[date].sort((a, b) => b.time - a.time)
      return obj
    },
    {} as { [key: string]: IHistoryType[] }
  )

export const sameHashMerge = (list: IOKXHistoryType[]) => {
  const mergedTxs: IOKXHistoryType[][] = []
  let cacheList: IOKXHistoryType[] = []
  list.forEach((i, idx) => {
    if (!cacheList.length) {
      cacheList.push(i)
      if (idx === list.length - 1) {
        mergedTxs.push([...cacheList])
      }
      return
    }
    const last = cacheList[cacheList.length - 1]
    if (last.txHash === i.txHash) {
      cacheList.push(i)
      if (idx === list.length - 1) {
        mergedTxs.push([...cacheList])
      }
      return
    }
    mergedTxs.push([...cacheList])
    cacheList = []
    cacheList.push(i)
    if (idx === list.length - 1) {
      mergedTxs.push([...cacheList])
    }
  })
  return mergedTxs
}

const checkIfAddressUser = (addr: string, user: UserType) => {
  return (
    addr === user.ethereumAddress ||
    addr === user.suiAddress ||
    addr === user.tronAddress ||
    addr === user.solanaAddress
  )
}


export const mergeOkxHistory = (
  list: IOKXHistoryType[],
  user: UserType,
  reports: ReportHistoryType[],
  tokenList: AssetsToken[]
) => {
  const methods = {
    '0x9871efa4': 'unxswapByOrderId',
    '0xa9059cbb': 'transfer',
    '0xb80c2f09': 'smartSwapByOrderId',
    '0x972250fe': '',
    '0x095ea7b3': 'approve',
    '0x3d21e25a': 'swapBridgeToV2',
  }

  const mergedOKXTxs = sameHashMerge(list)
  const txsFlatOKX = mergedOKXTxs
    .filter((i) => i[i.length - 1].tag !== 'Risk Airdrop' && !i[i.length - 1].hitBlacklist)
    .filter((i) => i[0].methodId !== '0x095ea7b3') //TODO, hidden Approve
    .map((i: IOKXHistoryType[]) => methodsToHistory(i, user, reports, tokenList))
    .filter((i) => !!i)

  const pendingReports = reports
    .filter((i) => i.source.includes('pending'))
    .filter((i) => !JSON.stringify(list).includes(i.tx))
    .map((i) => ReportSourcePendingToIHistoryType(i, tokenList))
  const unOkxReports = reports
    .map((i) => ReportSourcePendingToIHistoryType(i, tokenList))
    .filter((j: IHistoryType) => UNSUPPROT_HISTORY_CHAIN.find((id) => id === j.chain?.id))

  //find pending txs
  const mergedPendingReports = pendingReports.filter(
    (i) => !unOkxReports.find((j) => j.hash === i.hash)
  )
  const pendingTxs = mergedPendingReports.filter((i) => !txsFlatOKX.find((j) => j.hash === i.hash))
  const repList = [...unOkxReports, ...pendingTxs]

  const groupOkx = groupByDate(txsFlatOKX)
  const groupRep = groupByDate(repList)

  const groupOkxKey = Object.keys(groupOkx)
    .map((i) => dayjs(i).valueOf())
    .sort((a, b) => a - b)

  const groupRepFilter = Object.keys(groupRep)
    .filter((i) => dayjs(i).valueOf() >= groupOkxKey[0])
    .map((i) => groupRep[i])
    .flat()

  const mergeAll: IHistoryType[] = [...groupRepFilter, ...txsFlatOKX]
  const totalTxs = mergeAll.sort((a, b) => b.time - a.time)
  const txs: TransactionsType = txListToTransactionsType(totalTxs)
  return {
    txs,
    txsFlat: totalTxs,
  }
}

const methodsToHistory = (
  list: IOKXHistoryType[],
  user: UserType,
  reports: ReportHistoryType[],
  tokenList: AssetsToken[]
) => {
  //!warning, okx return error history data, should try catch
  try {
    const first = list[0]
    const last = list[list.length - 1]
    const status = first.txStatus
    const endTime = first.txTime
    const networkFee = first.txFee
    const gasAmount = first.txFee
    const hash = first.txHash
    const chainId = Number(first.chainIndex)
    const lastChainId = Number(last.chainIndex)
    const nonce = first.nonce

    const result: IHistoryType = {} as any as IHistoryType
    result.fromAddress = first.from[0].address
    result.nonce = Number(nonce)
    result.networkFee = networkFee
    result.hash = hash
    if (endTime.length > 13) {
      result.endTime = Number(endTime.slice(0, 13))
    } else {
      result.endTime = Number(endTime)
    }
    result.time = result.endTime
    result.gasAmount = gasAmount
    result.chain = getChainByChainId(Number(chainId))
    result.status = status as any

    if (!result.chain) {
      return null
    }

    const find = reports.find((i) => i.tx.toLowerCase() === first.txHash.toLowerCase())
    if (find) {
      // base use
      result.historyType = find.type.toUpperCase() === 'SEND' ? 'Send' : 'Swap'

      // noraml
      try {
        if (find.source) {
          const dataJSON: ReportSourceType = JSON.parse(find.source)
          result.fromAmount = dataJSON.from.amount
          result.toAmount = dataJSON.to.amount
          let isNativeFrom = !dataJSON.from.tokenAddress
          // if (dataJSON.from.chainID === chains.sui.id) {
          //   if (dataJSON.from.tokenAddress === SUI_TYPE_ARG) {
          //     isNativeFrom = true
          //   }
          // }
          const findFromToken = tokenList.find(
            (o) =>
              o.address.toLowerCase() === dataJSON.from.tokenAddress.toLowerCase() &&
              o.chainId === dataJSON.from.chainID
          )
          let fromToken: AssetsToken = {
            isNative: isNativeFrom,
            isToken: !isNativeFrom,
            chainId: dataJSON.from.chainID,
            decimals: dataJSON.from.decimals,
            symbol: dataJSON.from.symbol,
            name: dataJSON.from.symbol,
            address: dataJSON.from.tokenAddress,
            balance: '',
            price: 0,
            image: '',
            source: 'all',
            id: `${dataJSON.from.tokenAddress}-${dataJSON.from.chainID}-${dataJSON.from.symbol}`,
            formatted: '',
          }
          if (findFromToken) {
            fromToken = findFromToken
          }
          result.fromSwapTokens = {
            token: fromToken,
            chain: getChainByChainId(dataJSON.from.chainID),
            balance: undefined,
          }
          let isNativeTo = !dataJSON.to.tokenAddress
          // if (dataJSON.to.chainID === chains.sui.id) {
          //   if (dataJSON.to.tokenAddress === SUI_TYPE_ARG) {
          //     isNativeTo = true
          //   }
          // }
          const findToToken = tokenList.find(
            (o) =>
              o.address.toLowerCase() === dataJSON.to.tokenAddress.toLowerCase() &&
              o.chainId === dataJSON.to.chainID
          )
          let toSwapToken: AssetsToken = {
            isNative: isNativeTo,
            isToken: !isNativeTo,
            chainId: dataJSON.to.chainID,
            decimals: dataJSON.to.decimals,
            symbol: dataJSON.to.symbol,
            name: dataJSON.to.symbol,
            address: dataJSON.to.tokenAddress,
            balance: '',
            price: 0,
            image: '',
            source: 'all',
            id: `${dataJSON.to.tokenAddress}-${dataJSON.to.chainID}-${dataJSON.to.symbol}`,
            formatted: '',
          }
          if (findToToken) {
            toSwapToken = findToToken
          }
          result.toSwapTokens = {
            token: toSwapToken,
            chain: getChainByChainId(dataJSON.to.chainID),
            balance: undefined,
          }
          result.time = dataJSON.time
          result.type = dataJSON.plat
          result.requestId = dataJSON.requestId
          result.status = dataJSON.sourceType == 'normal' ? (status as any) : 'pending'

          if (dataJSON.sourceType === 'cross') {
            if (dataJSON.toHash) {
              result.status = 'success'
            }
            if (dataJSON.status !== 'pending') {
              result.status = dataJSON.status as any
            }
          }

          result.routeInfo = dataJSON.routeInfo
          result.source = 'TOMO'
          if (result.historyType === 'Send') {
            result.toAddress = last.to[0].address || dataJSON.toAddress
          }
          return result
        }
      } catch (e) {
        console.log('source json error')
      }
    }

    // Approve
    if (first.methodId === '0x095ea7b3') {
      result.historyType = 'Approve'
      result.fromAddress = first.from[0].address
      result.toAddress = ''
      result.fromAmount = ''
      result.toAmount = ''
      result.networkFee = networkFee
      const findToken = tokenList.find(
        (o) => o.address.toLowerCase() === last.tokenAddress.toLowerCase() && o.chainId === chainId
      )
      //!TODO ...should check symbol and amount in chain
      let token: AssetsToken = {
        isNative: false,
        isToken: true,
        chainId: chainId,
        decimals: 0,
        symbol: '',
        name: '',
        address: last.tokenAddress,
        balance: '',
        price: 0,
        image: '',
        source: 'all',
        id: `${last.tokenAddress}-${chainId}-${last.symbol}`,
        formatted: '',
      }
      if (findToken) {
        token = findToken
      }
      result.fromSwapTokens = {
        token,
        chain: undefined,
        balance: undefined,
      }
      result.toSwapTokens = {
        token,
        chain: undefined,
        balance: undefined,
      }
      result.fromAmount = ''
      result.toAmount = ''
      result.source = 'OKX'
      return result
    }

    //other methodID or empty methodID check if is swap
    let isSwap = false
    if (list.length === 2) {
      isSwap = list[0].amount !== '0' && list[0].symbol !== list[1].symbol && !!list[0].methodId
    }
    if (list.length > 2) {
      if (list[0].amount !== '0') {
        isSwap = list[0].symbol !== list[list.length - 1].symbol && !!list[0].methodId
      } else {
        isSwap = list[1].symbol !== list[list.length - 1].symbol && !!list[0].methodId
      }
    }
    //check if address is user
    const fromList = list.filter(
      (i) => i.amount !== '0' && checkIfAddressUser(i.from[0].address, user)
    )
    const toList = list.filter(
      (i) => i.amount !== '0' && !checkIfAddressUser(i.from[0].address, user)
    )
    //check swap again
    if (isSwap && toList.length === 0) {
      isSwap = false
    }

    if (isSwap) {
      const fromChainId = Number(fromList[0].chainIndex)

      const findFromToken = tokenList.find(
        (o) =>
          o.address.toLowerCase() === fromList[0].tokenAddress.toLowerCase() &&
          o.chainId === fromChainId
      )

      let fromToken: AssetsToken = {
        isNative: !fromList[0].tokenAddress,
        isToken: !!fromList[0].tokenAddress,
        chainId: fromChainId,
        decimals: 0,
        symbol: fromList[0].symbol,
        name: fromList[0].symbol,
        address: fromList[0].tokenAddress,
        balance: '',
        price: 0,
        image: '',
        source: 'all',
        id: `${fromList[0].tokenAddress}-${fromChainId}-${fromList[0].symbol}`,
        formatted: '',
      }
      if (findFromToken) {
        fromToken = findFromToken
      }
      let fromNum = BigNumber('0')
      for (let j = 0; j < fromList.length; j++) {
        fromNum = fromNum.plus(fromList[j].amount)
      }
      result.fromAmount = fromNum.toString()

      const toChainId = Number(toList[0].chainIndex)

      const findToToken = tokenList.find(
        (o) =>
          o.address.toLowerCase() === toList[0].tokenAddress.toLowerCase() &&
          o.chainId === toChainId
      )
      let toToken: AssetsToken = {
        isNative: !toList[0].tokenAddress,
        isToken: !!toList[0].tokenAddress,
        chainId: toChainId,
        decimals: 0,
        symbol: toList[0].symbol,
        name: toList[0].symbol,
        address: toList[0].tokenAddress,
        balance: '',
        price: 0,
        image: '',
        source: 'all',
        id: `${toList[0].tokenAddress}-${toChainId}-${toList[0].symbol}`,
        formatted: '',
      }
      if (findToToken) {
        toToken = findToToken
      }
      let toNum = BigNumber('0')
      for (let j = 0; j < toList.length; j++) {
        toNum = toNum.plus(toList[j].amount)
      }
      result.toAmount = toNum.toString()
      result.fromSwapTokens = {
        token: fromToken,
        chain: getChainByChainId(fromChainId),
        balance: undefined,
      }
      result.toSwapTokens = {
        token: toToken,
        chain: getChainByChainId(toChainId),
        balance: undefined,
      }
      result.toAddress = toList[0].to[0].address
      result.historyType = 'Swap'
      result.source = 'OKX'
      return result
    }

    let isNative = !last.tokenAddress
    // if (chainId === chains.sui.id) {
    //   if (last.tokenAddress === SUI_TYPE_ARG) {
    //     isNative = true
    //   }
    // }

    const findToken = tokenList.find(
      (o) =>
        o.address.toLowerCase() === last.tokenAddress.toLowerCase() && o.chainId === lastChainId
    )
    let token: AssetsToken = {
      isNative,
      isToken: !isNative,
      chainId: lastChainId,
      decimals: 0,
      symbol: last.symbol,
      name: last.symbol,
      address: last.tokenAddress,
      balance: '',
      price: 0,
      image: '',
      source: 'all',
      id: `${last.tokenAddress}-${lastChainId}-${last.symbol}`,
      formatted: '',
    }
    if (findToken) {
      token = findToken
    }
    result.fromSwapTokens = {
      token,
      chain: getChainByChainId(lastChainId),
      balance: undefined,
    }
    result.toSwapTokens = {
      token,
      chain: getChainByChainId(lastChainId),
      balance: undefined,
    }
    result.toAddress = last.to[0].address
    let amountNum = BigNumber('0')
    // for Dogecoin
    if (list[0].symbol === 'DOGE') {
      for (let j = 0; j < list.length; j++) {
        // @ts-ignore
        amountNum = amountNum.plus(list[j].to[0]?.amount)
      }
    } else {
      for (let j = 0; j < list.length; j++) {
        if (list[j].tokenAddress === last.tokenAddress) {
          amountNum = amountNum.plus(list[j].amount)
        }
      }
    }
    result.fromAmount = amountNum.toString()
    result.toAmount = amountNum.toString()
    // !Warning sui address should test, and other no evm address, eg.
    // if (chainId === chains.sui.id) {
    //   result.historyType =
    //     last.to[0].address.toLowerCase() === user.suiAddress?.toLowerCase() ? 'Receive' : 'Send'
    // } else {
    // }
    result.historyType =
      last.to[0].address.toLowerCase() ===
      userChainAddressList(user, (result.chain as IWeb3ChainType).id).toLowerCase()
        ? 'Receive'
        : 'Send'
    // !Warning sol address should check
    if (chainId === chains.solana.id && result.historyType === 'Receive') {
      let fromAddrCount = 0
      let toAddrCount = 0
      for (let j = 0; j < list.length; j++) {
        const tx = list[j]
        if (
          tx.from[0].address?.toLowerCase() === user.solanaAddress?.toLowerCase() &&
          tx.symbol?.toLowerCase() === result.fromSwapTokens?.token?.symbol?.toLowerCase()
        ) {
          fromAddrCount++
        }
        if (
          tx.to[0].address?.toLowerCase() === user.solanaAddress?.toLowerCase() &&
          tx.symbol?.toLowerCase() === result.fromSwapTokens?.token?.symbol?.toLowerCase()
        ) {
          toAddrCount++
        }
      }
      if (fromAddrCount === toAddrCount && fromAddrCount !== 0) {
        return null
      }
    }
    result.source = 'OKX'
    if (first.methodId === '0xae2915f7') {
      result.historyType = 'Withdraw'
      result.fromAddress = [first.from[0].address, first.to[0].address, last.from[0].address, last.to[0].address].find(i => i.toLowerCase() !== user.ethereumAddress.toLowerCase())
      result.toAddress = user.ethereumAddress
    }
    // if (first.methodId === '0x185f755c') {
    //   result.historyType =  'Reward'
    // }
    return result
  } catch (e) {
    console.warn('okx history get error', e)
  }
  return null
}

export const formatterSolTransactionReceipt = (receipt: any) => {
  return {
    endTime: ((receipt.blockTime as number) * 1000).toString(),
    gasAmount: formatUnits(
      BigInt(receipt.meta.fee),
      chains.solana.chain?.nativeCurrency.decimals || 9
    ),
    blockNumber: '',
    toAddress: '',
    toHash: ''
  }
}

export const formatterEvmTransactionReceipt = (
  receipt: GetTransactionReceiptReturnType,
  decimals: number
) => {
  const toHash = receipt.transactionHash
  const blockNumber = receipt.blockNumber.toString()
  const gasAmount = formatUnits(receipt.gasUsed, decimals)
  const toAddress = receipt.to
  return {
    blockNumber,
    gasAmount,
    toAddress,
    endTime: '',
    toHash
  }
}

