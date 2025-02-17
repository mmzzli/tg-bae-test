import { signEvmMessage, signEvmTransaction } from '@/api/wallet'
import { evmChainsConfig } from '@/store/wallet/chains'
import { prepareTransactionRequest } from '@wagmi/core'
import { useEstimateFeesPerGas, useGasPrice } from 'wagmi'
import { useMfa } from '../../Account/hooks/useMfa'
import { TokenInfo } from '../components/ui/SignTransaction/types'
import { IChainId } from '@/store/wallet/chainType'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { useToast } from '@chakra-ui/react'
import { mockTonChainId } from '@/store/wallet/config/ton'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { constructEstGasParams } from '../utils/helper'

export const signMessageApi = async ({
  mfa,
  signData,
}: {
  mfa: any
  signData: {
    message: string
    walletId?: number
  }
}) => {
  const signRes = await signEvmMessage(mfa, signData)
  return signRes
}

export const signEvmTx = async ({
  mfa,
  mfaParams,
  chainId,
}: {
  mfa: any
  mfaParams: {
    gas: string | undefined
    maxFeePerGas: string | undefined
    maxPriorityFeePerGas: string | undefined
    gasPrice: string | undefined
    value: string | undefined
    from: string | undefined
    to: string | undefined
    nonce: number | undefined
    data: string | undefined
  }
  chainId: number
}) => {
  const signRes = await signEvmTransaction(mfa, {
    transaction: mfaParams,
    chainId,
  })
  return signRes
}

export type CustomRpcSchema = [
  {
    Method: 'eth_sendRawTransaction'
    Parameters: [string]
    ReturnType: string
  },
]
const useEvmMethods = ({ chainId }: { chainId?: number | undefined }) => {
  const config = evmChainsConfig()
  const { getMfaParams } = useMfa()

  const gasPrice = useGasPrice({ chainId: chainId })
  const { data: EstimateFees } = useEstimateFeesPerGas({ chainId })
  const toast = useToast()

  const signEVMTransaction = async (params: {
    chainId: number | undefined
    fromAddress: string | undefined
    toAddress: string | undefined
    value: bigint | undefined
    data?: string | undefined
    tokenValue?: bigint | undefined
    token?: TokenInfo | undefined
    walletId?: number
    gasLimit?: string
    gasPrice?: string
  }) => {
    try {
      const data = params.data || '0x'
      const chainId = params.chainId as IChainId
      let res
      try {
        res = await prepareTransactionRequest(
          config,
          constructEstGasParams({
            chainId: chainId,
            account: params.fromAddress as any,
            to: params.toAddress as any,
            value: params.value || 0n,
            data: data as any,
          })
        )
      } catch (e) {
        console.log('prepareTransactionRequest error:', e)
      }

      const mfaParams: any = {
        gas: res?.gas.toString() ?? '21000',
        maxFeePerGas: res?.maxFeePerGas?.toString() ?? EstimateFees?.maxFeePerGas.toString(),
        maxPriorityFeePerGas:
          res?.maxPriorityFeePerGas?.toString() ?? EstimateFees?.maxPriorityFeePerGas.toString(),
        gasPrice: ((gasPrice?.data || 0n) * 2n)?.toString(),
        value: params.value?.toString() ?? res?.value?.toString(),
        from: params.fromAddress as string,
        to: params.toAddress as string,
        nonce: res?.nonce ?? Math.floor(Date.now() / 1000),
        data: data,
      }

      if (params.gasLimit) {
        console.log('using custom gas limit')
        mfaParams.gasLimit = params.gasLimit
        mfaParams.gas = params.gasLimit // todo, may only apply to scroll
      }

      if (params.gasPrice) {
        console.log('using custom gas price')
        mfaParams.gasPrice = params.gasPrice
      }

      if (
        typeof mfaParams?.maxFeePerGas &&
        typeof mfaParams?.maxPriorityFeePerGas &&
        mfaParams?.maxFeePerGas >= 0n &&
        mfaParams?.maxPriorityFeePerGas >= 0n
      ) {
        delete mfaParams.gasPrice
      }

      console.log('mfaParams', mfaParams)
      if (!chainId) throw new Error('Chain id error.')
      const mfaRes = await getMfaParams({
        content: mfaParams,
        chainid: chainId,
      })
      console.log({ mfaRes })
      if (mfaRes) {
        const { mfa } = mfaRes

        if (!mfa) {
          throw new Error('Mfa error.')
        }
        console.log({
          mfa,
        })
        setPassKey(mfa)

        return await signEvmTx({
          mfa,
          mfaParams,
          chainId,
        })
      }
    } catch (error: any) {
      console.warn({
        error,
      })
      let message = error?.message || error.details || error
      if (error.name === 'EstimateGasExecutionError') {
        message = error.details
      }

      toast({
        render: () => {
          return <CustomToast title={message} type={typeOptions.error} />
        },
        position: 'bottom',
        duration: 2000,
      })
    }
  }
  const signEVMMessage = async (params: { message: string; walletId?: number }) => {
    try {
      console.log('signEVMMessage', params)

      const mfaParams = params
      console.log('mfaParams', mfaParams)
      const mfaRes = await getMfaParams({
        content: mfaParams,
        chainid: chainId || mockTonChainId,
      })
      console.log({ mfaRes })
      if (mfaRes) {
        const { mfa } = mfaRes

        if (!mfa) {
          throw new Error('Mfa error.')
        }
        console.log({
          mfa,
        })
        setPassKey(mfa)

        return await signMessageApi({
          mfa,
          signData: params,
        })
      }
    } catch (error: any) {
      console.warn({
        error,
      })
      toast({
        render: () => {
          return (
            <CustomToast
              title={error?.message || error.details || error}
              type={typeOptions.error}
            />
          )
        },
        position: 'bottom',
        duration: 2000,
      })
    }
  }

  return {
    signEVMTransaction,
    signEVMMessage,
  }
}

export default useEvmMethods
