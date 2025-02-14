import { useMemo } from 'react'
import { useEstimateFeesPerGas, useGasPrice } from 'wagmi'

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
    evmGasGWei: estimateFeesPerGas.data ? estimateFeesPerGas.data.formatted.maxFeePerGas : '0',
    gasPriceUSD,
  }
}

export default useGas
