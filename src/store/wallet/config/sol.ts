// import {
//   Connection,
//   PublicKey,
//   Transaction,
//   SystemProgram,
//   TransactionMessage,
//   TransactionInstruction,
//   VersionedTransaction,
//   ComputeBudgetProgram,
//   ComputeBudgetInstruction,
//   Message,
// } from '@solana/web3.js'
// import {
//   createTransferInstruction,
//   getAssociatedTokenAddress,
//   createAssociatedTokenAccountInstruction,
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID,
//   createTransferCheckedInstruction,
// } from '@solana/spl-token'
// // import { errorContents } from './const'
// import { solSignRawTransaction } from '@/api'
// import { sleep } from '@/utils'
// import { JitoJsonRpcClient } from 'jito-js-rpc'
// // import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
// import bs58 from 'bs58'
// import { getSolFeeByFeeMode, getSolFeeEstimate } from '@/api/solHelius'
// import { formatUnits } from 'viem'
// import chains from '@/proviers/web3Provider/chains'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { FeeMode } from '@/components/FeeSelect'
// import {
//   ChainGasFeesType,
//   sendRawTransactionByCenterApi,
//   SendTransactionByCenterParamsType,
// } from '@/hooks/api/chain'
// import { UserType } from '@/stores/userStore/type'
// import { DexTransaction } from '@/constants/types'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import { ApiParams, CenterSubmitResult } from '@/api/type'
// import { errorContents } from '@/config/wallet/const'

// let connection: Connection
// let testConnection: Connection
export const SolMainAddress = '11111111111111111111111111111111'
export const mockSolEvmChainId = 501
export const solDecimals = 9
export const solTokenName = 'SOL'
export const BIO_SOLANA_NATIVE_TOKEN_ADDRESS = 'So11111111111111111111111111111111111111112'

export const solScanUrl = 'https://solscan.io/tx/'
export const solTokenScanUrl = 'https://solscan.io/token/'
export const jitoRpc = 'https://mainnet.block-engine.jito.wtf/api/v1'

// sol rpcs
export const solEndpoints = [
  {
    url: 'https://mainnet.helius-rpc.com/?api-key=ac6f0298-d53b-4a04-8389-7966584a67d1',
  },
  {
    url: 'https://empty-smart-wildflower.solana-mainnet.quiknode.pro/ebfb8013883fffdaf5a64952fd6c8b2b2bf3cea8',
  },
  {
    url: 'https://solana-api.projectserum.com',
  },
]

export const solEndpoint = solEndpoints[0].url
// 'https://go.getblock.io/4922ed815e5d4137ab3a7f87b34cbfe4'
// 'https://sleek-falling-forest.solana-mainnet.quiknode.pro/bf7872f533b3acef73a69e98a5d0726ebcec2045'
// 'https://empty-smart-wildflower.solana-mainnet.quiknode.pro/ebfb8013883fffdaf5a64952fd6c8b2b2bf3cea8'  // last
// 'https://radial-orbital-asphalt.solana-mainnet.quiknode.pro/26104f8a2af48528708e39e4210f75af0e6c7577'
//  clusterApiUrl('mainnet-beta')
// ('https://mainnet.helius-rpc.com/?api-key=ac6f0298-d53b-4a04-8389-7966584a67d1')
// 'https://rpc.ankr.com/solana/ac79e83cf02a544dbb9b3f4c5d5478b2510b921e7d5739ded8791a932e8de0a6'

// export const getFastConnection = async () => {
//   const connections = solEndpoints.map((endpoint) => new Connection(endpoint.url))

//   const fastConnection = await Promise.any(
//     connections.map((connection) => connection.getEpochInfo().then(() => connection))
//   )
//   console.log('fastSolConnection', fastConnection)

//   connection = fastConnection

//   return fastConnection
// }

// export function getConnection() {
//   if (connection) {
//     return connection
//   }
//   // connection = new Connection(solEndpoint, 'recent')
//   connection = new Connection(solEndpoint)
//   // connection = new Connection(clusterApiUrl('mainnet-beta'))
//   return connection
// }

