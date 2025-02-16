// import {
//   btcSignPsbt,
//   btcSignPsbtAndPush,
//   signEvmTransaction,
//   solSignRawTransaction,
//   tonSignMessage,
//   tronSignRawTransaction,
//   v1AddAssetApi,
// } from 'api'
// import { BTCNetworkAddressType, BTCNetworkType } from 'api/type'
// import toast from 'components/Toast'
// import { mockBtcEvmChainId, sendTx } from 'config/btc'
// import { sendRawTransactionApi, sendTransaction as getTransactionHex } from 'config/evm'
// import {
//   getSendSplToken,
//   mockSolEvmChainId,
//   sendRawTransaction as sendSolRawTransaction,
//   sendRawTransactionByStatus,
//   sendSolTx,
// } from 'config/sol'
// import {
//   createSigningTransaction,
//   createSigningTransactionPure,
//   sendTransaction as sendTonBocString,
// } from 'config/ton'
// import {
//   createSigningTestnetTransaction,
//   createSigningTransactionPureTestnet,
//   sendTestnetTransaction as sendTonTestnetBocString,
// } from 'config/tonTestnet'
// import { mockTronChainId, sendRawTransaction, sendTransaction } from 'config/tron'
// import { useAtom, useAtomValue } from 'jotai'
// import { IChainId, Web3Type } from 'proviers/web3Provider/type'
// import React from 'react'
// import { clientMapAtom, IHistoryType } from 'state'
// import { setPassKey } from 'utils'
// import { waitForTransactionSuccess } from 'utils/wallet'
// import {
//   createPublicClient,
//   encodeDeployData,
//   encodeFunctionData,
//   formatUnits,
//   Hex,
//   http,
//   parseGwei,
//   parseUnits,
//   rpcSchema,
// } from 'viem'
// import {
//   useAccount,
//   useEstimateFeesPerGas,
//   useEstimateGas,
//   useEstimateMaxPriorityFeePerGas,
//   useGasPrice,
// } from 'wagmi'

import useTransactions from '@/store/wallet/hooks/useTransactions'
import { useCommonStore } from '@/store/wallet/walletCommon'
import { useMfa } from '../Account/hooks/useMfa'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import {
  getSendSplToken,
  mockSolEvmChainId,
  sendRawTransactionByStatus,
  sendSolTx,
} from '@/store/wallet/config/sol'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { Web3Type } from '@/store/wallet/chainType'
import { allChains } from '@/store/wallet/chains'
import { IHistoryType } from '@/store/wallet/type'

// import { TToast } from '@/components/tmd'
// import { errorContents } from '@/config/const'
// import chains, { allChains, evmChainsConfig } from '@/proviers/web3Provider/chains'
// import useCommonStore from '@/stores/commonStore/hooks/useCommonStore'
// import tokenStore from '@/stores/tokenStore'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import useTransactions from '@/stores/walletStore/hooks/useTransactions'
// import { getChainByToken, isChainEVM } from '@/stores/walletStore/utils'
// import btcProvider from '@/utils/provider/btcProvider'
// import { loggerT } from '@/utils/sentry/logger'
// import isError from '@/utils/sentry/logger/isError'
// import { TonTxRequestStandard } from '@/utils/tgSdkJavascript/ton/types'
// import { Transaction } from '@solana/web3.js'
// import { useQuery } from '@tanstack/react-query'
// import { prepareTransactionRequest } from '@wagmi/core'

// import useChains from '../stores/tokenStore/hooks/useChains'
// import useLoginInfo from './useLoginInfo'
// import { useMfa } from './useMfa'

