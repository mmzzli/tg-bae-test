import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTokenBalance, tonDecimals } from '../config/ton'
import { formatUnits } from 'viem'
import { BalanceToken } from '../tokenType/BalanceToken'
import chains from '../chains'
import useGetTokenList from './useGetTokenList'
import { useStore } from '@/store'

const getTonBalance = async ({
  token,
  decimals,
  symbol,
  tonAddress,
}: {
  token: string | undefined
  decimals?: number | undefined
  symbol?: string | undefined
  tonAddress?: string | undefined
}) => {
  if (token) {
    const balance = await getTokenBalance({
      tonAddress: tonAddress ?? '',
      tokenAddress: token,
    })

    return {
      decimals,
      symbol,
      formatted: formatUnits(balance.value, decimals || tonDecimals) || '0',
      value: balance.value || 0n,
      token,
    }
  }
  return undefined
}

const useTonJettonsBalance = () => {
  const user = useStore((state) => state.walletUserInfo)
  const { tonToken } = useGetTokenList()

  const jettonTokens = tonToken.filter((item) => {
    return !!item.address
  })
  console.log(jettonTokens, 'jettonTokens')
  const jettonTokenBalancesQuery = useQuery({
    queryKey: [
      'TonJettonsBalance',
      user.tonAddress,
      ...jettonTokens.map((item) => {
        return item.address
      }),
    ],
    staleTime: 0,
    refetchInterval: 20_000,
    queryFn: async () => {
      console.log('useToken useTonJettonsBalance1', user.tonAddress)
      if (user.tonAddress) {
        try {
          const querys = jettonTokens.map((item) => {
            return getTonBalance({
              token: item?.address,
              decimals: item?.decimals,
              symbol: item?.symbol,
              tonAddress: user.tonAddress,
            })
          })
          const balances = await Promise.allSettled(querys)
          console.log('useToken useTonJettonsBalance2', balances)
          return balances
        } catch (error) {
          console.log('jettonTokenBalancesQuery error', error)
          console.warn(error)
        }
        return undefined
      }
      console.log('useToken useTonJettonsBalance3')
      return undefined
    },
  })

  const jettonTokenBalance = useMemo(() => {
    if (jettonTokenBalancesQuery.data) {
      return jettonTokenBalancesQuery.data
        .map((item) => {
          if (item.status === 'fulfilled') {
            const data = item.value
            const find = jettonTokens.find((token) => {
              const dataAddr = (data as any)?.token ?? ''
              return token.address.toLocaleUpperCase() === dataAddr.toLocaleUpperCase()
            })

            const token: BalanceToken = {
              isNative: false,
              isToken: true,
              chainId: chains.ton.id,
              decimals: data?.decimals ? data?.decimals : (find?.decimals ?? 0),
              symbol: find?.symbol ?? '',
              name: find?.symbol ?? '',
              address: find?.address ?? '',
              balance: (data?.value as bigint).toString(),
              formatted: data?.formatted?.toString(),
              value: (data?.value as bigint).toString(),
            }

            return token
          }
          return undefined
        })
        .filter((item) => item !== undefined)
    }
    return undefined
  }, [jettonTokenBalancesQuery.data, jettonTokens])

  return {
    ...jettonTokenBalancesQuery,
    data: jettonTokenBalance ? [...jettonTokenBalance] : null,
  }
}

export default useTonJettonsBalance
