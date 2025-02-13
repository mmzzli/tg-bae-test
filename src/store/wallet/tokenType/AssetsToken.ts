import { CustomListInfo, WhiteListInfo } from "../type"
import { APIToken } from "./APIToken"

export class AssetsToken extends APIToken {
  /**
   * `${address}-${chainId}-${symbol}`, used by key of ui render
   */
  public readonly id: string

  public readonly formatted: string
  constructor(
    isNative: boolean,
    isToken: boolean,
    chainId: number,
    decimals: number,
    symbol: string,
    name: string,
    address: string,
    balance: string,
    price: number,
    image: string,
    source: 'all' | 'custom' | 'market' | 'receive' | 'history',
    id: string,
    formatted: string,
    whiteToken?: WhiteListInfo,
    customToken?: CustomListInfo
  ) {
    super(
      isNative,
      isToken,
      chainId,
      decimals,
      symbol,
      name,
      address,
      balance,
      price,
      image,
      source,
      whiteToken,
      customToken
    )
    this.id = id
    this.formatted = formatted
  }
}
