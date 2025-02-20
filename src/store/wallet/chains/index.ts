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

export const allChainsUSDC = [
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: 1,
    chain: 'ETH',
    chainName: 'Ethereum',
  },
  {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    chainId: 501,
    chain: 'SOLANA',
    chainName: 'Solana',
  },
  {
    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    chainId: 56,
    chain: 'BSC',
    chainName: 'BNB Chain',
  },
  {
    address: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
    chainId: 59144,
    chain: 'LINEA',
    chainName: 'Linea',
  },
  {
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    chainId: 8453,
    chain: 'BASE',
    chainName: 'Base',
  },
  {
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    chainId: 42161,
    chain: 'ARBITRUM',
    chainName: 'Arbitrum One',
  },
  {
    address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    chainId: 43114,
    chain: 'AVAX',
    chainName: 'Avalanche',
  },
  {
    address: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
    chainId: 137,
    chain: 'POLYGON_POS',
    chainName: 'Polygon',
  },
  {
    address: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
    chainId: 534352,
    chain: 'SCROLL',
    chainName: 'Scroll',
  },
  {
    address: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    chainId: 101,
    chain: 'SUI',
    chainName: 'Sui',
  },
  {
    address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
    chainId: 10,
    chain: 'OPTIMISM',
    chainName: 'Optimism',
  },
  {
    address: '0x9827431e8b77e87c9894bd50b055d6be56be0030',
    chainId: 200901,
    chain: 'BITLAYER',
    chainName: 'Bitlayer',
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
