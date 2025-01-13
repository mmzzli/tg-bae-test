import { http, createConfig, injected } from 'wagmi'
import { defineChain } from 'viem'
import { arbitrum, bsc, mainnet, optimism } from 'wagmi/chains'
import { tokenIconMap } from './token-icon'

const duckChainTestnet = defineChain({
  id: 202105,
  name: 'DuckChain Testnet',
  nativeCurrency: {
    name: 'TON',
    symbol: 'TON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.duckchain.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'DuckScan Testnet',
      url: 'https://testnet-scan.duckchain.io',
    },
  },
  testnet: true,
})

const bscTestnet = defineChain({
  id: 97,
  name: 'BSC Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://bsc-testnet-rpc.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BscScan Testnet',
      url: 'https://testnet.bscscan.com',
    },
  },
  testnet: true,
})

export const evmChainList =
  import.meta.env.VITE_APP_ENV === 'production' ? ([bsc] as const) : ([bsc, bscTestnet] as const)

const usdtAddressOnEvm = {
  [arbitrum.id]: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  [bsc.id]: '0x55d398326f99059ff775485246999027b3197955',
  [mainnet.id]: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  [optimism.id]: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  [duckChainTestnet.id]: '',
  [bscTestnet.id]: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
}
const usdcAddressOnEvm = {
  [arbitrum.id]: '',
  [bsc.id]: '',
  // [bsc.id]: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
  [mainnet.id]: '',
  [optimism.id]: '',
  [duckChainTestnet.id]: '',
  [bscTestnet.id]: '',
}
const contractAddress = {
  [duckChainTestnet.id]: '0x84868afcC4Ba758a4ae2aca141D2fF0ECD8C5fac',
  [bscTestnet.id]: '0xF165cFb92441544cF9DEF72427028Db85b0aDEe2',
  [bsc.id]: '0x359E9Ef12132ea2a49701F838B5CdFbc13771AaF',
}

export const config = createConfig({
  chains: evmChainList,
  connectors: [injected()],
  transports: {
    [arbitrum.id]: http(),
    [bsc.id]: http(),
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [duckChainTestnet.id]: http(),
    [bscTestnet.id]: http(),
  },
})

export const supportEVMTokenList = evmChainList
  .map((chain) => [
    {
      chainId: chain.id,
      chainName: chain.name,
      token: chain.nativeCurrency.symbol,
      icon: tokenIconMap['ETH'],
      isNative: true,
      address: '',
      rewardContractAddress: contractAddress[chain.id as keyof typeof contractAddress],
    },
    {
      chainId: chain.id,
      chainName: chain.name,
      token: 'USDT',
      icon: tokenIconMap['USDT'],
      address: usdtAddressOnEvm[chain.id],
      rewardContractAddress: contractAddress[chain.id as keyof typeof contractAddress],
    },
    {
      chainId: chain.id,
      chainName: chain.name,
      token: 'USDC',
      icon: tokenIconMap['USDC'],
      address: usdcAddressOnEvm[chain.id],
      rewardContractAddress: contractAddress[chain.id as keyof typeof contractAddress],
    },
  ])
  .flat()
  .filter((token) => token.isNative || token.address)
