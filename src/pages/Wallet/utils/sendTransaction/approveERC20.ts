// import { DexTransaction } from '@/constants/types'
// import { decodeData, encodeDataApprove } from '@/pages/swap/hooks/utils'
import {
  Config,
  estimateFeesPerGas,
  getGasPrice,
  getTransactionCount,
  prepareTransactionRequest,
} from '@wagmi/core'
import { erc20Abi, Hex, maxInt256, maxInt96, parseUnits } from 'viem'
// import { setPassKey } from '..'
// import { sendRawTransactionApi } from '@/config/evm'
// import chains, { evmChainsConfig } from '@/proviers/web3Provider/chains'
// import { getChainByToken } from '@/stores/walletStore/utils'
// import { TypeSwapStoreStatusInfo } from '@/stores/swapStore/type'
// import { GetMfaParamsType } from '@/hooks/useNewSendTransaction'
// import { readContract } from '@wagmi/core'
// import { getEvmSendTransactionParams } from './sendEvm'
// import { UserType } from '@/stores/userStore/type'
// import { FeeMode } from '@/components/FeeSelect'
// import { ChainGasFeesType, getChainByTomoIndex, getChainGasInfoByFeeMode } from '@/hooks/api/chain'
// import { Gwei } from '@/stores/tokenStore/hooks/read/useGas'

import { Gwei } from '@/store/wallet/hooks/read/useGas'
import { DexTransaction, UserType } from '@/store/wallet/type'
import { FeeMode } from '../../components/FeeSelect'
import { GetMfaParamsType } from '../../hooks/useNewSendTransaction'
import { setPassKey } from '@/components/tmd/utils/crypto'

const minPriorityFeePerGas = BigInt(Gwei)
// export const getEvmApproveTransactionParams = async ({
//   chainId,
//   evmAddress,
//   params,
//   feeMode,
//   config,
// }: {
//   chainId: number
//   evmAddress: string
//   params: DexTransaction
//   feeMode: FeeMode
//   config: Config<any, any> | undefined
// }) => {
//   const data = (params.approveData || '0x') as Hex

//   const result: {
//     maxFeePerGas?: bigint
//     maxPriorityFeePerGas?: bigint
//     gas?: bigint
//     account?: Hex
//     to?: Hex
//     data?: Hex
//     value?: bigint
//     res?: {
//       fees: {
//         Instant: ChainGasFeesType
//         Average: ChainGasFeesType
//         Fast: ChainGasFeesType
//       }
//       fee: ChainGasFeesType
//     }
//     nonce?: number
//     chainId?: number
//   } = {
//     chainId: chainId,
//     account: params.fromAddress as `0x${string}`,
//     to: params.toAddress as `0x${string}`,
//     value: BigInt(Number(params.value) || '0'),
//     data,
//   }

//   if (!config) {
//     throw new Error('chains not init')
//   }

//   const pendingNonce = await getTransactionCount(config, {
//     address: evmAddress as Hex,
//     chainId: params.fromToken.chainId,
//     blockTag: 'pending',
//   })

//   const latestNonce = await getTransactionCount(config, {
//     address: evmAddress as Hex,
//     chainId: params.fromToken.chainId,
//     blockTag: 'latest',
//   })

//   const res = await getChainGasInfoByFeeMode({
//     feeMode,
//     chainId,
//     callData: data || '0x',
//     params: {
//       from: params.fromAddress,
//       to: params.approveTo || params.toAddress,
//       value: (params.value || '0')?.toString(),
//     },
//   })

//   if (!res) {
//     return undefined
//   }

//   result.maxFeePerGas =
//     res?.fee.baseFee && res?.fee.priorityFee
//       ? BigInt(res?.fee.baseFee) + BigInt(res?.fee.priorityFee)
//       : undefined

//   result.maxPriorityFeePerGas = res?.fee.priorityFee ? BigInt(res?.fee.priorityFee) : undefined
//   result.gas = res?.fee.data.gasLimit ? BigInt(res?.fee.data.gasLimit) : undefined
//   result.res = res

//   const nonce = (() => {
//     if (latestNonce === pendingNonce) {
//       return pendingNonce
//     }
//     return latestNonce
//   })()

//   result.nonce = nonce
//   return result
// }