// export const getJitoClient = () => {
//   const jitoClient = new JitoJsonRpcClient(jitoRpc, '')
//   return jitoClient
// }

// export async function getSolFees() {
//   try {
//     const conn = getConnection()
//     const { feeCalculator } = await conn.getRecentBlockhash()
//     return { totalFee: feeCalculator.lamportsPerSignature.toString() as string }
//   } catch (e) {
//     return { totalFee: '0' }
//   }
// }

// // export async function sendSolTx(
// //   fromAddress: string,
// //   toAddress: string,
// //   amount: bigint, // bigint number
// //   feeMode = FeeMode.AVERAGE
// // ) {
// //   try {
// //     getConnection()
// //     const tx = new Transaction()
// //     const fromPublicKey = new PublicKey(fromAddress)
// //     const toPublicKey = new PublicKey(toAddress)
// //     if (!tx.feePayer) {
// //       tx.feePayer = fromPublicKey
// //     }

// //     tx.recentBlockhash = (
// //       await connection.getLatestBlockhash('finalized')
// //     ).blockhash
// //     tx.add(
// //       SystemProgram.transfer({
// //         fromPubkey: fromPublicKey,
// //         toPubkey: toPublicKey,
// //         lamports: amount
// //       })
// //     )

// //     const transaction = await addPriorityFeeToTransaction({
// //       transaction: tx,
// //       feeMode
// //     })
// //     if (!transaction) {
// //       throw new Error(errorContents.transactionError)
// //     }

// //     const result = {
// //       transaction: transaction.transaction
// //         .serialize({ requireAllSignatures: false, verifySignatures: false })
// //         .toString('hex'),
// //       fee: transaction.fee,
// //       fees: transaction.fees
// //     }

// //     return result
// //   } catch (e) {
// //     return null
// //   }
// // }

// export async function sendSolTx(
//   fromAddress: string,
//   toAddress: string,
//   amount: bigint, // bigint number
//   feeMode = FeeMode.AVERAGE,
//   solGasParams:
//     | {
//         fees: {
//           Instant: ChainGasFeesType
//           Average: ChainGasFeesType
//           Fast: ChainGasFeesType
//         }
//         fee: ChainGasFeesType
//       }
//     | undefined = undefined
// ) {
//   try {
//     getConnection()
//     // const tx = new Transaction()
//     const fromPublicKey = new PublicKey(fromAddress)
//     const toPublicKey = new PublicKey(toAddress)
//     // if (!tx.feePayer) {
//     //   tx.feePayer = fromPublicKey
//     // }

//     const recentBlockhash = (await connection.getLatestBlockhash('finalized')).blockhash

//     const instruction = SystemProgram.transfer({
//       fromPubkey: fromPublicKey,
//       toPubkey: toPublicKey,
//       lamports: amount,
//     })

//     const messageV0 = new TransactionMessage({
//       payerKey: fromPublicKey,
//       recentBlockhash,
//       instructions: [instruction],
//     })

//     const transaction = await addPriorityFeeToTransaction({
//       transaction: messageV0,
//       feeMode,
//       solGasParams,
//     })

//     if (!transaction) {
//       throw new Error(errorContents.transactionError)
//     }
//     // .compileToV0Message()

//     // const txHex = tx
//     //   .serialize({ requireAllSignatures: false, verifySignatures: false })
//     //   .toString('hex')
//     return {
//       transaction: Buffer.from(transaction.transaction.serialize()).toString('hex'),
//       fee: transaction.fee,
//       fees: transaction.fees,
//     }
//   } catch (e) {
//     return null
//   }
// }

// export const getSolTokenDetail = async (mintAddress: string) => {
//   try {
//     getConnection()
//     const TOKEN_LIST_URL =
//       'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json'
//     const response = await fetch(TOKEN_LIST_URL)
//     const tokenList = await response.json()
//     const tokenDetail = tokenList.tokens.find((token: any) => token.address === mintAddress)
//     if (tokenDetail) {
//       console.log('Token Symbol:', tokenDetail.symbol)
//       console.log('Token Name:', tokenDetail.name)
//       console.log('Token Decimals:', tokenDetail.decimals)
//       return {
//         symbol: tokenDetail.symbol,
//         decimals: tokenDetail.decimals,
//       }
//     } else {
//       console.log('Token not found in Token List')
//       return null
//     }
//   } catch (e) {
//     console.log(e)
//     return null
//   }
// }

