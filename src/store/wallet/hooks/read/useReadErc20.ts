import { useReadContract } from 'wagmi'
import { erc20Abi, zeroAddress } from 'viem'
import { Config, multicall, readContract } from '@wagmi/core'
import { evmChainConfig } from '../../chains'

export function useReadErc20Decimals({
  chainId,
  tokenAddress,
}: {
  chainId: number | undefined
  tokenAddress: `0x${string}` | undefined
}) {
  const result = useReadContract({
    address: tokenAddress ?? zeroAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    chainId,
  })

  const { data: decimals, isError, isLoading } = result

  return { decimals, isLoading, isError, readRes: result }
}

export function useReadErc20Symbol({
  chainId,
  tokenAddress,
}: {
  chainId: number | undefined
  tokenAddress: `0x${string}` | undefined
}) {
  const result = useReadContract({
    address: tokenAddress ?? zeroAddress,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId,
  })

  const { data: symbol, isError, isLoading } = result

  return { symbol, isLoading, isError, readRes: result }
}
export function useReadErc20Name({
  chainId,
  tokenAddress,
}: {
  chainId: number | undefined
  tokenAddress: `0x${string}` | undefined
}) {
  const result = useReadContract({
    address: tokenAddress ?? zeroAddress,
    abi: erc20Abi,
    functionName: 'name',
    chainId,
  })

  const { data: name, isError, isLoading } = result

  return { name, isLoading, isError, readRes: result }
}

export async function getNoMulticallTokenInfo({
  chainId,
  tokenAddress,
}: {
  chainId: number
  tokenAddress: `0x${string}` | undefined
}) {
  const result = {
    decimals: 0,
    symbol: '',
    name: '',
    image: '',
  }
  try {
    const tokenInfos: any = [
      { address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
      { address: tokenAddress, abi: erc20Abi, functionName: 'symbol' },
      { address: tokenAddress, abi: erc20Abi, functionName: 'name' },
    ]
    result.decimals = (await readContract(
      evmChainConfig(chainId) as Config,
      tokenInfos[0]
    )) as number
    result.symbol = (await readContract(evmChainConfig(chainId) as Config, tokenInfos[1])) as string
    result.name = (await readContract(evmChainConfig(chainId) as Config, tokenInfos[2])) as string
  } catch (e) {
    console.log('no multicall get e', e)
  }
  return result
}

export async function getMulticallTokenInfo({
  chainId,
  tokenAddress,
}: {
  chainId: number
  tokenAddress: `0x${string}` | undefined
}) {
  const result = {
    decimals: 0,
    symbol: '',
    name: '',
    image: '',
  }
  try {
    const tokenInfos: any = [
      { address: tokenAddress, abi: erc20Abi, functionName: 'decimals' },
      { address: tokenAddress, abi: erc20Abi, functionName: 'symbol' },
      { address: tokenAddress, abi: erc20Abi, functionName: 'name' },
    ]
    const mergeList = (await multicall(evmChainConfig(chainId) as Config, {
      contracts: tokenInfos,
    })) as any[]
    result.decimals = mergeList[0].status === 'success' ? mergeList[0].result : 0
    result.symbol = mergeList[1].status === 'success' ? mergeList[1].result : ''
    result.name = mergeList[2].status === 'success' ? mergeList[2].result : ''
  } catch (e) {
    console.log('multicall e', e)
    return await getNoMulticallTokenInfo({
      chainId,
      tokenAddress,
    })
  }
  return result
}
