import { IWeb3ChainType } from '@/store/wallet/chainType'
import { useQuery } from '@tanstack/react-query'
import { queryTransaction } from './useTonTransactions'

export const getTransactionHash = async ({
  chain,
  hash,
  tonAddress
}: {
  chain: IWeb3ChainType | undefined
  hash: string | undefined
  tonAddress: string | undefined
}) => {
  if (!hash) return hash
  if (chain?.type !== 'TON') {
    return hash
  }
  const result = await queryTransaction(`${tonAddress}`, hash)
  return result?.hashHex
}

const useTransactionHash = ({
  chain,
  hash,
  tonAddress
}: {
  chain: IWeb3ChainType | undefined
  hash: string | undefined
  tonAddress: string | undefined
}) => {
  return useQuery({
    queryKey: ['transactionHash', chain, hash, tonAddress],
    queryFn: async () => {
      return await getTransactionHash({ chain, hash, tonAddress })
    }
  })
}

export default useTransactionHash
