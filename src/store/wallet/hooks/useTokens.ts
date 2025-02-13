import { useEffect, useMemo } from "react";
import chains, { okxChains } from "../chains";
import useGetTokenList from "./useGetTokenList";
import { useOkxBalanceAccount } from "./useOkxAccount";
import useTonBalance from "./useTonBalance";
import useTonJettonsBalance from "./useTonJettonsBalance";
import { IChainType } from "../chainType";
import { BalanceToken } from "../tokenType/BalanceToken";
import { useTokenStore } from "../walletToken";
import { AssetsToken } from "../tokenType/AssetsToken";
import { formatUnits, parseUnits } from "viem";
import { getWalletTokensKey, setCache } from "../util/tokenHelper";

const useTokens = () => {
  const okxBalancesQuery = useOkxBalanceAccount(
    okxChains.map((i) => i.id).join(',')
  )
  const {
    walletTokens,
    refetch,
    isLoading: tokenListLoading
  } = useGetTokenList()

  const tonBalanceQuery = useTonBalance()
  const tonJettonBalanceQuery = useTonJettonsBalance()
  const { tokenList, refreshTime, tokensActions, updateLoadingState } = useTokenStore()

  const balances = useMemo(
    () => [
      ...(okxBalancesQuery.data ? okxBalancesQuery.data : []),
      ...(tonJettonBalanceQuery.data ? tonJettonBalanceQuery.data : []),
    ],
    [
      okxBalancesQuery.data,
      tonJettonBalanceQuery.data,
    ]
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
      type: undefined
    } as BalanceToken
  }, [tonBalanceQuery])

  const listBalance: BalanceToken[] = useMemo(() => {
    const values = balances
      ? [...balances, tonNativeBalance]
      : []
    return JSON.parse(JSON.stringify(values))
  }, [balances, tonNativeBalance])

  const mergeAllTokenList = () => {
    const balancesData = listBalance

    const source = tokenList.length
      ? tokenList.map((i) => ({ ...i }) as AssetsToken)
      : []
    if (source.length) {
      let noRiskList: AssetsToken[] = []
      if (!walletTokens.length) {
        noRiskList = [...source]
      }
      walletTokens.forEach((i) => {
        const findIdx = source.findIndex(
          (j) =>
            i.chainId === j.chainId &&
            i.address?.toLowerCase() === j.address?.toLowerCase()
        )

        if (findIdx === -1) {
          const id = `${i?.address}-${i.chainId}-${i.symbol}`
          const assets: AssetsToken = {
            ...i,
            id,
            balance: '0',
            formatted: '0'
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
            balanceToken.address?.toLocaleUpperCase() ===
              assetsToken.address?.toLocaleUpperCase()
        )

        if (find) {
          //some rpc not give balance
          if (find?.balance) {
            balance = find.balance
            // sui rpc query balance can only get balance
            formatted = formatUnits(
              BigInt(balance),
              assetsToken.decimals || 9
            )
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
            (okxChains.find((i) => i.id === assetsToken.chainId) &&
              noOkxError)
          ) {
            balance = '0'
            formatted = '0'
          }
        }

        const assets: AssetsToken = {
          ...assetsToken,
          formatted,
          balance
        }
        return assets
      })
    }

    const allToken = walletTokens.map((apiToken, index) => {
      const find = balancesData.find(
        (balanceToken) =>
          Number(balanceToken.chainId) === Number(apiToken.chainId) &&
          balanceToken.address?.toLocaleUpperCase() ===
            apiToken.address?.toLocaleUpperCase()
      )
      const id = `${apiToken?.address}-${apiToken.chainId}-${apiToken.symbol}`
      let formatted = find?.formatted ?? '0'
      let balance
      if (find?.balance) {
        balance = find?.balance
        formatted = formatUnits(BigInt(balance), apiToken.decimals || 9)
      } else {
        balance = parseUnits(
          formatted?.toString?.() ?? formatted,
          apiToken.decimals
        ).toString()
      }
      const assets: AssetsToken = {
        ...apiToken,
        id,
        formatted,
        balance
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

  useEffect(() => {
    console.log('xxxxxxx1')
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