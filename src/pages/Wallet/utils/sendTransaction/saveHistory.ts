import { parseUnits } from 'viem'
import covertToAssetsToken from '../covertToAssetsToken'
import { DexTransaction, IHistoryType } from '@/store/wallet/type'
import { IChainId } from '@/store/wallet/chainType'
import { allChains } from '@/store/wallet/chains'

interface SaveHistoryParamsType {
  params: DexTransaction
  type: 'Send' | 'Swap'
  hash: string
  nonce?: number
}
export type SetTransactionHistoryType = ({
  history,
  chainId,
}: {
  history: IHistoryType
  chainId: IChainId
}) => void

const saveHistory = (
  { params, type, hash, nonce }: SaveHistoryParamsType,
  setTransactionHistory: SetTransactionHistoryType
) => {
  const { fromToken, toToken } = params

  const fromChain = allChains.find((chain) => chain.chain?.id === params.fromToken.chainId)
  const historySave: IHistoryType = {
    fromAddress: params?.fromAddress,
    toAddress: params?.targetAddress,
    fromAmount:
      // @ts-ignore
      params.params?.routeInfo?.originRoute?.[0]?.fromTokenAmount ||
      parseUnits(params.params?.amount || '0', fromToken.decimals).toString(),
    toAmount:
      // @ts-ignore
      params.params?.routeInfo?.originRoute?.[0]?.toTokenAmount ||
      parseUnits(params.params?.routeInfo?.minimumReceived || '0', toToken.decimals).toString(),
    fromSwapTokens: {
      token: {
        ...covertToAssetsToken(fromToken),
      },
      chain: fromChain,
      balance: undefined,
    },
    toSwapTokens: {
      token: {
        ...covertToAssetsToken(toToken),
      },
      chain: allChains.find((chain) => chain.chain?.id === toToken.chainId),
      balance: undefined,
    },
    gasAmount: (params.gasFee ?? '') + '',
    nonce: nonce || 0,
    time: new Date().getTime(),
    hash: hash,
    requestId: params?.params?.routeInfo?.rangoRequestId || '',
    historyType: type as IHistoryType['historyType'],
    type:
      params?.params?.routeInfo?.aggregatorType === 'Okx'
        ? 'OKX'
        : params?.params?.routeInfo?.aggregatorType || '',
    chain: fromChain,
    status: 'pending',
    routeInfo: params.params?.routeInfo
      ? {
          swapperLogo: params.params?.routeInfo.swapperLogo || '',
          swapperTitle: params.params?.routeInfo.swapperTitle || '',
          aggregatorType: params.params?.routeInfo.aggregatorType || undefined,
        }
      : undefined,
  }
  setTransactionHistory({ history: historySave, chainId: fromToken.chainId })
}

export default saveHistory