export default async function approveErc20({
  params,
  getMfaParams,
  setApproveHash,
  setStatus,
  feeMode,
  user,
  init,
}: {
  params: DexTransaction
  getMfaParams: GetMfaParamsType
  setApproveHash: any
  setStatus: (info: TypeSwapStoreStatusInfo) => void
  feeMode: FeeMode
  user: UserType
  init?: () => void
}) {
  try {
    const { approveData, approveTo, fromToken, fromAddress, gasPrice } = params
    const config = evmChainsConfig()
    const selectChain = getChainByToken(fromToken)
    const data = decodeData(approveData)
    const sender = data[0]
    const allowance = await readContract(config, {
      abi: erc20Abi,
      address: fromToken.address as `0x${string}`,
      functionName: 'allowance',
      args: [fromAddress as `0x${string}`, sender as `0x${string}`],
      chainId: fromToken.chainId,
    })

    let approveDataNew: Hex
    console.log({
      sender,
    })

    if (
      allowance &&
      allowance > 0 &&
      allowance < parseUnits((1e6).toString(), fromToken?.decimals || 6)
    ) {
      approveDataNew = sender && encodeDataApprove({ args: [sender, 0n] })
    } else {
      approveDataNew = params.approveData
      // sender && encodeDataApprove({ args: [sender, maxInt96] })
      //  params.approveData
    }

    const chainId = fromToken.chainId

    const approveApiRes = await getEvmApproveTransactionParams({
      chainId: fromToken.chainId,
      evmAddress: params.fromAddress,
      params: {
        ...params,
        approveData: approveDataNew,
      },
      feeMode,
      config,
    })

    const chainsInfo = await getChainByTomoIndex({ tomoIndex: chainId })

    const prepareParams = (() => {
      const result = {
        // chainId: params.chainId || undefined,
        chainId: approveApiRes?.chainId ? approveApiRes?.chainId : chainId,
        account: approveApiRes?.account ? approveApiRes?.account : params.fromAddress,
        to: approveTo,
        value: 0n,
        data: approveDataNew as Hex,
        gas: approveApiRes?.gas
          ? approveApiRes?.gas
          : (() => {
              const chainIds = [chains.arbitrum.id]
              if (chainIds.includes(chainId)) {
                return params.maxGas ? BigInt(params.maxGas) : undefined
              }
              return params.maxGas ? BigInt(params.maxGas) : undefined
            })(),
        ...(() => {
          if (params.maxPriorityFeePerGas && params.maxFeePerGas) {
            return {
              maxPriorityFeePerGas: BigInt(params.maxPriorityFeePerGas),
              maxFeePerGas: BigInt(params.maxFeePerGas),
            }
          }
        })(),
        maxPriorityFeePerGas: approveApiRes?.maxPriorityFeePerGas,
        maxFeePerGas: approveApiRes?.maxFeePerGas,
      }

      if (!chainsInfo?.support && result.gas) {
        result.gas = result.gas * 3n
      }

      return result
    })()

    const approveRes = await prepareTransactionRequest(config as any, prepareParams)

    const { maxPriorityFeePerGas } = await estimateFeesPerGas(config, {
      chainId: chainId,
    })

    const gasPrice_chain = await getGasPrice(config, {
      chainId: chainId,
    })

    const res = (() => {
      const result = (() => {
        try {
          if (approveRes.type === 'eip1559') {
            const priorityFeePerGas =
              approveRes.maxPriorityFeePerGas < minPriorityFeePerGas ||
              !approveRes.maxPriorityFeePerGas
                ? minPriorityFeePerGas
                : maxPriorityFeePerGas

            const maxFeePerGas =
              approveRes.maxFeePerGas && approveRes.maxFeePerGas > 0n
                ? approveRes.maxFeePerGas
                : Number(gasPrice_chain) && gasPrice_chain
                  ? gasPrice_chain
                  : priorityFeePerGas

            return {
              ...approveRes,
              // maxPriorityFeePerGas: maxFeePerGas,
              maxPriorityFeePerGas: priorityFeePerGas,
              maxFeePerGas,
            }
          }
          return approveRes
        } catch (error) {
          console.warn('approveERC20Error', error)
          return approveRes
        }
      })()

      if (approveRes.type === 'eip1559') {
        if (chainsInfo?.support) {
          return {
            ...result,
            gas: params.maxGas ? BigInt(params.maxGas) : result.gas,
            maxFeePerGas: params.maxFeePerGas ? BigInt(params.maxFeePerGas) : result.maxFeePerGas,
            maxPriorityFeePerGas: params.maxPriorityFeePerGas
              ? BigInt(params.maxPriorityFeePerGas)
              : result.maxPriorityFeePerGas,
          }
        }
      }

      return result
    })()

    // return
    if (res && chainId) {
      const mfaParams = (() => {
        const result = {
          value: res.value?.toString() || '',
          from: res.from,
          to: res.to || '',
          nonce: res.nonce,
          data: res.data || '',
        }
        if (res.maxFeePerGas && res.maxPriorityFeePerGas) {
          return {
            ...result,
            maxFeePerGas: res.maxFeePerGas.toString(),
            maxPriorityFeePerGas: res.maxPriorityFeePerGas.toString(),
            gas: res.gas.toString() || '',
          }
        }
        return {
          gas: res.gas.toString() || '',
          gasPrice: gasPrice?.toString?.() || '',
          ...result,
        }
      })()

      const lastCheckMFAParams = (() => {
        if (mfaParams.maxFeePerGas && mfaParams.maxPriorityFeePerGas) {
          const maxFeePerGas = BigInt(mfaParams.maxFeePerGas)
          const maxPriorityFeePerGas = BigInt(mfaParams.maxPriorityFeePerGas)
          if (maxFeePerGas < maxPriorityFeePerGas) {
            return {
              ...mfaParams,
              maxFeePerGas: (maxFeePerGas + maxPriorityFeePerGas).toString(),
            }
          }
        }
        return mfaParams
      })()
      const mfaRes = await getMfaParams({
        content: lastCheckMFAParams,
        chainid: chainId,
        faildCallBack(bool) {
          // throw new Error('Biometric verify failed!!!!')
        },
      })

      const { mfa } = mfaRes
      if (!mfa) {
        return
      }
      setPassKey(mfa)

      const hash = await sendRawTransactionApi({
        mfa,
        mfaParams: lastCheckMFAParams,
        chain: selectChain!,
        apiParams: {
          user,
          type: 'Send',
          params,
          init,
        },
      })

      if (!hash) {
        return
      }
      setApproveHash(hash)
      setStatus({
        status: 'pending',
        content: '',
      })
      // const receiptRes = await getTransactionReceipt(config, {
      //   hash: hash,
      //   chainId: fromNetwork?.chain?.id
      // })

      return hash
    }
  } catch (error) {
    console.warn('approveErc20', error)
  }
}