// async function getTokenAmount(client: any, mint: any, owner: any) {
//   const tokenAccount = await getAssociatedTokenAddress(mint, owner)

//   const info = await client.getAccountInfo(tokenAccount)
//   if (info == null) {
//     return null
//   } else {
//     return await client.getTokenAccountBalance(tokenAccount)
//   }
// }
// export async function getSolTokenAccount(client: any, mint: any, owner: any) {
//   const tokenAccount = await getAssociatedTokenAddress(mint, owner)

//   return await client.getAccountInfo(tokenAccount)
// }
// export const getSolBalance = async ({
//   address,
//   token,
// }: {
//   address: string | undefined
//   token: string | undefined
// }) => {
//   if (address) {
//     if (token) {
//       const connection = getConnection()
//       const owner = new PublicKey(address)
//       const mint = new PublicKey(token)
//       const { Metaplex } = await import('@metaplex-foundation/js')

//       const metaplex = Metaplex.make(connection)
//       const metadataPda = metaplex.nfts().pdas().metadata({ mint: mint })

//       const tokenAccount = await getTokenAmount(connection, mint, owner)

//       if (tokenAccount == null) {
//         return {
//           amount: 0n,
//           token,
//           format: '0',
//           decimals: undefined,
//         }
//       } else {
//         return {
//           amount: BigInt(tokenAccount.value.amount) || 0n,
//           format: tokenAccount.value.uiAmountString,
//           decimals: tokenAccount.value.decimals,
//           token,
//         }
//       }
//     } else {
//       const connection = getConnection()
//       const publicKey = new PublicKey(address)
//       const balance = await connection.getBalance(publicKey)
//       if (balance) {
//         return BigInt(balance)
//       }
//     }
//   }
//   return undefined
// }

// function getInstructions(data: any) {
//   const instruction = new TransactionInstruction({
//     programId: new PublicKey(data.programId),
//     data: Buffer.from(data.data),
//     keys: [],
//   })
//   for (let j = 0; j < data.keys.length; j++) {
//     instruction.keys.push({
//       pubkey: new PublicKey(data.keys[j].pubkey),
//       isSigner: data.keys[j].isSigner,
//       isWritable: data.keys[j].isWritable,
//     })
//   }
//   return instruction
// }

// export const ToSerializeTransaction = async (data: any) => {
//   // const recentBlockhash = await connection.getLatestBlockhash()

//   const txMsg = new TransactionMessage({
//     recentBlockhash: data.tx.recentBlockhash,
//     payerKey: new PublicKey(data.tx.from),
//     instructions: [],
//   })

//   for (let i = 0; i < data.tx.instructions.length; i++) {
//     txMsg.instructions.push(getInstructions(data.tx.instructions[i]))
//   }

//   if (data.tx && data.tx.txType == 'LEGACY') {
//     const tx = Transaction.populate(txMsg.compileToLegacyMessage())

//     data.tx.signatures.forEach((signature: any) => {
//       tx.addSignature(new PublicKey(signature.publicKey), Buffer.from(signature.signature))
//     })
//     // tx.message.recentBlockhash = recentBlockhash
//     return Buffer.from(tx.serialize({ requireAllSignatures: false })).toString('hex')
//   } else if (data.tx && data.tx.txType == 'VERSIONED') {
//     const tx = VersionedTransaction.deserialize(data.tx.serializedMessage)
//     // const tx = new VersionedTransaction(data.tx.serializedMessage)
//     // data.tx.signatures.forEach(signature => {
//     //     tx.addSignature(new PublicKey(signature.publicKey), Buffer.from(signature.signature))
//     // });
//     // tx.feePayer = new PublicKey(data.tx.from)
//     console.log(Buffer.from(tx.serialize()).toString('hex'), '---------')

//     return Buffer.from(tx.serialize()).toString('hex')
//   }
// }

