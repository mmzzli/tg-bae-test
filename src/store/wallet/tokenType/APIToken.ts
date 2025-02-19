import { CustomListInfo, WhiteListInfo } from '../type'
import { BaseToken } from './BaseToken'

export class APIToken extends BaseToken {
  public balance: string
  public price: number
  public image: string
  /**
   * if token can trust, you must only use 'all'/'custom'
   */
  public source: 'all' | 'custom' | 'market' | 'receive' | 'history'

  public whiteToken?: WhiteListInfo
  public customToken?: CustomListInfo

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
    whiteToken?: WhiteListInfo,
    customToken?: CustomListInfo
  ) {
    super(isNative, isToken, chainId, decimals, symbol, name, address)
    this.balance = balance
    this.price = price
    this.image = image
    this.source = source
    if (whiteToken) this.whiteToken = whiteToken
    if (customToken) this.customToken = customToken
  }
}
