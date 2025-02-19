// TODO this may be replaced by wallet file src/stores/tokenStore/hooks/read/useGas.ts
import { evmChainsConfig } from '@/store/wallet/chains'
import React, { useEffect, useMemo } from 'react'
import {
  useEstimateFeesPerGas,
  useEstimateGas as useEstimateGasWagmi,
  useGasPrice,
  useTransactionCount,
} from 'wagmi'
// import { evmChainsConfig } from '@/proviers/web3Provider/chains'

export const Kwei = 1e3
export const Mwei = 1e6
export const Gwei = 1e9
export const Microether = 1e12
export const Ether = 1e18
export const gasLimit = 21000

const useGas = ({
  chainId,
  price,
}: {
  chainId: number | undefined
  price?: number | undefined
}) => {
  const gasPrice = useGasPrice({
    chainId: chainId,
  })

  const estimateFeesPerGas = useEstimateFeesPerGas({
    formatUnits: 'gwei',
    chainId: chainId,
  })

  const estimateFeesPerGasETH = useEstimateFeesPerGas({
    formatUnits: 'ether',
    chainId: chainId,
  })
  const estimateFeesPerGasWei = useEstimateFeesPerGas({
    formatUnits: 'wei',
    chainId: chainId,
  })

  const gasPriceToken = useMemo(() => {
    if (gasPrice.data) {
      const gasPriceNum = Number(gasPrice.data?.toString()) ?? 0
      const gasPriceEth = gasPriceNum / Ether
      // console.log({ gasPrice, gasPriceNum, Ether })
      return gasPriceEth * gasLimit
    }
  }, [gasPrice])

  const gasPriceUSD = useMemo(() => {
    if (typeof gasPriceToken === 'number' && typeof price === 'number') {
      return price > 0 ? gasPriceToken * price : 0
    }
    return gasPriceToken
    // console.log({ gasPrice, ethPrice })
  }, [price, gasPriceToken])

  return {
    gasPrice: gasPriceToken,
    evmGasGWei: estimateFeesPerGas.data ? estimateFeesPerGas.data.formatted.maxFeePerGas : '--',
    evmGasEther: estimateFeesPerGasETH.data
      ? estimateFeesPerGasETH.data.formatted.maxFeePerGas
      : '--',
    evmGasWei: estimateFeesPerGasWei.data
      ? estimateFeesPerGasWei.data.formatted.maxFeePerGas
      : 0.5 * Gwei,
    gasPriceUSD,
  }
}

export default useGas

export const useEstimateGas = ({
  chainId,
  transfer,
}: {
  chainId?: number
  transfer: {
    from: `0x${string}`
    to: `0x${string}`
    value: `0x${string}`
    data?: `0x${string}`
  }
}) => {
  const config = evmChainsConfig()
  const { evmGasWei } = useGas({
    chainId: chainId,
  })
  const transactionCount = useTransactionCount({
    config: config as any,
    chainId: chainId,
    address: transfer?.from,
  })
  const gas = useEstimateGasWagmi({
    chainId,
    account: transfer?.from,
    nonce: transactionCount.data,
    to: transfer?.to,
    value: BigInt(parseInt(transfer?.value) || 0),
    data: transfer?.data,
  })

  return {
    evmGasWei,
    gas,
  }
}
