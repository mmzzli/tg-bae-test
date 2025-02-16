import { useEstimateGas } from '@/hooks/oauth/useGas'
import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { useBalance } from 'wagmi'
import { GasFeeStatus } from './const'

interface IProps {
  chainId?: number
  amount: bigint
  isNativeToken?: boolean
  customGas?: bigint
  decimals?: number
  transfer: {
    from: `0x${string}`
    to: `0x${string}`
    value: `0x${string}`
    data?: `0x${string}`
  }
}

/**
 * Compute gas fee for a given transfer on a given chain.
 *
 * @param {number} chainId The id of the chain to compute the gas fee for.
 * @param {ITransfer} transfer The transfer object to compute gas fee for.
 * @param {BigInt} amount The amount of the transfer, in Wei.
 * @param {boolean} isNativeToken Whether the token is native to the chain.
 * @param {number} decimals The number of decimals the token has.
 */
export function useEstimateGasFee({
  chainId,
  transfer,
  amount,
  isNativeToken,
  decimals = 18
}: IProps) {
  const nativeBalanceRes = useBalance({
    address: transfer.from,
    chainId
  })
  const { gas, evmGasWei: gasWei } = useEstimateGas({
    chainId: chainId,
    transfer
  })

  const computedGas = useMemo(() => {
    if (gas?.data) return gas?.data
    if (isNativeToken) return BigInt(21000)
    return BigInt(0)
  }, [gas?.data, isNativeToken])

  const gasFee = useMemo(() => {
    if (!computedGas || !gasWei) {
      return {
        value: BigInt(0),
        formatted: '0'
      }
    }

    return calcGasFee(computedGas, gasWei, decimals)
  }, [computedGas, gasWei, decimals])

  const isInsufficient = useMemo(() => {
    if (!gasFee?.value) return false
    if (!nativeBalanceRes?.isSuccess) return false

    const gasValue = gasFee?.value
    const balance = nativeBalanceRes?.data?.value
    if (isNativeToken) {
      return gasValue + amount > balance
    }
    return gasValue > balance
  }, [
    gasFee?.value,
    nativeBalanceRes?.isSuccess,
    nativeBalanceRes?.data?.value,
    isNativeToken,
    amount
  ])

  return {
    gas: computedGas,
    gasWei,
    gasFee,
    isInsufficient
  }
}

/**
 * Compute gas fee for a given transfer on a given chain,
 * and support custom gas and custom gas price
 *
 * @param {number} chainId The id of the chain to compute the gas fee for.
 * @param {ITransfer} transfer The transfer object to compute gas fee for.
 * @param {BigInt} amount The amount of the transfer, in Wei.
 * @param {boolean} isNativeToken Whether the token is native to the chain.
 * @param {number} decimals The number of decimals the token has.
 */
export default function useGas({
  chainId,
  transfer,
  amount,
  isNativeToken,
  decimals = 18
}: IProps) {
  const [gasFeeStatus, setGasFeeStatus] = useState(GasFeeStatus.UNKNOWN)
  const [gas, setGas] = useState(BigInt(0))
  const [gasWei, setGasWei] = useState<string | number>(0)

  const estimateGasFee = useEstimateGasFee({
    chainId,
    transfer,
    amount,
    isNativeToken,
    decimals
  })
  const computedGasWei = gasWei || estimateGasFee.gasWei
  const computedGas = gas || estimateGasFee.gas

  const computedGasFee = useMemo(() => {
    if (Number(gas) && Number(gasWei))
      return calcGasFee(gas, gasWei || estimateGasFee.gasWei, decimals)

    return estimateGasFee.gasFee
  }, [decimals, estimateGasFee.gasFee, estimateGasFee.gasWei, gas, gasWei])

  return {
    gasFeeStatus,
    setGasFeeStatus,
    gas: computedGas,
    setGas,
    gasWei: computedGasWei,
    setGasWei,
    gasFee: computedGasFee,
    estimateGasFee
  }
}

/**
 * Calculate gas fee for a given gas and gas price in Wei.
 */
export const calcGasFee = (
  gas: bigint | number | string,
  gasWei: string | number,
  decimals: number
) => {
  const fee = new BigNumber(Number(gas)).multipliedBy(gasWei)
  return {
    value: BigInt(Number(fee)),
    formatted: fee.dividedBy(10 ** decimals).toFixed()
  }
}
