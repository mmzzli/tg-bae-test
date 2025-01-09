import { AnkrProvider, Blockchain } from '@ankr.com/ankr.js';
import { useCallback, useMemo } from 'react';

const ANKR_ENDPOINT = import.meta.env.VITE_ANKR_ENDPOINT;

// 定义区块链常量和对应的 chainId
const blockchains = {
  eth: 'eth' as Blockchain,
  bsc: 'bsc' as Blockchain,
  arbitrum: 'arbitrum' as Blockchain,
  optimism: 'optimism' as Blockchain,
  bscTestnet: 'bscTestnet' as Blockchain
} as const;

// chainId 到区块链名称的映射
export const CHAIN_ID_TO_NETWORK: { [key: number]: Blockchain } = {
  1: blockchains.eth,      // Ethereum Mainnet
  56: blockchains.bsc,     // BSC Mainnet
  42161: blockchains.arbitrum,  // Arbitrum One
  10: blockchains.optimism,     // Optimism
  97: blockchains.bscTestnet    // BSC Testnet
} as const;

// 定义支持的区块链
const SUPPORTED_BLOCKCHAINS = {
  prod: [
    blockchains.eth,
    blockchains.bsc,
    // blockchains.arbitrum,
    // blockchains.optimism
  ],
  dev: [
    blockchains.eth,
    blockchains.bsc,
    blockchains.arbitrum,
    blockchains.optimism,
    blockchains.bscTestnet
  ]
} as const;

export const useAnkrWeb3 = (chainId?: number) => {
  const provider = useMemo(() => new AnkrProvider(ANKR_ENDPOINT), []);

  // 获取当前环境支持的区块链列表
  const supportedChains = useMemo(() => {
    const isProd = import.meta.env.MODE === 'production';
    return isProd ? SUPPORTED_BLOCKCHAINS.prod : SUPPORTED_BLOCKCHAINS.dev;
  }, []);

  // 根据 chainId 获取对应的区块链名称
  const currentChain = useMemo(() => {
    if (!chainId) return blockchains.eth; // 默认使用以太坊
    return CHAIN_ID_TO_NETWORK[chainId] || blockchains.eth;
  }, [chainId]);

  // 验证区块链是否支持
  const isChainSupported = useCallback((chain: Blockchain) => {
    return supportedChains.includes(chain);
  }, [supportedChains]);

  // 其他方法保持不变，但默认使用 currentChain
  const getBlocks = useCallback(
    async (params: { blockchain?: Blockchain[]; fromBlock: number; toBlock: number }) => {
      try {
        const blocks = await provider.getBlocks({
          ...params,
          blockchain: params.blockchain || supportedChains
        } as any);
        return blocks;
      } catch (error) {
        console.error('Error fetching blocks:', error);
        throw error;
      }
    },
    [provider, supportedChains]
  );

  const getAccountBalance = useCallback(
    async (params: { blockchain?: Blockchain[]; walletAddress: string }) => {
      try {
        const balance = await provider.getAccountBalance({
          ...params,
          blockchain: params.blockchain || supportedChains
        } as any);
        return balance;
      } catch (error) {
        console.error('Error fetching account balance:', error);
        throw error;
      }
    },
    [provider, supportedChains]
  );

  const getCurrencies = useCallback(
    async (blockchain?: Blockchain[]) => {
      try {
        const currencies = await provider.getCurrencies({
          blockchain: blockchain || supportedChains
        } as any);
        return currencies;
      } catch (error) {
        console.error('Error fetching currencies:', error);
        throw error;
      }
    },
    [provider, supportedChains]
  );

  return {
    provider,
    supportedChains,
    currentChain,
    getBlocks,
    getAccountBalance,
    getCurrencies,
    isChainSupported,
  };
};