// export async function getSendSplToken(
//   mint: string | undefined,
//   from: string | undefined,
//   to: string | undefined,
//   amount: bigint | undefined,
//   feeMode = FeeMode.AVERAGE
// ) {
//   const connection = getConnection()

//   const mintPublicKey = mint && new PublicKey(mint)
//   const fromPublicKey = from && new PublicKey(from)
//   const toPublicKey = to && new PublicKey(to)

//   if (mintPublicKey && fromPublicKey && toPublicKey && amount) {
//     const fromATA = await getAssociatedTokenAddress(mintPublicKey, fromPublicKey)

//     const fromInfo = await connection.getAccountInfo(fromATA)

//     if (fromInfo == null) {
//       console.warn('from not token accmount')
//       return null
//     }
//     const fromTokenAccount = await connection.getTokenAccountBalance(fromATA)
//     if (fromTokenAccount.value.amount < amount) {
//       return null
//     }

//     const transaction = new TransactionMessage({
//       payerKey: fromPublicKey,
//       recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
//       instructions: [],
//     })

//     const toATA = await getAssociatedTokenAddress(mintPublicKey, toPublicKey)
//     const toInfo = await connection.getAccountInfo(toATA)

//     if (toInfo == null) {
//       transaction.instructions.push(
//         createAssociatedTokenAccountInstruction(
//           fromPublicKey,
//           toATA,
//           toPublicKey,
//           mintPublicKey,
//           TOKEN_PROGRAM_ID,
//           ASSOCIATED_TOKEN_PROGRAM_ID
//         )
//       )
//     }

//     transaction.instructions.push(
//       createTransferCheckedInstruction(
//         fromATA,
//         mintPublicKey,
//         toATA,
//         fromPublicKey,
//         amount,
//         fromTokenAccount.value.decimals,
//         [],
//         TOKEN_PROGRAM_ID
//       )
//     )

//     const result = await addPriorityFeeToTransaction({
//       transaction: transaction,
//       feeMode,
//     })

//     // getSolGas(Buffer.from(versionedTransaction.serialize()).toString('hex'))
//     // return
//     // return base58.encode(versionedTransaction.serialize())
//     return {
//       transaction: Buffer.from(result.transaction.serialize()).toString('hex'),
//       fee: result.fee,
//       fees: result.fees,
//     }
//   }

//   return undefined
// }

// export const sendRawTransaction = async ({
//   signRes,
// }: {
//   signRes: {
//     result: string
//   }
// }) => {
//   const hash = await getConnection().sendRawTransaction(Buffer.from(signRes.result, 'hex'))

//   return hash
// }

// async function isBlockhashExpired(connection: Connection, lastValidBlockHeight: number) {
//   const currentBlockHeight = await connection.getBlockHeight('finalized')
//   console.log('                           ')
//   console.log('Current Block height:             ', currentBlockHeight)
//   console.log('Last Valid Block height - 150:     ', lastValidBlockHeight - 150)
//   console.log('--------------------------------------------')
//   console.log(
//     'Difference:                      ',
//     currentBlockHeight - (lastValidBlockHeight - 150)
//   ) // If Difference is positive, blockhash has expired.
//   console.log('                           ')

//   return currentBlockHeight > lastValidBlockHeight - 150
// }

// export const waitTxIdSuccess = async ({
//   txId,
//   START_TIME,
//   lastValidHeight,
// }: {
//   txId: string
//   START_TIME: Date
//   lastValidHeight: number
// }) => {
//   const connect = getConnection()
//   let hashExpired = false
//   let txSuccess = false
//   while (!hashExpired && !txSuccess) {
//     const { value: statuses } = await connect.getSignatureStatuses([txId])

//     if (!statuses || statuses.length === 0) {
//       throw new Error('Failed to get signature status')
//     }

//     const status = statuses[0]

//     if (status?.err) {
//       throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`)
//     }

//     // Break loop if transaction has succeeded
//     if (
//       status &&
//       (status.confirmationStatus === 'confirmed' || status.confirmationStatus === 'finalized')
//     ) {
//       txSuccess = true
//       const endTime = new Date()
//       const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000
//       console.log(`Transaction Success. Elapsed time: ${elapsed} seconds.`)
//       console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`)
//       return txId
//     }

