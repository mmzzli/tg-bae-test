import { getTransactionReceipt } from '@wagmi/core'
import { Hex } from 'viem'
import { getConnection } from '../config/sol'
import useTonTransactions from '@/pages/Wallet/hooks/useTonTransactions'
import dayjs from 'dayjs'
import { IHistoryType } from '../type'
import { getChainByChainId, isEmpty } from '../util/tokenHelper'
import chains, { evmChainsConfig } from '../chains'
import { IWeb3ChainType } from '../chainType'
import { formatterEvmTransactionReceipt, formatterSolTransactionReceipt } from '../util/txHelper'

export interface BridgeStatusType {
  bridgeHash: string
  status: 'success' | 'pending' | 'failed' | 'loading' | 'unknow' | 'fail'
  extra:
    | {
        blockNumber: string
        gasAmount: string
        toAddress: string
        toHash: string
        endTime: string
      }
    | undefined
}

const useGetTransactionsStatus = () => {
  const config = evmChainsConfig()
  const { queryTransaction } = useTonTransactions()
  // const { queryTransactionTest } = useTonTestnetTransactions()

  // GetTransactionReceiptReturnType
  const queryEvmTransaction = async ({
    hash,
    chainId
  }: {
    hash: string
    chainId: number | undefined
  }) => {
    return await getTransactionReceipt(config as any, {
      hash: hash as Hex,
      chainId
    })
  }

  // VersionedTransactionResponse
  const querySolTransaction = async ({ hash }: { hash: string }) => {
    return await getConnection().getTransaction(hash, {
      maxSupportedTransactionVersion: 0
    })
  }

  const queryTonTransaction = async ({
    fromAddress,
    hash
  }: {
    fromAddress: string | undefined
    hash: string
  }) => {
    return await queryTransaction(`${fromAddress}`, hash)
  }

  // const queryTonTestTransaction = async ({
  //   fromAddress,
  //   hash
  // }: {
  //   fromAddress: string | undefined
  //   hash: string
  // }) => {
  //   return await queryTransactionTest(`${fromAddress}`, hash)
  // }

  // const queryTronTransaction = async ({ hash }: { hash: string }) => {
  //   return await getTronTransaction(hash)
  // }

  // const queryCosmosTransaction = async ({ hash }: { hash: string }) => {
  //   return await getCosmosTransaction(hash)
  // }

  // const queryDogeTransactionStatus = async (hash: string) => {
  //   return await getDogeTransactionStatus(hash)
  // }
  
  const getTransactionStatus = async ({
    find
  }: {
    find: IHistoryType | undefined
  }): Promise<BridgeStatusType> => {
    const pendSta: BridgeStatusType = {
      bridgeHash: '',
      status: 'pending',
      extra: undefined
    }
    const succSta: BridgeStatusType = {
      bridgeHash: '',
      status: 'success',
      extra: undefined
    }
    const failSta: BridgeStatusType = {
      bridgeHash: '',
      status: 'failed',
      extra: undefined
    }

    const fromHashExistCheck = async (
      fromChain: IWeb3ChainType | undefined,
      fromAddress: string | undefined,
      hash: string,
      chainId: number
    ) => {
      switch (fromChain?.type) {
        case 'EVM':
          return await (async () => {
            try {
              const res = await queryEvmTransaction({ hash, chainId })
              if (res?.status === 'success') {
                const extra = formatterEvmTransactionReceipt(
                  res,
                  getChainByChainId(chainId as number)?.chain?.nativeCurrency
                    .decimals || 18
                )
                return {
                  ...succSta,
                  extra
                }
              }
              if (res?.status === 'reverted') {
                return failSta
              }
              return pendSta
            } catch (error) {
              return pendSta
            }
          })()
        case 'SOL':
          return await (async () => {
            try {
              const res = await querySolTransaction({ hash })
              if (res) {
                if (res.meta?.err) {
                  return failSta
                }
                return {
                  ...succSta,
                  extra: formatterSolTransactionReceipt(res)
                }
              }
            } catch {
              console.warn('querySolTransaction error ===>', hash)
            }
            return pendSta
          })()
        case 'TON':
          return await (async () => {
            try {
              const res = await queryTonTransaction({ fromAddress, hash })
              if (res && !isEmpty(res)) {
                return {
                  ...succSta,
                  extra: res
                }
              }
            } catch {
              console.warn('queryTonTransaction error ===>', hash)
            }
            return failSta
          })()
        default:
          return pendSta
      }
    }

    const getFindStatus = async () => {
      const fromAddress = find ? find?.fromAddress : undefined
      const fromSwapTokens = find?.fromSwapTokens
      const toSwapTokens = find?.toSwapTokens
      const hash = find?.hash || ''
      const type: any = find?.type
      const requestId = find?.requestId
      const fromChain = fromSwapTokens?.chain
      const toChain = toSwapTokens?.chain
      const fromChainId = fromChain?.id
      const toChainId = toChain?.id
      const chainId = fromChainId

      if (fromChainId === toChainId) {
        return await fromHashExistCheck(
          fromChain,
          fromAddress,
          hash,
          chainId as number
        )
      } else {
        // ignore
      }

      return pendSta
    }

    if (find && typeof find.status !== 'string') {
      return pendSta
    }

    if (find && find.status !== 'pending') {
      return {
        bridgeHash: '',
        status: find.status || 'unknow',
        extra: undefined
      }
    }
    const currentTime = dayjs()
    const targetDateTime = dayjs(find?.time)

    if (find && find.chain?.id === chains.ton.id) {
      if (
        currentTime.diff(targetDateTime, 'seconds') < 20 &&
        find?.status === 'pending'
      ) {
        return pendSta
      }
    } else {
      if (
        currentTime.diff(targetDateTime, 'seconds') < 5 &&
        find?.status === 'pending'
      ) {
        return pendSta
      }
    }

    if (
      currentTime.diff(targetDateTime, 'hour') > 1 &&
      find?.status === 'pending'
    ) {
      const geted = await getFindStatus()

      if (geted.status !== 'pending') {
        return geted
      }
      return failSta
    }

    const res = await getFindStatus()
    console.log({
      key: 'pends-check',
      res
    })
    return res
  }

  return { getTransactionStatus }
}
export default useGetTransactionsStatus
