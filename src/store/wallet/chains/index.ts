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

export const allChainsUSDT = [
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    chainId: 1,
    chain: 'ETH',
    chainName: 'Ethereum',
  },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    chainId: 501,
    chain: 'SOLANA',
    chainName: 'Solana',
  },
  {
    address: '0x55d398326f99059ff775485246999027b3197955',
    chainId: 56,
    chain: 'BSC',
    chainName: 'BNB Chain',
  },
  {
    address: '0xa219439258ca9da29e9cc4ce5596924745e12b93',
    chainId: 59144,
    chain: 'LINEA',
    chainName: 'Linea',
  },
  {
    address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    chainId: 84532,
    chain: 'BASE',
    chainName: 'Base',
  },
  {
    address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    chainId: 1000,
    chain: 'TRON',
    chainName: 'Tron',
  },
  {
    address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    chainId: 42161,
    chain: 'ARBITRUM',
    chainName: 'Arbitrum One',
  },
  {
    address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
    chainId: 43114,
    chain: 'AVAX',
    chainName: 'Avalanche',
  },
  {
    address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
    chainId: 137,
    chain: 'POLYGON_POS',
    chainName: 'Polygon',
  },
  {
    address: '0xf55bec9cafdbe8730f096aa55dad6d22d44099df',
    chainId: 534352,
    chain: 'SCROLL',
    chainName: 'Scroll',
  },
  {
    address: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN',
    chainId: 101,
    chain: 'SUI',
    chainName: 'Sui',
  },
  {
    address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    chainId: 10,
    chain: 'OPTIMISM',
    chainName: 'Optimism',
  },
  {
    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    chainId: 1100, // 1101,
    chain: 'TON',
    chainName: 'TON',
  },
  {
    address: '0xfe9f969faf8ad72a83b761138bf25de87eff9dd2',
    chainId: 200901,
    chain: 'BITLAYER',
    chainName: 'Bitlayer',
  },
  {
    address: '0xbE138aD5D41FDc392AE0B61b09421987C1966CC3',
    chainId: 5545,
    chain: 'DUCKCHAIN',
    chainName: 'DuckChain Mainnet',
  },
]

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
