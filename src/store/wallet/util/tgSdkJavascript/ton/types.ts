// Copyright (c) 2018-2022 Coinbase, Inc. <https://www.coinbase.com/>
// Licensed under the Apache License, version 2.0

import { Address } from '@ton/core'

interface Tag<T extends string, RealType> {
  __tag__: T
  __realType__: RealType
}

export type OpaqueType<T extends string, U> = U & Tag<T, U>

export function OpaqueType<T extends Tag<any, any>>() {
  return (value: T extends Tag<any, infer U> ? U : never): T => value as T
}

export type HexString = OpaqueType<'HexString', string>
export const HexString = OpaqueType<HexString>()

export type AddressString = OpaqueType<'AddressString', string>
export const AddressString = OpaqueType<AddressString>()

export type BigIntString = OpaqueType<'BigIntString', string>
export const BigIntString = OpaqueType<BigIntString>()

export type IntNumber = OpaqueType<'IntNumber', number>
export function IntNumber(num: number): IntNumber {
  return Math.floor(num) as IntNumber
}

export type RegExpString = OpaqueType<'RegExpString', string>
export const RegExpString = OpaqueType<RegExpString>()

export type Callback<T> = (err: Error | null, result: T | null) => void

export const PROVIDER_ALLIANCE = {
  EVM: 'evm',
  SOL: 'sol',
  TON: 'ton'
}

export type Account = {
  address: string
  chainId?: string | number
  chainKey?: string
  alliance: string
  chainName?: string
  chainSymbol?: string
  name?: string
  symbol?: string
  publicKey?: string
}

export type SwitchEthereumChainParams = {
  chainId: number
}

export type initOptions = {
  bridge: string
  chainId: number
  connect: string
  connect_direct_link: string
  eventTimeout: number
  injected: boolean
  metaData: {
    icon: string
    name: string
    url?: string
    direct_link?: string
    description?: string
  }
}

export interface TonTxParams {
  valid_until?: number | bigint
  validUntil?: number | bigint
  network?: string
  from?: string
  messages: {
    address: string
    amount: string
    stateInit?: string
    payload?: string
  }[]
}

export enum TonTxBodyType {
  JETTON_PAYLOAD_JSON_LEGACY = 'JETTON_PAYLOAD_JSON_LEGACY',
  STANDARD = 'STANDARD'
}

export interface TonTransferBodyLegacy {
  from: string
  to: string | Address
  value: string | bigint | number
  memo?: string
  contractAddress?: string
  precision?: string
  forwardAmount?: string
  type?: TonTxBodyType.JETTON_PAYLOAD_JSON_LEGACY
  chainId?: number
  publicKey?: string
}

export interface TonTxRequestStandard {
  body: {
    messages: {
      address: string
      amount: string
      payload?: string
      stateInit?: string
    }[]
  }
  validUntil?: number
  publicKey: string
  fromAddress: string
}

export interface TonTxParseRes {
  result: Partial<TonTxRequestStandard>
  isTonSend?: boolean
  tonMessage?: Record<string, string>
}

export type TonTxRequest = TonTransferBodyLegacy | Partial<TonTxRequestStandard>

type SendTransactionResponse =
  | SendTransactionResponseSuccess
  | SendTransactionResponseError

interface SendTransactionResponseSuccess {
  result: string
  id: string
}

interface SendTransactionResponseError {
  error: { code: number; message: string }
  id: string
}

export interface TonProvider {
  connected: boolean
  account: {
    address: string
    publicKey: string
  }
  sendTransaction: (param: TonTxParams) => SendTransactionResponse
  disconnect: any
  getBalance: any
}

export type IWeb3Type = 'EVM' | 'SOL' | 'BTC' | 'SUI' | 'ALL' | 'TON'

export interface OutputDef {
  config: {
    accounts: Record<string, Account>
  }
  hash: string
  salt: string
  signature: string
  id: string
  method: string
  params: any[]
  result: any
  options: {
    account: Account
    metaData: {
      hostname: string
      icon: string
      name: string
      url: string
    }
  }
}
