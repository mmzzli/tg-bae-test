import { getConfigChainsAll, getTokenSearch } from '@/api'
import { deposit } from '@/utils/oauth/helper'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

interface IProps {
  chainId: number
  address: `0x${string}`
}
/**
 * Custom hook to determine if a deposit can be made and provides a function to initiate a deposit.
 *
 * @param {IProps} props - Contains the chain ID and token address.
 * @returns {Object} - An object containing:
 *   - `canDeposit`: A boolean indicating if a deposit can be made.
 *   - `goDeposit`: A function to initiate the deposit.
 *
 * This hook uses two queries:
 * 1. To fetch and map all chain IDs to their names.
 * 2. To search for a token using the chain name and address.
 */
export default function useDeposit({ chainId, address }: IProps): {
  canDeposit: boolean
  goDeposit: () => void
} {
  const { data: allChains } = useQuery({
    queryKey: [address, 'get-config-chains-all'],
    queryFn: async () => {
      const res = await getConfigChainsAll()
      return res?.chain_id_name
    }
  })

  const chainName = allChains?.[chainId]

  const { data: token } = useQuery({
    queryKey: [chainName, address, 'get-token-search'],
    queryFn: async () => {
      if (!chainName || !address) return ''
      const res = await getTokenSearch(address, chainName)
      return res?.[0]
    }
  })

  const goDeposit = useCallback(async () => {
    if (!token) return
    deposit({ chainId, tokenAddress: address })
  }, [address, chainId, token])

  return {
    canDeposit: !!token,
    goDeposit
  }
}
