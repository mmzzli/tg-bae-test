interface ChainBrowserConfig {
  [chainId: number]: {
    name: string;
    browserURL: string;
    txPath: string;
    addressPath: string;
  };
}

export const chainBlockBrowser: ChainBrowserConfig = {
  1: {
    name: 'Ethereum',
    browserURL: 'https://etherscan.io',
    txPath: '/tx',
    addressPath: '/address'
  },
  56: {
    name: 'BSC',
    browserURL: 'https://bscscan.com',
    txPath: '/tx',
    addressPath: '/address'
  }
};

// 用法示例:
// 获取交易链接
export const getTransactionLink = (chainId: number, txHash: string): string => {
  const chain = chainBlockBrowser[chainId];
  if (!chain) return '';
  return `${chain.browserURL}${chain.txPath}/${txHash}`;
};

// 获取地址链接
export const getAddressLink = (chainId: number, address: string): string => {
  const chain = chainBlockBrowser[chainId];
  if (!chain) return '';
  return `${chain.browserURL}${chain.addressPath}/${address}`;
};
