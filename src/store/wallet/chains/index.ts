import { createConfig, fallback, http } from '@wagmi/core'
import allChain from './wagmiConfig/allChain'
import bsc from './wagmiConfig/bsc'
import ethereum from './wagmiConfig/ethereum'
import solana from './wagmiConfig/solana'
import ton from './wagmiConfig/ton'

export const okxChains = [ethereum, bsc, solana]

const chains = {
  allChain,
  solana,
  bsc,
  ethereum,
  ton,
}

const prodEvmChains = [solana, bsc, ethereum, ton]
export const allChains = [...prodEvmChains]

export const UNSUPPROT_HISTORY_CHAIN = [chains.ton.id]

export const evmChainsConfig = () => {
  return createConfig({
    chains: prodEvmChains.map((item) => item.chain) as any,
    transports: Object.fromEntries(
      prodEvmChains.map((chain) => {
        const https = chain.chain?.rpcUrls?.default?.http.map((url) => url && http(url))
        return https
          ? [chain.id, fallback(https, { rank: true, retryCount: 5, retryDelay: 100 })]
          : [chain.id, http()]
      })
    ),
  })
}

export const evmChainConfig = (chainId: number) => {
  const findChains = prodEvmChains.filter((item) => item.id === chainId)
  if (!findChains.length) return undefined
  return createConfig({
    chains: findChains.map((item) => item.chain) as any,
    transports: {
      [chainId]: http(),
    },
  })
}

export default chains