//     hashExpired = await isBlockhashExpired(connect, lastValidHeight)

//     // Break loop if blockhash has expired
//     if (hashExpired) {
//       const endTime = new Date()
//       const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000
//       console.log(`Blockhash has expired. Elapsed time: ${elapsed} seconds.`)
//       // (add your own logic to Fetch a new blockhash and resend the transaction or throw an error)
//       throw new Error(errorContents.transactionError)
//     }

//     // Check again after 2.5 sec
//     await sleep(2500)
//   }
// }

// export const sendRawTransactionByStatus = async ({
//   transaction,
//   fromAddress,
//   type = 'Default',
//   apiParams,
// }: {
//   transaction: string | undefined
//   fromAddress: string
//   type?: 'Jito' | 'Default'
//   apiParams?: ApiParams
// }) => {
//   const connect = getConnection()
//   const jitoClient = getJitoClient()

//   const START_TIME = new Date()
//   const getTransaction = async () => {
//     if (!transaction) {
//       throw new Error(errorContents.transactionError)
//     }

//     const tx = await (async () => {
//       if (type === 'Jito') {
//         const tx = await jitoTransaction({
//           transaction: transaction,
//           fromAddress: fromAddress,
//         })
//         return tx
//       } else {
//         return await heliusTransaction({
//           transaction,
//           fromAddress,
//         })
//       }
//     })()

//     const signRes = await solSignRawTransaction({
//       rawTransaction: tx ?? '',
//     })

//     const transactionBuffer = Buffer.from(signRes.result, 'hex')

//     return {
//       // lastValidHeight,
//       transactionBuffer,
//       signData: signRes.result,
//     }
//   }

//   const sendTxBySignature = async ({ transactionBuffer }: { transactionBuffer: Buffer }) => {
//     const txId = await (async () => {
//       if (type === 'Jito') {
//         const base58Transaction = (() => {
//           try {
//             const transaction = Transaction.from(transactionBuffer)

//             console.log({
//               key: 'jito-test',
//               transaction,
//             })

//             const serializedTransaction = transaction.serialize()
//             const base58Transaction = bs58.encode(serializedTransaction)
//             return base58Transaction
//           } catch (error) {
//             const versionedTx = VersionedTransaction.deserialize(transactionBuffer)
//             const serializedTransaction = versionedTx.serialize()
//             const base58Transaction = bs58.encode(serializedTransaction)
//             console.log('jito-VersionedTransaction')
//             return base58Transaction
//           }
//         })()

//         if (!base58Transaction) throw new Error('Failed to get signature status2')

//         const result = await jitoClient.sendTxn([base58Transaction], false)
//         console.log('Transaction send result:', result)
//         const txId = result.result
//         console.log('Transaction signature:', txId)
//         return txId
//       } else {
//         return await connect.sendRawTransaction(transactionBuffer)
//       }
//     })()

//     if (txId) {
//       return txId
//     }
//     const blockhashResponse = await connect.getLatestBlockhashAndContext('finalized')
//     const lastValidHeight = blockhashResponse.value.lastValidBlockHeight

//     return await waitTxIdSuccess({
//       txId,
//       START_TIME,
//       lastValidHeight,
//     })
//   }

//   const sendTxByCenterApi = async ({ signData }: { signData: string }) => {
//     if (apiParams) {
//       const hash = await sendRawTransactionByCenterApi({
//         apiParams,
//         callData: signData,
//         tx: '',
//       })
//       if (hash) return hash
//     }
//   }

//   const { transactionBuffer, signData } = await getTransaction()

//   const res = await sendTxByCenterApi({ signData })

//   if (res) {
//     return res
//   }

//   return await sendTxBySignature({ transactionBuffer })
// }

// export const jitoTransaction = async ({
//   transaction,
//   fromAddress,
// }: {
//   transaction: string
//   fromAddress: string
// }) => {
//   const jitoClient = getJitoClient()
//   const fromPubkey = new PublicKey(fromAddress)

