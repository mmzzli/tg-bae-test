import { useEffect, useMemo } from 'react'
import chains, { okxChains } from '../chains'
import useGetTokenList from './useGetTokenList'
import { useOkxBalanceAccount } from './useOkxAccount'
import useTonBalance from './useTonBalance'
import useTonJettonsBalance from './useTonJettonsBalance'
import { IChainType } from '../chainType'
import { BalanceToken } from '../tokenType/BalanceToken'
import { AssetsToken } from '../tokenType/AssetsToken'
import { formatUnits, parseUnits } from 'viem'
import { getChainByChainId, getWalletTokensKey, jsonFilter, setCache } from '../util/tokenHelper'
import {
  ReportSourcePendingToIHistoryType,
  reportTx,
  txListToTransactionsType,
  txsFilter,
} from '../util/txHelper'
import { useStore } from '@/store'
import { IHistoryType, ReportHistoryType, ReportSourceType } from '../type'
import useGetTransactionsStatus from './useGetTransactionsStatus'
import { getTransactionDetail } from '../util/transaction/getTransactionDetail'
import { txReportListGet } from '@/api/wallet'
import useAsyncEffect from 'ahooks/lib/useAsyncEffect'

const useTokens = () => {
  const okxBalancesQuery = useOkxBalanceAccount(okxChains.map((i) => i.id).join(','))
  const { walletTokens, refetch, isLoading: tokenListLoading } = useGetTokenList()

  const tonBalanceQuery = useTonBalance()
  const tonJettonBalanceQuery = useTonJettonsBalance()
  const { getTransactionStatus } = useGetTransactionsStatus()
  const {
    tokenList,
    refreshTime,
    tokensActions,
    updateLoadingState,
    walletTxUpdateActions,
    walletTxReportActions,
    walletTxsActions,
  } = useStore((state) => {
    return {
      tokenList: state.tokenList,
      refreshTime: state.refreshTime,
      tokensActions: state.tokensActions,
      updateLoadingState: state.updateLoadingState,
      walletTxUpdateActions: state.walletTxUpdateActions,
      walletTxReportActions: state.walletTxReportActions,
      walletTxsActions: state.walletTxsActions,
    }
  })

  const balances = useMemo(
    () => [
      ...(okxBalancesQuery.data ? okxBalancesQuery.data : []),
      ...(tonJettonBalanceQuery.data ? tonJettonBalanceQuery.data : []),
    ],
    [okxBalancesQuery.data, tonJettonBalanceQuery.data]
  )

  const tonNativeBalance = useMemo(() => {
    const tonNativeCurrency = (chains.ton.chain as IChainType).nativeCurrency
    return {
      isNative: true,
      isToken: false,
      chainId: chains.ton.id,
      decimals: tonNativeCurrency.decimals,
      symbol: tonNativeCurrency.symbol,
      name: chains.ton.name,
      address: '',
      balance: tonBalanceQuery.data?.balance,
      formatted: tonBalanceQuery.data?.formatted.toString(),
      value: tonBalanceQuery.data?.balance.toString(),
      type: undefined,
    } as BalanceToken
  }, [tonBalanceQuery])

  const listBalance: BalanceToken[] = useMemo(() => {
    const values = balances ? [...balances, tonNativeBalance] : []
    return JSON.parse(JSON.stringify(values))
  }, [balances, tonNativeBalance])

  const mergeAllTokenList = () => {
    const balancesData = listBalance

    const source = tokenList.length ? tokenList.map((i) => ({ ...i }) as AssetsToken) : []
    if (source.length) {
      let noRiskList: AssetsToken[] = []
      if (!walletTokens.length) {
        noRiskList = [...source]
      }
      walletTokens.forEach((i) => {
        const findIdx = source.findIndex(
          (j) => i.chainId === j.chainId && i.address?.toLowerCase() === j.address?.toLowerCase()
        )

        if (findIdx === -1) {
          const id = `${i?.address}-${i.chainId}-${i.symbol}`
          const assets: AssetsToken = {
            ...i,
            id,
            balance: '0',
            formatted: '0',
          }
          noRiskList.push(assets)
        } else {
          const find = source[findIdx]
          //!warning server back price is 0
          find.price = i.price || find.price
          find.image = i.image
          find.whiteToken = i.whiteToken
          find.customToken = i.customToken
          noRiskList.push(find)
        }
      })

      //isFetching is true and data is null
      const fetching =
        (okxBalancesQuery.isFetching && !okxBalancesQuery.data) ||
        (tonBalanceQuery.isFetching && !tonBalanceQuery.data) ||
        (tonJettonBalanceQuery.isFetching && !tonJettonBalanceQuery.data)

      const noOkxError = !!okxBalancesQuery.data
      const noTonError = !!tonBalanceQuery.data && !!tonJettonBalanceQuery.data

      return noRiskList.map((assetsToken) => {
        let formatted = assetsToken.formatted
        // sol balance shoud do this
        let balance = parseUnits(
          formatted?.toString?.() ?? formatted,
          assetsToken.decimals
        ).toString()

        const find = balancesData.find(
          (balanceToken) =>
            Number(balanceToken.chainId) === Number(assetsToken.chainId) &&
            balanceToken.address?.toLocaleUpperCase() === assetsToken.address?.toLocaleUpperCase()
        )

        if (find) {
          //some rpc not give balance
          if (find?.balance) {
            balance = find.balance
            // sui rpc query balance can only get balance
            formatted = formatUnits(BigInt(balance), assetsToken.decimals || 9)
          } else {
            formatted = find?.formatted ?? '0'
            balance = parseUnits(
              formatted?.toString?.() ?? formatted,
              assetsToken.decimals
            ).toString()
          }
        }

        // not found and fetch end and no error
        if (!find && !fetching) {
          if (
            (assetsToken.chainId === chains.ton.id && noTonError) ||
            (okxChains.find((i) => i.id === assetsToken.chainId) && noOkxError)
          ) {
            balance = '0'
            formatted = '0'
          }
        }

        const assets: AssetsToken = {
          ...assetsToken,
          formatted,
          balance,
        }
        return assets
      })
    }

    const allToken = walletTokens.map((apiToken, index) => {
      const find = balancesData.find(
        (balanceToken) =>
          Number(balanceToken.chainId) === Number(apiToken.chainId) &&
          balanceToken.address?.toLocaleUpperCase() === apiToken.address?.toLocaleUpperCase()
      )
      const id = `${apiToken?.address}-${apiToken.chainId}-${apiToken.symbol}`
      let formatted = find?.formatted ?? '0'
      let balance
      if (find?.balance) {
        balance = find?.balance
        formatted = formatUnits(BigInt(balance), apiToken.decimals || 9)
      } else {
        balance = parseUnits(formatted?.toString?.() ?? formatted, apiToken.decimals).toString()
      }
      const assets: AssetsToken = {
        ...apiToken,
        id,
        formatted,
        balance,
      }
      return assets
    })
    return allToken
  }

  const updateTokenListSotre = () => {
    const tokenList = mergeAllTokenList()
    tokensActions(tokenList)
    const key = getWalletTokensKey()
    if (key && tokenList.length) setCache(key, tokenList)
  }

  const getTxReportsList = async () => {
    const txsResult = await txReportListGet({
      page: 0,
      limit: 250,
      userID: useStore.getState().walletUserInfo.id,
    })
    debugger
    if (txsResult && txsResult.records) {
      walletTxReportActions(txsResult.records)
      const txs = txsResult.records
        .filter((i: ReportHistoryType) => jsonFilter(i.source))
        .map((i: ReportHistoryType) =>
          ReportSourcePendingToIHistoryType(i, useStore.getState().tokenList)
        )
      walletTxsActions(txListToTransactionsType(txs))
    }
  }

  const txsReportShouldRefresh = async () => {
    debugger
    const txsSuccess = txsFilter(
      useStore.getState().walletTxs,
      (iHistory) => iHistory.status === 'success'
    )
    const pends = useStore
      .getState()
      .walletReportTxs.filter((i: ReportHistoryType) => jsonFilter(i.source))
      .map((i) => {
        const find = txsSuccess.find((j) => j.hash.toLowerCase() === i.tx.toLowerCase())
        if (find?.status === 'success' && i.source.includes('normal')) {
          return {
            ...i,
            source: i.source.replace('pending', 'success'),
          }
        }
        return i
      })
      .filter((i) => {
        const sourceObj: ReportSourceType = JSON.parse(i.source)
        return sourceObj.status === 'pending'
      })
    const cachedPends = pends.map((i) =>
      ReportSourcePendingToIHistoryType(i, useStore.getState().tokenList)
    )
    const usePends = pends.map((i) =>
      ReportSourcePendingToIHistoryType(i, useStore.getState().tokenList)
    )
    if (!pends.length) {
      await getTxReportsList()
      return
    }
    const fetchAllStatus = async () => {
      const results = await Promise.all(
        cachedPends.map((iHistory: IHistoryType, index) =>
          getTransactionStatus({ find: iHistory }).then((statusRes) => ({
            index,
            statusRes,
          }))
        )
      )
      results.sort((a, b) => a.index - b.index)
      return results
    }
    const statusList = await fetchAllStatus()

    if (
      cachedPends.map((iHistory) => iHistory.status).join('') ===
      statusList
        .map((result) => result.statusRes)
        .map((res) => res.status)
        .join('')
    ) {
      return
    }
    for (let i = 0; i < statusList.length; i++) {
      const index = statusList[i].index
      const tx: IHistoryType = usePends[index]
      tx.endTime = statusList[i].statusRes.extra?.endTime
        ? Number(statusList[i].statusRes.extra?.endTime)
        : undefined
      tx.status = statusList[i].statusRes.status
      tx.blocknumber = statusList[i].statusRes.extra?.blockNumber
      tx.toHash = statusList[i].statusRes.extra?.toHash
      tx.gasAmount = statusList[i].statusRes.extra?.gasAmount
      try {
        const res = await getTransactionDetail({
          hash: tx.hash,
          chainId: tx.fromSwapTokens.chain?.id,
          chainType: tx.fromSwapTokens.chain?.type,
        })
        const toRes = await getTransactionDetail({
          hash: tx.toHash,
          chainId: tx.toSwapTokens.chain?.id,
          chainType: tx.toSwapTokens.chain?.type,
        })
        if (res) {
          tx.blocknumber = res?.blocknumber
          tx.endTime = res?.timestamp
          tx.gasAmount = formatUnits(
            res?.gasAmount || 0n,
            getChainByChainId(tx.fromSwapTokens.chain?.id as number)?.chain?.nativeCurrency
              .decimals as number
          )
        }

        if (toRes)
          tx.toHashInfo = {
            blocknumber: toRes.blocknumber,
            endTime: toRes.timestamp,
            gasAmount: formatUnits(
              toRes?.gasAmount || 0n,
              getChainByChainId(tx.toSwapTokens.chain?.id as number)?.chain?.nativeCurrency
                .decimals as number
            ),
          }
      } catch (e) {
        console.warn('get gas failed')
      }
      walletTxUpdateActions(tx)
      await reportTx(tx)
    }

    await getTxReportsList()
    //Get balance immediately from rpc, not correctly, give a timeout 1s
    setTimeout(() => {
      refetch()
      okxBalancesQuery.refetch()
    }, 2000)
  }

  useAsyncEffect(async () => {
    await getTxReportsList()
  }, [])

  useEffect(() => {
    setInterval(() => {
      txsReportShouldRefresh()
    }, 1000 * 5)
  }, [])

  useEffect(() => {
    updateTokenListSotre()
  }, [JSON.stringify(listBalance)])

  useEffect(() => {
    if (walletTokens.length) {
      updateTokenListSotre()
      updateLoadingState(tokenListLoading)
    }
  }, [JSON.stringify(walletTokens), tokenListLoading])

  useEffect(() => {
    refetch()
    okxBalancesQuery.refetch()
  }, [refreshTime])
}

export default useTokens
