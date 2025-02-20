import { getTonBalance } from '../config/ton'
import { useQuery } from '@tanstack/react-query'
import { useUserStore } from '../walletUser'

interface useTonBalanceReturnType {
  balance: string
  formatted: string
}
const useTonBalance = () => {
  const { walletUserInfo: user } = useUserStore()

  return useQuery({
    queryKey: ['TonBalance', user?.tonAddress],
    staleTime: 0,
    refetchInterval: 30_000,
    queryFn: async () => {
      console.log('useToken useTonBalance1')
      if (user?.tonAddress) {
        try {
          const value = (await getTonBalance({
            tonAddress: user?.tonAddress
          })) as useTonBalanceReturnType

          console.log('useToken useTonBalance2', value)
          return value
        } catch (error) {
          console.log('useToken useTonBalance3', error)
          console.warn(error)
        }
      }
      console.log('useToken useTonBalance4')
      return {
        balance: '0',
        formatted: '0'
      }
    }
  })
}

export default useTonBalance