//   const randomTipAccount = await jitoClient.getRandomTipAccount()
//   const jitoTipAccount = new PublicKey(randomTipAccount)

//   const tx = await (async () => {
//     try {
//       //Transaction
//       const tx = Transaction.from(Buffer.from(transaction, 'hex'))
//       const { blockhash } = await connection.getRecentBlockhash()
//       const feeCalculator = await connection.getFeeCalculatorForBlockhash(blockhash)

//       console.log({
//         key: 'jito-tx-create-gift-fee',
//         feeSize: Buffer.from(transaction, 'hex'),
//       })

//       const transactionSize = Buffer.from(transaction, 'hex').length

//       if (!feeCalculator.value) {
//         throw new Error(errorContents.gasError)
//       }

//       const fee = feeCalculator.value.lamportsPerSignature * transactionSize

//       // TODO fix fee to setComputeUnitLimit * 0.3
//       // const microLamports = fee > 2334 ? Number((fee * 0.7).toFixed(0)) : fee
//       const jitoFee = fee > 2334 ? Number((fee * 0.3).toFixed(0)) : 1000

//       // gas 按交易的字节 来给的基础fee up
//       console.log({ jitoFee })
//       // const feeProgram = ComputeBudgetProgram.setComputeUnitPrice({
//       //   microLamports: microLamports
//       // })

//       const jitoFeeProgram = SystemProgram.transfer({
//         fromPubkey: fromPubkey,
//         toPubkey: jitoTipAccount,
//         lamports: jitoFee < 1000 ? 1000 : jitoFee,
//       })

//       // tx.add(feeProgram)
//       tx.add(jitoFeeProgram)

//       console.log({
//         key: 'jito-tx-create-giftbyTransaction',
//         tx,
//       })

//       return tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('hex')
//     } catch (error) {
//       // VersionedTransaction
//       const versionedTx = VersionedTransaction.deserialize(Buffer.from(transaction, 'hex'))

//       console.error(error)

//       console.log({
//         key: 'jito-tx-create-giftbyVersionedTransaction',
//         versionedTx,
//       })
//       return Buffer.from(versionedTx.serialize()).toString('hex')
//     }
//   })()

//   return tx
// }

// export const heliusTransaction = async ({
//   transaction,
//   fromAddress,
//   feeMode = FeeMode.AVERAGE,
// }: {
//   transaction: string
//   fromAddress: string
//   feeMode?: FeeMode
// }) => {
//   const tx = await (async () => {
//     try {
//       // //Transaction
//       const tx = Transaction.from(Buffer.from(transaction, 'hex'))

//       const transactionRes = await addPriorityFeeToTransaction({
//         transaction: tx,
//         feeMode,
//       })
//       return transactionRes.transaction
//         .serialize({ requireAllSignatures: false, verifySignatures: false })
//         .toString('hex')
//     } catch (error) {
//       console.warn(`ignore: ${error}`)
//       // VersionedTransaction
//       const versionedTx = VersionedTransaction.deserialize(Buffer.from(transaction, 'hex'))
//       return Buffer.from(versionedTx.serialize()).toString('hex')
//     }
//   })()

//   return tx
// }

// export const addPriorityFeeToTransaction = async ({
//   transaction,
//   solGasParams,
//   feeMode = FeeMode.AVERAGE,
// }: {
//   transaction: Transaction | TransactionMessage
//   feeMode?: FeeMode
//   solGasParams?:
//     | {
//         fees: {
//           Instant: ChainGasFeesType
//           Average: ChainGasFeesType
//           Fast: ChainGasFeesType
//         }
//         fee: ChainGasFeesType
//       }
//     | undefined
// }) => {
//   try {
//     // Transaction
//     const result = (transaction as Transaction).serialize({
//       requireAllSignatures: false,
//       verifySignatures: false,
//     })

//     const tx = transaction as Transaction

//     const { computeUnitLimit, computeUnitPrice, modeFees } = await (async () => {
//       if (solGasParams) {
//         const priorityFees: {
//           [key in FeeMode]: string
//         } = {
//           [FeeMode.FAST]: solGasParams.fee.data.priorityFeeHigh.toString(),
//           [FeeMode.SLOW]: solGasParams.fee.data.priorityFeeLow.toString(),
//           [FeeMode.AVERAGE]: solGasParams.fee.data.priorityFeeMedium.toString(),
//         }

