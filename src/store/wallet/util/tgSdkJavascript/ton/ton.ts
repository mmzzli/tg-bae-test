import TonWeb from 'tonweb'
import { TonClient } from '@ton/ton'
import { Address, Cell, Slice, fromNano } from '@ton/core'
import { tonRpc, apiKey } from 'config/ton'
import { base64ToHex, isValidHex } from '@/utils/tonConnect/util'
import { TonTxParams, TonTxParseRes, TonTxRequestStandard } from './types'
import { beginCell, toNano } from '@ton/ton'

const parsePayloadAsStandard = async (
  tonTx: TonTxParams
): Promise<Partial<TonTxParseRes>> => {
  const {
    messages: [{ payload, address: toAddress }]
  } = tonTx

  const result: Partial<TonTxRequestStandard> = {
    body: tonTx
  }

  if (!payload) return { result }

  const payloadHex = payload

  // if (!isValidHex(payloadHex)) {
  //   // auto convert base64 to hex
  //   payloadHex = base64ToHex(payloadHex)
  //   if (result.body && result.body.messages && result.body.messages[0]) {
  //     result.body.messages[0].payload = payloadHex
  //   }
  // }

  const jettonMinterAddress = await checkIsJettonWallet(toAddress)

  // check is jetton and try parse as jetton
  if (!jettonMinterAddress) {
    return {
      result,
      isTonSend: true,
      tonMessage: {
        address: tonTx?.messages?.[0]?.address || '',
        amount: tonTx.messages?.[0]?.amount || '0',
      }
    }
  }

  try {
    const { amount, destination } = parsingTonTxPayload(payloadHex)

    // @ts-ignore
    result.jettonInfo = {
      recipientAddress: destination.toString(),
      amount: amount.toString(),
      jettonMinterAddress
    }
  } catch (e) {
    console.log('parse payload failed, pass', e)
  }

  return { result }
}

const checkIsJettonWallet = async (jettonMinterAddress: string) => {
  const tonweb = new TonWeb(
    new TonWeb.HttpProvider(tonRpc, {
      apiKey
    })
  )
  const jettonWallet = new TonWeb.token.jetton.JettonWallet(tonweb.provider, {
    address: jettonMinterAddress
  } as any)
  try {
    const data = await jettonWallet.getData()
    const jettonMinterAddress = data.jettonMinterAddress.toString(
      true,
      true,
      true
    )
    console.log('Jetton Minter Address:', jettonMinterAddress)
    console.log('This address is a valid Jetton Wallet address.')
    return jettonMinterAddress
  } catch (error) {
    // 此处无法判断是否是 rpc 的连接错误
    // 无论是 rpc 连接错误还是 jetton 地址解析错误，都是同样的报错内容：
    // Error: http provider parse response error
    console.log(`${jettonMinterAddress} doesn't seems to be a jetton`, error)
    return false
  }
}

const parsingTonTxPayload = (payloadHex: string) => {
  const cell = Cell.fromBase64(payloadHex)
  const slice = cell.beginParse()
  const operationCode = slice.loadUint(32)
  const queryId = slice.loadUintBig(64)
  const amount = slice.loadCoins()
  const destination = slice.loadAddress()
  return {
    operationCode,
    queryId,
    amount,
    destination
  }
}

const checkValue = (param: Partial<TonTxRequestStandard>) => {
  try {
    fromNano(param.body?.messages[0].amount)
  } catch (e) {
    throw new Error('amount must in the format of nanoTon')
  }
}

export const createPayloadByTonCoreCell = async (
  tokenAmount: number,
  recipientAddress: string
) => {
  const destinationAddress = Address.parse(recipientAddress)

  const body = beginCell()
    .storeUint(0xf8a7ea5, 32) // jetton 转账操作码
    .storeUint(0, 64) // query_id:uint64
    .storeCoins(tokenAmount) // amount:(VarUInteger 16) -  转账的 Jetton 金额（小数位 = 6 - jUSDT, 9 - 默认）
    .storeAddress(destinationAddress) // destination:MsgAddress
    .storeAddress(destinationAddress) // response_destination:MsgAddress
    .storeBit(false) // null custom_payload
    .storeCoins(toNano('0.000001'))
    .storeBit(false) // false for empty forward payload
    .endCell()

  return body.toBoc().toString('base64')
}

export async function getUserTokenWalletAddress(
  userAddress: string,
  jettonMasterAddress: string
) {
  const client = new TonClient({
    endpoint: 'https://toncenter.com/api/v2/jsonRPC'
  })
  const userAddressCell = beginCell()
    .storeAddress(Address.parse(userAddress))
    .endCell()
  const response = await client.runMethod(
    Address.parse(jettonMasterAddress),
    'get_wallet_address',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    [{ type: 'slice', cell: userAddressCell }]
  )
  return response.stack.readAddress()
}

export { parsePayloadAsStandard, checkValue }
