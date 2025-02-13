// import useUserStore from '@/stores/userStore/hooks/useUserStore'
import { useQuery } from '@tanstack/react-query'
import { getAllHistoryByAccount, getAllTokenBalancesByAccount } from '@/api/wallet'
import { BalanceToken } from '../tokenType/BalanceToken'
import { useUserStore } from '../walletUser'

const getBalanceFromOkxAccount = async (params: {
  accountId: string
  chains: string
}) => {
  try {
    const tokenAssets = await getAllTokenBalancesByAccount(params)
    return tokenAssets || null
  } catch (e) {
    console.warn(e)
  }
  return null
}

export const getHistoryFromOkxAccount = async (params: {
  accountId: string
  cursor: string
  chainIndex: string
}) => {
  try {
    const ret = await getAllHistoryByAccount(params)
    return ret || null
  } catch (e) {
    console.warn(e)
  }
  return null
}

export const useOkxBalanceAccount = (chains: string) => {
  const { walletUserInfo: user } = useUserStore()
  const query = useQuery({
    queryKey: ['getBalanceFromOkxAccount', user.okxAccount, chains],
    refetchOnWindowFocus: false,
    staleTime: 0,
    refetchInterval: 20_000,
    queryFn: async () => {
      try {
        if (user.okxAccount) {
          const res = await getBalanceFromOkxAccount({
            accountId: user.okxAccount,
            chains
          })
          if (res) {
            const balanceList: BalanceToken[] = res.map((item) => {
              let address = item.tokenAddress
              const chainId = Number(item.chainIndex)
              const isNative = !item.tokenAddress
              return {
                isNative,
                isToken: !isNative,
                chainId,
                decimals: 0,
                symbol: item.symbol,
                name: item.symbol,
                address,
                balance: undefined,
                formatted: item.balance,
                value: undefined,
                type: 'okx'
              } as BalanceToken
            })
            return balanceList
          }
        }
      } catch (e) {
        console.warn(e)
      }
      return null
    }
  })
  if (!user.okxAccount) {
    return {
      data: null,
      isFetching: false,
      isError: true,
      isLoading: false,
      refetch: () => {}
    }
  }

  return query
}

export const useOkxHistoryAccount = (cursor: string, chainIndex: string) => {
  const { walletUserInfo: user } = useUserStore()

  const query = useQuery({
    queryKey: ['getHistoryFromOkxAccount', user.okxAccount, cursor],
    staleTime: 0,
    refetchInterval: 30_000,
    queryFn: async () => {
      try {
        if (user.okxAccount) {
          const resHis = await getHistoryFromOkxAccount({
            accountId: user.okxAccount,
            cursor,
            chainIndex
          })
          console.log('okx account history res', resHis)
          if (resHis) {
            return {
              cursor: resHis?.cursor,
              transactionList: resHis?.transactionList
            }
          }
        }
      } catch (e) {
        //...
      }
      return {}
    }
  })
  // 检查地址，避免发出无意义请求
  if (!user.okxAccount) {
    return {
      data: {
        cursor: '',
        transactionList: []
      },
      isFetching: false,
      isError: true,
      isLoading: false,
      refetch: () => {}
    }
  }
  return query
}
