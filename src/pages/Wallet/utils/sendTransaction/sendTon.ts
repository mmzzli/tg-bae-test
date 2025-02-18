import { DexTransaction } from '@/store/wallet/type'
import covertToAssetsToken from '../covertToAssetsToken'
import { parseUnits } from 'viem'
import { TonSendTransactionParams } from '@/store/wallet/config/ton'
import { TonTransactionType } from '../../hooks/useTonTransaction'
import { errorContents } from '@/config/wallet/const'

const sendTon = async (
  params: DexTransaction,
  handleTransferMessage: (
    data?: TonSendTransactionParams
  ) => Promise<{ success: boolean; data: string }>,
  handleTransferSend: (
    signedTransaction: string,
    transaction?: TonTransactionType
  ) => Promise<
    | {
        result: any
      }
    | undefined
  >,
  type: 'Send' | 'Swap' | 'Approve' | 'Gift'
) => {
  const { fromToken, toToken } = params
  // @ts-ignore
  const { success, data: signedtransition } = await handleTransferMessage({
    ...params,
    data: params.data,
    from: params.fromAddress,
    to: params.toAddress,
    decimals: params.fromToken?.decimals,
    value: params.value?.toString?.() || '0',
    gas: '',
  })

  if (!success) {
    throw new Error(signedtransition || errorContents.userErrors.signedMessageError)
  }

  if (params?.fromToken?.decimals) {
    const hex = await handleTransferSend(signedtransition, {
      fromAddress: params.fromAddress,
      toAddress: params.toAddress as string,
      fromValue: BigInt(
        // @ts-ignore
        params?.params?.routeInfo?.originRoute?.[0]?.fromTokenAmount ||
          params?.params?.routeInfo?.swapData?.offerUnits ||
          parseUnits(params.params?.amount || '0', fromToken.decimals).toString() ||
          '0'
      ),
      toValue: BigInt(
        // @ts-ignore
        params.params?.routeInfo?.originRoute?.[0]?.toTokenAmount ||
          params?.params?.routeInfo?.swapData?.askUnits ||
          parseUnits(
            params.params?.routeInfo?.minimumReceived || '0',
            toToken.decimals
          ).toString() ||
          '0'
      ),
      fromToken: {
        ...covertToAssetsToken(fromToken),
      },
      toToken: {
        ...covertToAssetsToken(toToken),
      },
      requestId: params?.params?.routeInfo?.rangoRequestId || '',
      historyType: type,
      type: params.params?.routeInfo?.aggregatorType || 'OKX',
      routeInfo: params?.params?.routeInfo,
    })
    return hex?.result?.msgHash || ''
  }
}

export default sendTon
