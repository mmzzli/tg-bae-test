import TonWeb from 'tonweb'
import { AddressType } from 'tonweb/dist/types'
//@ts-ignore
import tonUtils from 'tonweb/src/utils/Utils'
import axios from 'axios'
import { getHttpEndpoint } from '@orbs-network/ton-access'
import { Address, JettonMaster, JettonWallet, TonClient, fromNano, SendMode, Cell } from '@ton/ton'
import { TonTxRequestStandard } from '../util/tgSdkJavascript/ton/types'
import { errorContents } from '@/config/wallet/const'
import { ApiParams } from '../type'

export type TonSigningTransactionType = {
  fromAddress: string
  publicKey: string
  amount: string
  toAddress: string
  memo: string | Uint8Array | Cell
  tokenContractAddress?: string
  tokenPrecision?: number
  targetAddress?: string
}

export type TonSendTransactionParams = {
  data: string
  from: string
  gas: string
  gasPrice?: string
  maxPriorityFeePerGas?: string
  minReceiveAmount: string
  signatureData: string[]
  to: string
  value: string
  decimals: number
}

export const mockTonChainId = 1100
export const mockTonTestnetChainId = 1101
export const mockTonOkxChainID = 607
export const tonDecimals = 9
export const tonSymbol = 'TON'
export const minTonBalance = 0.05

export const apiKey: string = '1b312c91c3b691255130350a49ac5a0742454725f910756aff94dfe44858388e'
export const tonRpc: string = 'https://toncenter.com/api/v2/jsonRPC'
const hashHttp: string = 'https://toncenter.com/api/index/v1'
export const tonScanUrl: string = 'https://tonviewer.com/transaction/'

export async function getClient() {
  return new TonClient({
    endpoint: await getHttpEndpoint({
      network: 'mainnet',
    }),
  })
}

export async function getTonWebAsync() {
  const { default: TonWeb } = await import('tonweb')
  return TonWeb
}

export async function getTonWebProvider() {
  const TonWeb = await getTonWebAsync()
  return new TonWeb(new TonWeb.HttpProvider(tonRpc, { apiKey: apiKey }))
}

export const getTonBalance = async ({
  tonAddress,
  tokenContractAddress,
  tokenPrecision = tonDecimals,
}: {
  tonAddress: string
  tokenContractAddress?: AddressType
  tokenPrecision?: number
}) => {
  const tonWeb = await getTonWebProvider()
  const wallet = tonWeb.wallet.create({ address: tonAddress }) // if your know only address at this moment

  const address = await wallet.getAddress()
  if (tokenContractAddress) {
    // @ts-ignore
    const jettonMinter = new TonWeb.token.jetton.JettonMinter(tonWeb.provider, {
      address: tokenContractAddress,
    })
    const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(address)
    const jettonWallet = new (await getTonWebAsync()).token.jetton.JettonWallet(tonWeb.provider, {
      address: jettonWalletAddress,
    })
    const balance = (await jettonWallet.getData()).balance
    return {
      balance,
      formatted: Number(balance.toString()) / 10 ** tokenPrecision,
    }
  }

  const balance = await tonWeb.getBalance(address)
  return {
    balance,
    formatted: (await getTonWebAsync()).utils.fromNano(balance),
  }
}

export const getTokenBalance = async ({
  tonAddress,
  tokenAddress,
}: {
  tokenAddress: string
  tonAddress: string
}) => {
  try {
    const client = await getClient()
    const token = Address.parse(tokenAddress)
    const walletAddress = Address.parse(tonAddress || '')
    const jettonMaster = client.open(JettonMaster.create(token))
    const jettonWalletAddress = await jettonMaster.getWalletAddress(walletAddress)

    const jettonWallet = client.open(JettonWallet.create(jettonWalletAddress))

    const balance = await jettonWallet.getBalance()

    return { value: balance }
  } catch (error) {
    console.error('Error getting token balance and decimals:', error)
    throw error
  }
}

/**
 * build transfer signing message
 * @param transactionInfo  {publicKey: "be91c0566bed6a186780b5711529b0652e505bb3f9fc92866fb0c0f400c98dd6",amount: "0.3",toAddress: "EQC4d8D4ERsT6DH0Xzz_Ey8Yja2wXVnUtaffVOtm1htS6qG1",memo: "1111"}
 * @returns
 */
