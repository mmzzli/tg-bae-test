export abstract class BaseToken {
  //Base interface
  public readonly isNative: boolean
  public readonly isToken: boolean
  public readonly address: string
  public readonly chainId: number
  public readonly decimals: number
  public readonly symbol: string
  public readonly name: string

  protected constructor(
    isNative: boolean,
    isToken: boolean,
    chainId: number,
    decimals: number,
    symbol: string,
    name: string,
    address: string
  ) {
    this.isNative = isNative
    this.isToken = isToken
    this.chainId = chainId
    this.decimals = decimals
    this.symbol = symbol
    this.name = name
    this.address = address
  }
}