//         const computeUnitLimit = solGasParams.fee.data.gasLimit
//         const computeUnitPrice = priorityFees[feeMode]
//         return {
//           computeUnitLimit: Number(computeUnitLimit),
//           computeUnitPrice: Number(computeUnitPrice),
//           modeFees: priorityFees,
//         }
//       } else {
//         const computeUnitLimit = 200_000

//         const feeEstimate = await getSolFeeEstimate(result)

//         const { fee, modeFees } = getSolFeeByFeeMode({
//           fees: feeEstimate,
//           feeMode: feeMode,
//         })

//         if (!fee) {
//           throw new Error(errorContents.gasError)
//         }

//         return { computeUnitLimit, computeUnitPrice: fee, modeFees }
//       }
//     })()

//     const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
//       units: computeUnitLimit,
//     })

//     const feeProgram = ComputeBudgetProgram.setComputeUnitPrice({
//       microLamports: computeUnitPrice,
//     })

//     tx.add(computeUnitIx)
//     tx.add(feeProgram)

//     return {
//       transaction: tx,
//       fee: formatUnits(BigInt(computeUnitPrice), chains.solana.chain?.nativeCurrency.decimals || 9),
//       fees: modeFees,
//     }
//   } catch (error) {
//     // TransactionMessage
//     const tx = transaction as TransactionMessage

//     // const feeEstimate = await getSolFeeEstimate(
//     //   new VersionedTransaction(tx.compileToV0Message()).serialize()
//     // )

//     const { computeUnitLimit, computeUnitPrice, modeFees } = await (async () => {
//       if (solGasParams) {
//         const priorityFees: {
//           [key in FeeMode]: string
//         } = {
//           [FeeMode.FAST]: solGasParams.fee.data.priorityFeeHigh.toString(),
//           [FeeMode.SLOW]: solGasParams.fee.data.priorityFeeLow.toString(),
//           [FeeMode.AVERAGE]: solGasParams.fee.data.priorityFeeMedium.toString(),
//         }

//         const computeUnitLimit = solGasParams.fee.data.gasLimit
//         const computeUnitPrice = priorityFees[feeMode]
//         return {
//           computeUnitLimit: Number(computeUnitLimit),
//           computeUnitPrice: Number(computeUnitPrice),
//           modeFees: priorityFees,
//         }
//       } else {
//         const computeUnitLimit = 200_000

//         const feeEstimate = await getSolFeeEstimate(
//           new VersionedTransaction(tx.compileToV0Message()).serialize()
//         )

//         const { fee, modeFees } = getSolFeeByFeeMode({
//           fees: feeEstimate,
//           feeMode: feeMode,
//         })

//         if (!fee) {
//           throw new Error(errorContents.gasError)
//         }

//         return { computeUnitLimit, computeUnitPrice: fee, modeFees }
//       }
//     })()

//     const computeUnitIx = ComputeBudgetProgram.setComputeUnitLimit({
//       units: computeUnitLimit,
//     })

//     const feeProgram = ComputeBudgetProgram.setComputeUnitPrice({
//       microLamports: computeUnitPrice,
//     })

//     tx.instructions.push(feeProgram, computeUnitIx)

//     const versionedTransaction = new VersionedTransaction(tx.compileToV0Message())

//     return {
//       transaction: versionedTransaction,
//       fee: formatUnits(BigInt(computeUnitPrice), chains.solana.chain?.nativeCurrency.decimals || 9),
//       fees: modeFees,
//     }
//   }
// }

// const versionedTransactionByJito = (transaction: string) => {
//   const versionedTx = VersionedTransaction.deserialize(Buffer.from(transaction, 'hex'))

//   // const _message = versionedTx.message
//   // const compiledInstructions = versionedTx.message.compiledInstructions

//   // const messageV0 = new MessageV0(_message)

//   // const versionedTransaction = new VersionedTransaction(messageV0);

//   // .compileToV0Message()

