import { evmChainsConfig } from '@/proviers/web3Provider/chains'
import { IWeb3Type } from '@/proviers/web3Provider/type'
import { IHistoryType } from '@/state'
import {
  getBlock,
  getTransaction,
  getTransactionConfirmations,
  getTransactionReceipt
} from '@wagmi/core'
import { Hex } from 'viem'

// TODO update in hashParams chainIdParams chainTypeParams
export const getTransactionDetail = async (
  // tx: IHistoryType
  {
    hash,
    chainId,
    chainType: caseKey
  }: {
    hash: string | undefined
    chainId: number | undefined
    chainType: IWeb3Type | undefined
  }
): Promise<
  | {
      blocknumber: string
      timestamp: number
      gasAmount: bigint
    }
  | undefined
> => {
  if (!hash) return
  return await (async () => {
    switch (caseKey) {
      case 'EVM':
        return await (async () => {
          const config = evmChainsConfig()
          const confirmations = await getTransactionConfirmations(config, {
            hash: hash as Hex,
            chainId: chainId
          })
          console.log({
            confirmations
          })
          if (confirmations <= 0n) return

          const detail = await getTransactionReceipt(config, {
            hash: hash as Hex,
            chainId: chainId
          })
          if (!detail) return

          const blockInfo = await getBlock(config, {
            blockNumber: detail.blockNumber,
            chainId: chainId
          })

          const endTime = Number(blockInfo.timestamp.toString())

          const effectiveGasPrice = detail.effectiveGasPrice

          const gasUsed = detail.gasUsed

          return {
            blocknumber: detail.blockNumber.toString(),
            timestamp: endTime * 1000,
            gasAmount: gasUsed * effectiveGasPrice
          }
        })()
      default:
        return undefined
    }
  })()
}
