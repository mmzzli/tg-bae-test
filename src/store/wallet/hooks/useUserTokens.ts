import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useUserStore } from '../walletUser'
import { getAllBalance, v1AllAssetApi } from '@/api/wallet'

import { useStore } from '@/store'
import { shallow } from 'zustand/shallow'
import { CustomListInfo, WhiteListInfo } from '../type'
import { useTokenStore } from '../walletToken'

const useUserTokens = () => {
  const { walletUserInfo: user } = useUserStore()
  const { customTokens, whiteTokens } = useTokenStore()
  const { ethereumAddress: evmAddress, solanaAddress } = user

  const { whiteTokensActions, customTokensActions} = useStore(
        (state) => ({
          whiteTokensActions: state.whiteTokensActions,
          customTokensActions: state.customTokensActions,
        }),
        shallow
      )

  const query = useQuery({
    queryKey: ['getUserTokensAll', user?.id, evmAddress],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const results = await Promise.all([
        getAllBalance({
          evm_address: evmAddress ?? '',
          solana_address: solanaAddress ?? '',
        }) as Promise<WhiteListInfo[]>,
        v1AllAssetApi({
          page: 1,
          pageSize: 250
        }) as Promise<CustomListInfo[]>,
      ])
      if (results.length > 0) {
        whiteTokensActions(results[0])
        customTokensActions(results[1])
      }
      return results
    },
    refetchInterval: 15_000
  })
  return {
    ...query,
    customTokens,
    whiteTokens
  }
}

export default useUserTokens
