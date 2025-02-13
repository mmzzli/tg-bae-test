import { getTonBalance } from '../config/ton'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import useLoginInfo from '../../../../hooks/useLoginInfo'
import commonStore from '@/stores/commonStore'

interface useTonBalanceReturnType {
  balance: string
  formatted: string
}
const useTonBalance = () => {
  const { tonAddress } = useLoginInfo()
  const { balanceFetchSwitch } = commonStore

  return useQuery({
    queryKey: ['TonBalance', tonAddress],
    staleTime: 0,
    enabled: balanceFetchSwitch,
    refetchInterval: 30_000,
    queryFn: async () => {
      console.log('useToken useTonBalance1')
      if (tonAddress) {
        try {
          const value = (await getTonBalance({
            tonAddress
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