export async function createSigningTransaction(transactionInfo: TonSigningTransactionType) {
  try {
    const tonWeb = await getTonWebProvider()
    const WalletClass = tonWeb.wallet.all['v4R2']
    const wallet = new WalletClass(tonWeb.provider, {
      publicKey: tonWeb.utils.hexToBytes(transactionInfo.publicKey),
      wc: 0,
    })
    const seqno = (await wallet.methods.seqno().call()) || 0
    let stateInit = null
    if (seqno == 0) {
      const deploy = await wallet.createStateInit()
      stateInit = deploy.stateInit
    }

    let signingMessage
    let stateInitBoc
    let sendmode = SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS // 3
    const balance = await getTonBalance({
      tonAddress: transactionInfo.fromAddress,
    })
    if (
      transactionInfo.tokenContractAddress &&
      transactionInfo.tokenContractAddress.trim().length > 0 &&
      transactionInfo.tokenPrecision
    ) {
      if (Number(balance.formatted) < minTonBalance) {
        throw new Error(`Ton balance least ${minTonBalance}`)
      }
      const jettonMinter = new (await getTonWebAsync()).token.jetton.JettonMinter(
        tonWeb.provider,
        // @ts-ignore
        { address: transactionInfo.tokenContractAddress }
      )
      //
      const walletAddress = await wallet.getAddress()
      const jettonWalletAddress = await jettonMinter.getJettonWalletAddress(walletAddress)
      //
      const jettonWallet = new (await getTonWebAsync()).token.jetton.JettonWallet(tonWeb.provider, {
        address: jettonWalletAddress.toString(true, true, false),
      })

      let comment
      if (typeof transactionInfo.memo === 'string') {
        comment = new Uint8Array([
          ...new Uint8Array(4),
          ...new TextEncoder().encode(transactionInfo.memo || ''),
        ])
      } else {
        comment = transactionInfo.memo
      }

      //
      const tokenAmount = Number(transactionInfo.amount) * 10 ** transactionInfo.tokenPrecision
      const convertedAmount = (await getTonWebAsync()).utils.toNano(
        (tokenAmount / 10 ** 9).toString()
      )
      //
      const transferBody = await jettonWallet.createTransferBody({
        queryId: seqno,
        // @ts-ignore
        jettonAmount: convertedAmount,
        toAddress: new (await getTonWebAsync()).utils.Address(transactionInfo.toAddress),
        forwardPayload: comment,
        forwardAmount: (await getTonWebAsync()).utils.toNano('0.0001'),
        responseAddress: walletAddress,
      })
      //
      const externalMessage = await wallet.createTransferMessage(
        new Uint8Array(), //
        jettonWalletAddress.toString(true, true, false),
        (await getTonWebAsync()).utils.toNano('0.05'), //
        seqno,
        transferBody,
        sendmode, //3, // sendmode
        true, //
        stateInit as any
      )

      const cellBase64 = await externalMessage.signingMessage.toBoc(false)

      if (stateInit) {
        const cellBase641 = await stateInit.toBoc(false)
        stateInitBoc = tonWeb.utils.bytesToHex(cellBase641)
      }
      signingMessage = tonWeb.utils.bytesToHex(cellBase64)

      return {
        signingMessageBoc: signingMessage,
        stateInitBoc,
      }
    } else {
      if (Number(balance.formatted) - Number(transactionInfo.amount) <= 0.01) {
        sendmode = SendMode.CARRY_ALL_REMAINING_BALANCE // 128
      }
      let toAddress: AddressType = new (await getTonWebAsync()).utils.Address(
        transactionInfo.toAddress
      ).toString(true, true, true)
      const info = await tonWeb.provider.getAddressInfo(transactionInfo.toAddress)
      if (info.state !== 'active') {
        toAddress = new (await getTonWebAsync()).utils.Address(transactionInfo.toAddress).toString(
          true,
          true,
          false
        ) // convert to non-bounce
      }
      const externalMessage = await wallet.createTransferMessage(
        new Uint8Array(),
        toAddress,
        (await getTonWebAsync()).utils.toNano(transactionInfo.amount),
        seqno,
        transactionInfo.memo, //
        sendmode, // 3,
        true,
        stateInit as any
      )
      const cellBase64 = await externalMessage.signingMessage.toBoc(false)
      signingMessage = tonWeb.utils.bytesToHex(cellBase64)
      // const hash = await externalMessage.signingMessage.hash()
      if (stateInit) {
        const cellBase641 = await stateInit.toBoc(false)
        stateInitBoc = tonWeb.utils.bytesToHex(cellBase641)
      }
    }
    return {
      signingMessageBoc: signingMessage,
      stateInitBoc,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export const pushTonTx = async ({
  signedTransaction,
  apiParams,
}: {
  signedTransaction: string
  apiParams?: ApiParams
}) => {
  // if (apiParams) {
  //   const hash = await sendRawTransactionByCenterApi({
  //     apiParams,
  //     callData: signedTransaction,
  //     tx: '',
  //   })
  //   if (hash) return hash
  // }

  const tranRes = await sendTransaction(signedTransaction)
  if (tranRes && tranRes['@type'] == 'ok') {
    return tranRes.msgHash as string
  } else {
    throw new Error(errorContents.transactionError)
  }
}

export async function sendTransaction(signedTransaction: string) {
  const tonWeb = await getTonWebProvider()

  const cell = tonWeb.boc.Cell.fromBoc(tonWeb.utils.base64ToBytes(signedTransaction))[0]
  const msgHash = tonWeb.utils.bytesToBase64(await cell.hash())

  const result = await tonWeb.provider.sendBoc(signedTransaction)
  return { ...result, msgHash }
}

// {@extra: "1723608477.1462789:0:0.6971379973574183", @type: "query.fees", destination_fees: [], source_fees: {@type: "fees",fwd_fee: 0,gas_fee: 0,in_fwd_fee: 1006800,storage_fee:618}}
export async function sendMessageFee(address: string, signedTransaction: string) {
  const tonWeb = await getTonWebProvider()
  return tonWeb.provider.getEstimateFee({
    address: address,
    body: signedTransaction,
  })
}

export async function getTransactionsByInMessageHash(msg_hash: string) {
  const transRes = await axios.get(
    `${hashHttp}/getTransactionsByInMessageHash?msg_hash=${encodeURIComponent(
      msg_hash
    )}&include_msg_body=false&include_block=false`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  )
  return transRes?.data || []
}

// use the v2 api
export async function getTransactions(address: string, limit: number = 10) {
  const tonweb = await getTonWebProvider()

  return await tonweb.getTransactions(address, limit)
}

export function convertBase64ToHex(base64: string) {
  return tonUtils.bytesToHex(tonUtils.base64ToBytes(base64))
}

export async function createSigningTransactionPure(
  transactionInfo: TonTxRequestStandard,
  valid_until: number | undefined
) {
  try {
    const tonWeb = await getTonWebProvider()
    const WalletClass = tonWeb.wallet.all['v4R2']
    const wallet = new WalletClass(tonWeb.provider, {
      publicKey: tonWeb.utils.hexToBytes(transactionInfo.publicKey as string),
      wc: 0,
    })
    const seqno = (await wallet.methods.seqno().call()) || 0
    let stateInit = null
    if (seqno == 0) {
      const deploy = await wallet.createStateInit()
      stateInit = deploy.stateInit
    }

    // let signingMessage
    let stateInitBoc
    const balance = await getTonBalance({
      tonAddress: transactionInfo.fromAddress,
    })

    const msgsRaw = transactionInfo.body.messages
    const msgsDataPromiseList = msgsRaw.map(async (item) => {
      let sendMode = SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS
      const transferTonAmount = item.amount
      if (Number(balance.formatted) - Number(fromNano(transferTonAmount)) <= 0.01) {
        sendMode = SendMode.CARRY_ALL_REMAINING_BALANCE //128
      }

      let toAddress: AddressType = new TonWeb.utils.Address(item.address).toString(true, true, true)
      const info = await tonWeb.provider.getAddressInfo(toAddress)

      if (info.state !== 'active') {
        toAddress = new TonWeb.utils.Address(toAddress).toString(true, true, false) // convert to non-bounce
      }

      return {
        toAddress,
        sendMode,
        amount: transferTonAmount,
        payload: item.payload
          ? tonWeb.boc.Cell.oneFromBoc(new Uint8Array(Buffer.from(item.payload, 'base64')))
          : '',
        stateInit: item.stateInit
          ? tonWeb.boc.Cell.oneFromBoc(new Uint8Array(Buffer.from(item.stateInit, 'base64')))
          : '',
      }
    })

    const msgsData = await Promise.all(msgsDataPromiseList)

    const defaultUntil = Math.floor(Date.now() / 1000) + 5 * 60
    const validUntil =
      valid_until && +valid_until ? Math.min(+valid_until, defaultUntil) : defaultUntil

    console.log('valid_until', {
      valid_until,
      defaultUntil,
      validUntil,
    })

    // @ts-ignore
    const externalMessage = await wallet.createTransferMessages(
      new Uint8Array(),
      seqno,
      msgsData,
      true,
      validUntil
    )
    const cellBase64 = await externalMessage.signingMessage.toBoc(false)
    const signingMessage = tonWeb.utils.bytesToHex(cellBase64)
    if (stateInit) {
      const cellBase641 = await stateInit.toBoc(false)
      stateInitBoc = tonWeb.utils.bytesToHex(cellBase641)
    }
    return {
      signingMessageBoc: signingMessage,
      stateInitBoc,
    }
  } catch (e) {
    console.error(e)
    return {
      signingMessageBoc: '',
      stateInitBoc: '',
    }
  }
}