// export const useReadyBtcTransaction = (params: {
//   network: BTCNetworkType
//   addressType: BTCNetworkAddressType | undefined
//   toAddress: string
//   amount: string
// }) => {
//   const { btcWallet } = useLoginInfo()
//   const readyBtcTransaction = useQuery({
//     queryKey: [
//       'readyBtcTransaction',
//       params.addressType,
//       params.amount,
//       params.network,
//       params.toAddress,
//       btcWallet,
//     ],
//     queryFn: async () => {
//       const txStr = await sendTx({
//         network: params.network, // my Address
//         addressType: params.addressType, // toAddress
//         toAddress: params.toAddress, //value
//         amount: params.amount, // contract Address  // token address or undefined
//       })
//       return txStr
//     },
//   })
//   return readyBtcTransaction
// }

export type CustomRpcSchema = [
  {
    Method: 'eth_sendRawTransaction'
    Parameters: [string]
    ReturnType: string
  },
]
const useSendTransaction = ({ chainId }: { chainId?: number | undefined }) => {
  // const { evmWallet } = useAtomValue(clientMapAtom)
  const { feeMode } = useCommonStore()
  const { addTx: setTransactionHistory } = useTransactions()
  // const config = evmChainsConfig()
  const { getMfaParams } = useMfa()
  // const selectChain = allChains.find((chain) => {
  //   switch (chain.type) {
  //     case Web3Type.EVM:
  //       return chain.chain?.id === chainId
  //     case Web3Type.BTC:
  //       return chainId === mockBtcEvmChainId
  //     case Web3Type.SOL:
  //       return chainId === mockSolEvmChainId
  //     case Web3Type.TON:
  //       return chainId === chains.ton.id
  //     case Web3Type.TONTEST:
  //       return chainId === chains.tonTestnet.id
  //     default:
  //       return undefined
  //   }
  // })

  // const gasPrice = useGasPrice({ chainId: chainId })

  // const sendEVMTransaction = async (params: {
  //   chainId: number | undefined
  //   fromAddress: string | undefined
  //   toAddress: string | undefined
  //   value: bigint | undefined
  //   data?: string | undefined
  //   tokenValue?: bigint | undefined
  //   token?: AssetsToken | undefined
  // }) => {
  //   const { tokenValue, token } = params
  //   try {
  //     console.log('sendEVMTransaction', params)
  //     const data = params.data || '0x'
  //     const chainId = params.chainId as IChainId
  //     const res = await prepareTransactionRequest(config, {
  //       // chainId: params.chainId || undefined,
  //       chainId: chainId,
  //       account: params.fromAddress,
  //       to: params.toAddress,
  //       value: params.value || 0n,
  //       data: data,
  //       // gasPrice: parseGwei('80')
  //     })
  //     if (res) {
  //       const mfaParams = {
  //         gas: res?.gas?.toString() ?? '',
  //         maxFeePerGas: res?.maxFeePerGas?.toString() ?? '',
  //         maxPriorityFeePerGas: res?.maxFeePerGas?.toString() ?? '',
  //         gasPrice: gasPrice?.data?.toString() ?? '',
  //         value: res.value?.toString() ?? '',
  //         from: res.from as string,
  //         to: res.to ?? '',
  //         nonce: res.nonce,
  //         data: data,
  //       }
  //       if (!chainId) return
  //       const mfaRes = await getMfaParams({
  //         content: mfaParams,
  //         chainid: chainId,
  //       })
  //       if (mfaRes) {
  //         const { mfa } = mfaRes
  //         if (!mfa) {
  //           return
  //           // sendTranSactionApi({
  //           //   url: sepolia.rpcUrls.default.http[0],
  //           //   raw: raw
  //           // })
  //         }
  //         console.log({
  //           mfa,
  //         })
  //         setPassKey(mfa)

  //         const rpc = selectChain?.chain?.rpcUrls.default.http[0]
  //         if (!rpc) {
  //           return
  //         }

  //         const hash = await sendRawTransactionApi({
  //           mfa,
  //           mfaParams,
  //           chain: selectChain,
  //         })

  //         if (!hash) {
  //           return
  //         }

  //         const check = await waitForTransactionSuccess({
  //           txHash: hash,
  //           chain: selectChain?.chain,
  //         })

  //         // if (!check) {
  //         // }

  //         if (hash) {
  //           const chain = allChains.find((chain) => chain.chain?.id === params.chainId)
  //           const historySave: IHistoryType = {
  //             fromAddress: params?.fromAddress,
  //             toAddress: params?.toAddress,
  //             fromAmount: params?.tokenValue?.toString(),
  //             toAmount: params?.tokenValue?.toString() || '0',
  //             fromSwapTokens: {
  //               token: {
  //                 ...params.token,
  //                 balance: params.token?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               },
  //               chain: allChains.find((chain) => chain.chain?.id === chainId),
  //               balance: undefined,
  //             },
  //             toSwapTokens: {
  //               token: {
  //                 ...params.token,
  //                 balance: params.token?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               },
  //               chain: allChains.find((chain) => chain.chain?.id === chainId),
  //               balance: undefined,
  //             },
  //             nonce: res.nonce,
  //             time: new Date().getTime(),
  //             hash: hash,
  //             historyType: 'Send',
  //             chain: chain,
  //             status: 'pending',
  //           }

  //           if (typeof chainId === 'number') {
  //             setTransactionHistory({
  //               history: historySave,
  //               chainId,
  //             })
  //           }
  //           return hash
  //         }
  //       }
  //     } else {
  //       console.error('prepareTransactionRequest')
  //     }
  //   } catch (error: any) {
  //     console.warn({
  //       error,
  //     })
  //     // if (error.name === 'EstimateGasExecutionError') {
  //     //   toast.error(error.details)
  //     // } else {
  //     //   toast.error(error.details ? error.details : error)
  //     // }
  //     throw error.details ? error.details : error?.message ? error?.message : error
  //   }
  // }

  const sendSolTransaction = async (params: {
    fromAddress: string | undefined
    toAddress: string
    value: bigint | undefined //1e9   decimal: 9
    contract?: string
    token?: AssetsToken | undefined
  }) => {
    try {
      if (params.value && params.fromAddress) {
        let txStr
        const mfaRes = await getMfaParams({
          content: 'transaction',
          chainid: mockSolEvmChainId,
        })
        if (!params.contract) {
          txStr = await sendSolTx(
            params.fromAddress, // my Address
            params.toAddress, // toAddress
            params.value || 0n, //value
            // signData.txMeta.mintAddress // contract Address
            feeMode
          )
        } else {
          txStr = await getSendSplToken(
            params.contract,
            params.fromAddress,
            params.toAddress,
            params.value,
            feeMode
          )
        }

        if (mfaRes.mfa) {
          setPassKey(mfaRes.mfa)
          // const signRes = await solSignRawTransaction({
          //   rawTransaction: txStr ?? ''
          // })
          if (txStr) {
            const hash = await sendRawTransactionByStatus({
              transaction: txStr.transaction,
              fromAddress: params.fromAddress,
            })
            if (!hash) {
              return
            }
            const chain = allChains.find((chain) => chain.type === Web3Type.SOL)
            const chainId = mockSolEvmChainId
            const historySave: IHistoryType = {
              fromAddress: params?.fromAddress,
              toAddress: params?.toAddress,
              fromAmount: params?.value?.toString(),
              toAmount: params?.value?.toString() || '0',
              fromSwapTokens: {
                token: {
                  ...params.token,
                  balance: params.token?.balance?.toString() || '0',
                  balanceItem: undefined,
                },
                chain: chain,
                balance: undefined,
              },
              toSwapTokens: {
                token: {
                  ...params.token,
                  balance: params.token?.balance?.toString() || '0',
                  balanceItem: undefined,
                },
                chain: chain,
                balance: undefined,
              },
              nonce: new Date().getTime(),
              time: new Date().getTime(),
              hash: hash,
              historyType: 'Send',
              chain: chain,
              status: 'pending',
            }
            console.log({
              historySave,
            })
            if (typeof chainId === 'number') {
              setTransactionHistory({
                history: historySave,
                chainId,
              })
            }
            if (hash) {
              return hash
            }
          }
        }
      }
    } catch (error) {
      console.error(error)
      // if (isError(error)) {
      //   const extra = {
      //     type: 'Send',
      //     params,
      //     error: JSON.stringify(error),
      //   }
      //   loggerT.fatal('Send', 'send sol transaction err', error, {
      //     extra: extra,
      //   })
      // }
      throw error // unnecessary throw ? TODO
    }
  }

  // const sendBtcTransaction = async (params: {
  //   network: BTCNetworkType
  //   addressType: BTCNetworkAddressType
  //   txStr: any
  //   value: string
  //   token?: AssetsToken
  //   fromAddress: string
  //   toAddress: string
  // }) => {
  //   try {
  //     if (params.txStr) {
  //       const mfaRes = await getMfaParams({
  //         content: params.txStr,
  //         chainid: mockSolEvmChainId,
  //       })

  //       if (mfaRes) {
  //         setPassKey(mfaRes.mfa)

  //         // const res = await btcSignPsbtAndPush({
  //         //   networkType: params.network,
  //         //   addressType: params.addressType, // toAddress
  //         //   psbtHex: params.txStr.result.psbtHex,
  //         //   autoFinalized: true
  //         // })

  //         const signRes = await btcSignPsbt({
  //           networkType: params.network,
  //           addressType: params.addressType,
  //           psbtHex: params.txStr,
  //           autoFinalized: true,
  //         })

  //         // console.log(111, signRes)

  //         const signedTxHex = btcProvider.psbtToHex(signRes.result)

  //         // console.log(222, signedTxHex)

  //         // return

  //         const res = await btcProvider.rpcPushTx(signedTxHex)

  //         // console.log(333, res)

  //         if (res && res.result) {
  //           const hash = res.result

  //           const chain = allChains.find((chain) => chain.type === Web3Type.BTC)
  //           const chainId = mockBtcEvmChainId

  //           const historySave: IHistoryType = {
  //             fromAddress: params.fromAddress,
  //             toAddress: params.toAddress,
  //             fromAmount: params?.value,
  //             toAmount: params?.value,
  //             fromSwapTokens: {
  //               token: {
  //                 ...params.token,
  //                 balance: params.token?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               },
  //               chain: chain,
  //               balance: undefined,
  //             },
  //             toSwapTokens: {
  //               token: {
  //                 ...params.token,
  //                 balance: params.token?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               },
  //               chain: chain,
  //               balance: undefined,
  //             },
  //             nonce: new Date().getTime(),
  //             time: new Date().getTime(),
  //             hash: hash,
  //             historyType: 'Send',
  //             chain: chain,
  //             status: 'pending',
  //           }

  //           if (typeof chainId === 'number') {
  //             setTransactionHistory({
  //               history: historySave,
  //               chainId,
  //             })
  //           }

  //           return hash
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     if (isError(error)) {
  //       const type = 'Send'
  //       const extra = {
  //         type: type,
  //         params,
  //         error: JSON.stringify(error),
  //       }
  //       loggerT.fatal('Send', 'send btc transaction err', error, { extra })
  //     }
  //     throw error
  //   }
  // }

  // const sendTronTransaction = async ({
  //   fromAddress,
  //   toAddress,
  //   fromValue,
  //   toValue,
  //   contract,
  //   transaction,
  //   fromToken,
  //   historyType,
  //   saveHistory,
  //   toToken,
  // }: {
  //   fromAddress: string | undefined
  //   toAddress: string
  //   fromValue: bigint | undefined //1e9   decimal: 9
  //   toValue?: bigint | undefined //1e9   decimal: 9
  //   contract?: string
  //   fromToken?: AssetsToken | undefined
  //   toToken?: AssetsToken | undefined
  //   transaction?: {
  //     raw_data: any
  //     raw_data_hex: any
  //     txID: any
  //     visible: any
  //   }
  //   historyType?: 'Send' | 'Swap' | 'Approve'
  //   saveHistory?: boolean
  // }) => {
  //   const tx = await (async () => {
  //     if (transaction) {
  //       return transaction
  //     }
  //     if (fromAddress && toAddress && fromValue) {
  //       return await sendTransaction({
  //         amount: fromValue,
  //         from: fromAddress,
  //         to: toAddress,
  //         contract,
  //       })
  //     }
  //   })()

  //   const rawTransaction = (() => {
  //     if (contract) {
  //       return Buffer.from(JSON.stringify(tx), 'utf8').toString('hex')
  //     } else {
  //       return Buffer.from(JSON.stringify(tx), 'utf8').toString('hex')
  //     }
  //   })()

  //   const mfaRes = await getMfaParams({
  //     content: rawTransaction,
  //     chainid: mockTronChainId,
  //   })

  //   if (mfaRes.mfa) {
  //     setPassKey(mfaRes.mfa)

  //     const signRes = await tronSignRawTransaction({
  //       rawTransaction: rawTransaction ?? '',
  //     })

  //     if (signRes) {
  //       const rawTransaction: {
  //         visible: boolean
  //         txID: string
  //         raw_data_hex: string
  //         raw_data: any
  //         signature: string[]
  //       } = JSON.parse(Buffer.from(signRes.result, 'hex').toString('utf-8'))
  //       const hash: {
  //         result: boolean
  //         txid: string
  //         transaction: any
  //       } = await sendRawTransaction({
  //         rawTransaction: rawTransaction,
  //       })

  //       if (!hash) {
  //         throw new Error(errorContents.transactionError)
  //       }

  //       const chain = allChains.find((chain) => chain.type === Web3Type.TRON)
  //       const chainId = mockTronChainId
  //       const historySave: IHistoryType = {
  //         fromAddress: fromAddress,
  //         toAddress: toAddress,
  //         fromAmount: fromValue?.toString(),
  //         toAmount: (toValue ? toValue : fromValue)?.toString() || '0',
  //         fromSwapTokens: {
  //           token: {
  //             ...fromToken,
  //             balance: fromToken?.balance?.toString() || '0',
  //             balanceItem: undefined,
  //           },
  //           chain: chain,
  //           balance: undefined,
  //         },
  //         toSwapTokens: {
  //           token: toToken
  //             ? {
  //                 ...toToken,
  //                 balance: toToken?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               }
  //             : {
  //                 ...fromToken,
  //                 balance: fromToken?.balance?.toString() || '0',
  //                 balanceItem: undefined,
  //               },
  //           chain: chain,
  //           balance: undefined,
  //         },
  //         nonce: new Date().getTime(),
  //         time: new Date().getTime(),
  //         hash: hash.txid,
  //         historyType: historyType ? historyType : 'Send',
  //         chain: chain,
  //         status: 'pending',
  //       }

  //       historySave.historyType !== 'Approve' &&
  //         setTransactionHistory({
  //           history: historySave,
  //           chainId,
  //         })

  //       if (typeof saveHistory === 'boolean' ? saveHistory : true) {
  //         const chainDivId = toToken && getChainByToken(toToken)?.id

  //         if (toToken && toToken?.address && chainDivId) {
  //           await v1AddAssetApi({
  //             chain_id: chainDivId,
  //             decimals: toToken.decimals,
  //             image: toToken.image,
  //             name: toToken.name,
  //             symbol: toToken.symbol,
  //             token: isChainEVM(chainDivId) ? toToken.address.toLowerCase() : toToken.address,
  //           })
  //           tokenStore.refreshTokenList(new Date().getTime())
  //         }
  //       }

  //       if (hash) {
  //         return hash.txid
  //       }
  //     }
  //   }
  // }

  // const sendTonTransaction = async ({
  //   paramsForPure,
  //   validUntil,
  // }: {
  //   paramsForPure: TonTxRequestStandard
  //   validUntil?: number
  // }) => {
  //   try {
  //     const mfaRes = await getMfaParams({
  //       // content: singingMessage,
  //       content: '',
  //       chainid: chains.ton.id,
  //     })

  //     const { mfa } = mfaRes
  //     if (!mfa) return

  //     setPassKey(mfa)

  //     const singingMessage: Awaited<ReturnType<typeof createSigningTransaction>> =
  //       await createSigningTransactionPure(paramsForPure, validUntil)
  //     if (!singingMessage?.signingMessageBoc) return

  //     const mfaParams = {
  //       signingMessageBoc: singingMessage.signingMessageBoc,
  //       stateInitBoc: singingMessage?.stateInitBoc || '',
  //     }

  //     if (!mfaParams.signingMessageBoc) {
  //       return
  //     }

  //     const { result: signedTransaction, code, message } = await tonSignMessage(mfa, mfaParams)

  //     if (+code !== 10000) throw new Error(message)
  //     const result = await sendTonBocString(signedTransaction)
  //     console.log(result, 'sign ton and send')
  //     return {
  //       signedTransaction,
  //       code,
  //       message,
  //     }
  //   } catch (error: any) {
  //     console.warn({
  //       error,
  //     })
  //     if (isError(error)) {
  //       const type = 'Send'
  //       const extra = {
  //         type: type,
  //         params: paramsForPure,
  //         error: JSON.stringify(error),
  //       }
  //       loggerT.fatal('Send', 'send ton transaction err', error, { extra })
  //     }

  //     if (error.name === 'EstimateGasExecutionError') {
  //       TToast.error(error.details)
  //     } else {
  //       TToast.error(error?.message || error.details || error)
  //     }
  //   }
  // }

  // const sendTonTestnetTransaction = async ({
  //   paramsForPure,
  // }: {
  //   paramsForPure: TonTxRequestStandard
  // }) => {
  //   try {
  //     const singingMessage: Awaited<ReturnType<typeof createSigningTestnetTransaction>> =
  //       await createSigningTransactionPureTestnet(paramsForPure)
  //     if (!singingMessage?.signingMessageBoc) return

  //     const mfaRes = await getMfaParams({
  //       content: singingMessage,
  //       chainid: chains.tonTestnet.id,
  //     })

  //     const { mfa } = mfaRes
  //     if (!mfa) return

  //     setPassKey(mfa)

  //     const mfaParams = {
  //       signingMessageBoc: singingMessage.signingMessageBoc,
  //       stateInitBoc: singingMessage?.stateInitBoc || '',
  //       isTestnet: true,
  //     }

  //     if (!mfaParams.signingMessageBoc) {
  //       return
  //     }

  //     const { result: signedTransaction, code, message } = await tonSignMessage(mfa, mfaParams)

  //     if (+code !== 10000) throw new Error(message)
  //     const result = await sendTonTestnetBocString(signedTransaction)
  //     console.log(result, 'sign ton and send')
  //     return {
  //       signedTransaction,
  //       code,
  //       message,
  //     }
  //   } catch (error: any) {
  //     console.warn({
  //       error,
  //     })
  //     if (error.name === 'EstimateGasExecutionError') {
  //       TToast.error(error.details)
  //     } else {
  //       TToast.error(error?.message || error.details || error)
  //     }
  //     throw error
  //   }
  // }

  return {
    // evmWallet,
    // sendEVMTransaction,
    sendSolTransaction,
    // sendBtcTransaction,
    // sendTronTransaction,
    // sendTonTestnetTransaction,
    // sendTonTransaction,
  }
}

export default useSendTransaction
