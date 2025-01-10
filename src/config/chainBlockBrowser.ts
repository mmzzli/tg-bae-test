export const ChainToken: { [key: number]: { symbol: string; name: string } } = {
  // Test tokens
  2000: {
    symbol: 'BNB',
    name: 'BNB Token',
  },
  2001: {
    symbol: 'BUSD',
    name: 'BUSD Token',
  },
  // Production tokens
  0: {
    symbol: 'STAR',
    name: 'Star Token',
  },
  1: {
    symbol: 'ETH',
    name: 'Ethereum',
  },
  2: {
    symbol: 'USDT',
    name: 'Tether USD',
  },
  3: {
    symbol: 'BNB',
    name: 'BNB Chain',
  },
  4: {
    symbol: 'BUSD',
    name: 'BSC-USDT',
  },
  5: {
    symbol: 'Arbitrum',
    name: 'Arbitrum',
  },
  6: {
    symbol: 'ArbitrumUSDT',
    name: 'Arbitrum-USDT',
  },
  7: {
    symbol: 'OP',
    name: 'Optimism',
  },
  8: {
    symbol: 'OPUSDT',
    name: 'Optimism-USDT',
  },
  9: {
    symbol: 'Linea',
    name: 'Linea',
  },
  10: {
    symbol: 'LineaUSDT',
    name: 'Linea-USDT',
  },
  11: {
    symbol: 'Base',
    name: 'Base',
  },
  12: {
    symbol: 'BaseUSDT',
    name: 'Base-USDT',
  },
  13: {
    symbol: 'Scroll',
    name: 'Scroll',
  },
  14: {
    symbol: 'ScrollUSDT',
    name: 'Scroll-USDT',
  },
  15: {
    symbol: 'Duck',
    name: 'Duck',
  },
  16: {
    symbol: 'DuckUSDT',
    name: 'Duck-USDT',
  },
  17: {
    symbol: 'Dogechain',
    name: 'Dogechain',
  },
}

interface ChainBrowserConfig {
  [chainId: number]: {
    name: string
    browserURL: string
    txPath: string
    addressPath: string
  }
}

export const chainBlockBrowser: ChainBrowserConfig = {
  1: {
    name: 'Ethereum',
    browserURL: 'https://etherscan.io',
    txPath: '/tx',
    addressPath: '/address',
  },
  56: {
    name: 'BSC',
    browserURL: 'https://bscscan.com',
    txPath: '/tx',
    addressPath: '/address',
  },
  97: {
    name: 'Bsc Testnet',
    browserURL: 'https://testnet.bscscan.com',
    txPath: '/tx',
    addressPath: '/address',
  },
}

// 用法示例:
// 获取交易链接
export const getTransactionLink = (chainId: number, txHash: string): string => {
  const chain = chainBlockBrowser[chainId]
  if (!chain) return ''
  return `${chain.browserURL}${chain.txPath}/${txHash}`
}

// 获取地址链接
export const getAddressLink = (chainId: number, address: string): string => {
  const chain = chainBlockBrowser[chainId]
  if (!chain) return ''
  return `${chain.browserURL}${chain.addressPath}/${address}`
}

