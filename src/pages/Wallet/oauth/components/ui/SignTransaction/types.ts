export interface TokenInfo {
  isNative: boolean
  symbol: string
  decimals: number
  value: bigint
  formatted: string
}

export interface TokenData {
  function: string
  to: string
  value: number
}
