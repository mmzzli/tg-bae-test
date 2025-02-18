import chains, { evmChainsConfig } from '@/store/wallet/chains'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { estimateFeesPerGas, prepareTransactionRequest } from '@wagmi/core'
import { formatUnits } from 'viem'

interface EvmGasParamsType {
  fromAddress: string
  toAddress: string
  token: AssetsToken
  data?: string
  chainId: number
}
export type GasFee = string // the min unit of gas
const getEvmGas = async (params: EvmGasParamsType): Promise<GasFee> => {
  const { fromAddress, toAddress, token, data, chainId } = params
  const config = evmChainsConfig()
  try {
    const to = token.isNative ? toAddress : token.address
    const { maxFeePerGas, gas, gasPrice } = await prepareTransactionRequest(config, {
      chainId: chainId,
      account: fromAddress as `0x${string}`,
      to: to as `0x${string}`,
      value: BigInt('0'),
      data: data as `0x${string}` | undefined,
    })

    const gasFee = formatUnits(
      gas * (maxFeePerGas ?? gasPrice),
      chains.ethereum.chain?.nativeCurrency.decimals ?? 18
    )
    return gasFee
  } catch (e) {
    console.warn(e)
    return '0'
  }
}

export const getEvmGasBigint = async (params: EvmGasParamsType): Promise<BigInt> => {
  const { fromAddress, toAddress, token, data, chainId } = params
  const config = evmChainsConfig()
  try {
    const to = token.isNative ? toAddress : token.address
    const { maxFeePerGas, gas, gasPrice } = await prepareTransactionRequest(config, {
      chainId: chainId,
      account: fromAddress as `0x${string}`,
      to: to as `0x${string}`,
      value: BigInt('0'),
      data: data as `0x${string}` | undefined,
    })

    return gas
  } catch (e) {
    console.warn(e)
    return 200000n
  }
}

export default getEvmGas
