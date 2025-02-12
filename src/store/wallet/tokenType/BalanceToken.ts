import { BaseToken } from './BaseToken'

/**
 *
 * @warning decimals of This BalanceToken is not trusted, okx not support decimals.
 */
export class BalanceToken extends BaseToken {
  public readonly balance?: string | undefined
  public readonly formatted?: string | undefined
  public readonly value?: string | undefined
  public readonly type?: string | undefined

  constructor(
    isNative: boolean,
    isToken: boolean,
    chainId: number,
    decimals: number,
    symbol: string,
    name: string,
    address: string,
    balance: string | undefined,
    formatted: string | undefined,
    value: string | undefined,
    type?: string | undefined
  ) {
    super(isNative, isToken, chainId, decimals, symbol, name, address)
    if (balance) this.balance = balance
    if (formatted) this.formatted = formatted
    if (value) this.value = value
    if (type) this.type = type
  }
}
