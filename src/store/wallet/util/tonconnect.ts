import { atom, PrimitiveAtom } from 'jotai'
import { TonTxParams } from './tgSdkJavascript/ton/types'

export const tonConnectAtom = atom(null)

type TonSendTransType = null | TonTxParams

export const tonSendTransactionDataAtom = atom<TonSendTransType>(null)
