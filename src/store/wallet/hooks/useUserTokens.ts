import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAllBalance, v1AllAssetApi } from '@/api/wallet'

import { useStore } from '@/store'
import { shallow } from 'zustand/shallow'
import { CustomListInfo, WhiteListInfo } from '../type'
import chains from '../chains'

const useUserTokens = () => {
  const user = useStore((state) => state.walletUserInfo)
  const customTokens = useStore((state) => state.customTokens)
  const whiteTokens = useStore((state) => state.whiteTokens)
  const { ethereumAddress: evmAddress, solanaAddress, suiAddress } = user

  const { whiteTokensActions, customTokensActions } = useStore(
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
          sui_address: suiAddress ?? '',
        }) as Promise<WhiteListInfo[]>,
        v1AllAssetApi({
          page: 1,
          pageSize: 250,
        }) as Promise<CustomListInfo[]>,
      ])
      if (results.length > 0) {
        const whiteList = results[0].filter(
          (i) =>
            i.chain_id === chains.bsc.id ||
            i.chain_id === chains.ethereum.id ||
            i.chain_id === chains.solana.id ||
            i.chain_id === chains.ton.id
        )
        const customList = results[1].filter(
          (i) =>
            i.chain_id === chains.bsc.id ||
            i.chain_id === chains.ethereum.id ||
            i.chain_id === chains.solana.id ||
            i.chain_id === chains.ton.id
        )

        whiteTokensActions(whiteList)
        customTokensActions(customList)
      }
      return results
    },
    refetchInterval: 15_000,
  })
  return {
    ...query,
    customTokens,
    whiteTokens,
  }
}

export default useUserTokens