//   // const result = await connection.simulateTransaction(versionedTx, {
//   //   sigVerify: false,
//   //   accounts: {
//   //     encoding: 'base64',
//   //     addresses: [fromPubkey.toString()]
//   //   }
//   // })

//   // 90000 - 300000
//   // const fee = result.value.unitsConsumed ?? 300000

//   // console.log({
//   //   key: 'jito-fee',
//   //   fee
//   // })

//   // const feeProgram = ComputeBudgetProgram.setComputeUnitPrice({
//   //   microLamports: fee
//   // })

//   // const jitoFeeProgram = SystemProgram.transfer({
//   //   fromPubkey: fromPubkey,
//   //   toPubkey: jitoTipAccount,
//   //   lamports: fee
//   // })

//   // const messageV02 = new TransactionMessage({
//   //   payerKey: fromPubkey,
//   //   recentBlockhash: messageV0.recentBlockhash,
//   //   instructions: [jitoFeeProgram]
//   // }).compileToV0Message()

//   // console.log({
//   //   key: 'jito-test-messageV02',
//   //   messageV02,
//   //   messageV0,
//   //   staticAccountKeys: versionedTx.message.staticAccountKeys.map((pubKey) =>
//   //     pubKey.toString()
//   //   )
//   // })

//   // const addAccountIfMissing = (account: PublicKey) => {
//   //   const accountAddress = account.toString()
//   //   const addresses = versionedTx.message.staticAccountKeys.map((pubkey) =>
//   //     pubkey.toString()
//   //   )
//   //   const index = addresses.findIndex(
//   //     (address) =>
//   //       address.toLocaleUpperCase() === accountAddress.toLocaleUpperCase()
//   //   )
//   //   // const index = staticAccountKeys.findIndex((key) => key.equals(account))
//   //   if (index === -1) {
//   //     addresses.push(accountAddress)

//   //     versionedTx.message.staticAccountKeys.push(account)
//   //     console.log({
//   //       key: 'current-jimo-address',
//   //       accountAddress,
//   //       addressed: versionedTx.message.staticAccountKeys.map((pubkey) =>
//   //         pubkey.toString()
//   //       )
//   //     })
//   //     return addresses.length - 1
//   //   }
//   //   return index
//   // }

//   // console.log({
//   //   key: 'jito-test',
//   //   versionedTx: JSON.parse(JSON.stringify(versionedTx)),
//   //   // feeProgram,
//   //   jitoFeeProgram
//   // })
//   // // const feeProgramIndex = addAccountIfMissing(feeProgram.programId)
//   // const jitoProgramIndex = addAccountIfMissing(jitoFeeProgram.programId)

//   // // const feeProgramAccounts = feeProgram.keys.map(({ pubkey }) =>
//   // //   addAccountIfMissing(pubkey)
//   // // )

//   // const jitoProgramAccounts = jitoFeeProgram.keys.map(({ pubkey }) =>
//   //   addAccountIfMissing(pubkey)
//   // )

//   // // const feeCompiledInstruction = {
//   // //   programIdIndex: feeProgramIndex, // 程序ID在 staticAccountKeys 中的索引
//   // //   accountKeyIndexes: feeProgramAccounts, // 账户在 staticAccountKeys 中的索引
//   // //   data: feeProgram.data // 数据 Base64 编码
//   // // }

//   // const jitoCompiledInstruction = {
//   //   programIdIndex: jitoProgramIndex,
//   //   accountKeyIndexes: jitoProgramAccounts,
//   //   data: jitoFeeProgram.data
//   // }

//   // // compiledInstructions.push(feeCompiledInstruction)
//   // compiledInstructions.push(jitoCompiledInstruction)

//   // console.log({
//   //   key: 'jito-test-staticAccountKeys',
//   //   staticAccountKeys: versionedTx.message.staticAccountKeys.map((pubKey) =>
//   //     pubKey.toString()
//   //   )
//   // })

//   // console.log({
//   //   key: 'jito-test2',
//   //   versionedTx: versionedTx
//   // })

//   return Buffer.from(versionedTx.serialize()).toString('hex')
// }
