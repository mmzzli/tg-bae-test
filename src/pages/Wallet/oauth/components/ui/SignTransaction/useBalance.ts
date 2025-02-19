import { useMemo } from 'react'
import { useBalance as useBalanceWagmi } from 'wagmi'

interface IProps {
  chainId: number
  address: `0x${string}`
  token?: `0x${string}`
  amount: number | bigint
}
  /**
   * Retrieves the balance of the specified token or native chain asset for the given address,
   * and determines whether the given amount is less than the balance.
   *
   * @param chainId the chain ID of the token or native asset to retrieve the balance for
   * @param address the address to retrieve the balance for
   * @param token the token address to retrieve the balance for (optional)
   * @param amount the amount to compare against the balance
   * @returns an object containing the balance data from useBalanceWagmi and a boolean indicating
   * whether the given amount is less than the balance
   */
export default function useBalance({
  chainId,
  address,
  token,
  amount
}: IProps) {
  const tokenBalanceRes = useBalanceWagmi({ address, chainId, token })

  const isInsufficient = useMemo(() => {
    if (!Number(amount) || Number(amount) <= 0) return false
    if (!tokenBalanceRes?.isSuccess) return false
    const balance = tokenBalanceRes?.data?.value || BigInt(0)
    return amount > balance
  }, [amount, tokenBalanceRes?.isSuccess, tokenBalanceRes?.data?.value])

  return {
    balance: tokenBalanceRes,
    isInsufficient
  }
}
