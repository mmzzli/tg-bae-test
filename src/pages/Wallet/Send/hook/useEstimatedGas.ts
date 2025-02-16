// import { FeeMode } from '@/components/FeeSelect'
// import { getCosmosEstimateGasFee } from '@/config/cosmos'
// import { getPriorityFee, getSolFees } from '@/config/sol'
// import { getSuiSendGas } from '@/config/sui'
// import { getDogeFeeByBlock } from '@/config/doge'
// import { DexTransaction } from '@/constants/types'
// import useLoginInfo from '@/hooks/useLoginInfo'
// import chains from '@/proviers/web3Provider/chains'
// import { Web3Type } from '@/proviers/web3Provider/type'
// import { IHistoryType } from '@/state'
// import useCommonStore from '@/stores/commonStore/hooks/useCommonStore'
// import tokenStore from '@/stores/tokenStore'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { WalletType } from '@/stores/tokenStore/type/BTCToken'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import { getBitCoinTypeBySend } from '@/utils'
// import getBtcGas from '@/utils/estimateGas/getBtcGas'
// import getEvmGas from '@/utils/estimateGas/getEvmGas'
// import getTronGas from '@/utils/estimateGas/getTronGas'
// import { getSendEvmGas } from '@/utils/sendTransaction/sendEvm'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { FeeMode } from '../../components/FeeSelect'
import { DexTransaction } from '@/store/wallet/type'
import { useCommonStore } from '@/store/wallet/walletCommon'
import { useUserStore } from '@/store/wallet/walletUser'
import { useTokenStore } from '@/store/wallet/walletToken'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { Web3Type } from '@/store/wallet/chainType'
import { getPriorityFee } from '@/store/wallet/config/sol'
import chains from '@/store/wallet/chains'
import { getSendEvmGas } from '../../utils/sendTransaction/sendEvm'
import getEvmGas from '../../utils/estimateGas/getEvmGas'
const avgTonNativeTransferFee = '0.005'
const avgTonJettonTransferFee = '0.05'

export interface UseEstimatedGasParamsType {
  toAddress: string
  amount: string
  token: AssetsToken
  walletBtcType?: string
  data?: string
  inputAmount?: string
}
const useEstimatedGas = ({
  params,
  chainId,
  gasMagnification = 1.5,
  evmParams,
  feeModeParams = FeeMode.SLOW,
  gasMagnMode,
}: {
  params: UseEstimatedGasParamsType
  chainId: number
  gasMagnification?: number // remain gas rate
  evmParams?: DexTransaction
  feeModeParams?: FeeMode
  gasMagnMode?: boolean
}) => {
  const { feeMode } = useCommonStore()
  const {
    walletUserInfo: { ethereumAddress: evmAddress, solanaAddress: solAddress, tonAddress },
  } = useUserStore()
  const { tokenList } = useTokenStore()

  const nativeToken = useMemo(
    () => tokenList.find((token) => token.isNative && token.chainId === chainId),
    []
  )

  // console.log({
  //   queryKey: 'gasPriceToken2',
  //   key: [
  //     'transafer-sol-priorityFee',
  //     params.amount,
  //     params.token.address,
  //     params.token.symbol,
  //     chainId
  //   ]
  // })
  const priorityFee = useQuery({
    queryKey: [
      'transafer-sol-priorityFee',
      params?.amount,
      params?.token?.address,
      params?.token?.symbol,
      chainId,
    ],
    placeholderData: keepPreviousData,
    queryFn: () => {
      const chain = getChainByChainId(chainId)
      switch (chain?.type) {
        case Web3Type.SOL:
          return getPriorityFee({
            fromAddress: solAddress,
            toAddress: params?.toAddress,
            value: parseUnits(params?.amount || '0', params.token?.decimals || 9),
            contract: params?.token?.address || '',
            token: params?.token,
            feeMode,
          })
        default:
          return null
      }
    },
  })

  // console.log({
  //   queryKey: 'gasPriceToken3',
  //   key: [
  //     'queryEstimatedGas',
  //     params.amount,
  //     params.token.address,
  //     params.token.symbol,
  //     chainId
  //   ]
  // })
  const gasFee = useQuery({
    queryKey: [
      'queryEstimatedGas',
      params?.amount,
      params?.token?.address,
      params?.token?.symbol,
      chainId,
    ],
    queryFn: async () => {
      const chain = getChainByChainId(chainId)

      switch (chain?.type) {
        // case Web3Type.BTC: {
        //   const btcGas = await getBtcGas({
        //     ...params,
        //     fromAddress: btcAddress[`${params.walletBtcType}Address`],
        //     addressType: getBitCoinTypeBySend(params.walletBtcType as WalletType),
        //   })

        //   return new BigNumber(btcGas).multipliedBy(gasMagnification).toString()
        // }

        case Web3Type.EVM: {
          return await (async () => {
            if (evmParams) {
              const gasFee = await (async () => {
                try {
                  const evmGasFeeV2 = await getSendEvmGas({
                    params: evmParams,
                    type: 'Send',
                    evmAddress,
                    feeMode: feeModeParams,
                  })

                  const chain = getChainByChainId(chainId)
                  if (!evmGasFeeV2?.feeModeGas) {
                    throw new Error('sendData is null')
                  }

                  const evmGasFeeV2Format = formatUnits(
                    evmGasFeeV2?.feeModeGas || 0n,
                    chain?.chain?.nativeCurrency.decimals || 18
                  )
                  return evmGasFeeV2Format
                } catch (error) {
                  console.log('evmGasFeeV2', error)
                  const evmGasFee = await getEvmGas({
                    fromAddress: evmAddress,
                    toAddress: params.toAddress,
                    token: params.token,
                    chainId,
                    data: params.data,
                  })

                  return evmGasFee
                }
              })()

              return gasMagnMode
                ? new BigNumber(gasFee).multipliedBy(gasMagnification).toFixed()
                : new BigNumber(gasFee).toFixed()
            }
          })()
        }

        case Web3Type.SOL: {
          const totalFee = '5000'
          //sol can only estimated baseFee
          return formatUnits(
            BigInt(totalFee || '0') * 10n,
            chains.solana.chain?.nativeCurrency.decimals
          )
        }
        // case Web3Type.TRON:
        //   return await getTronGas({ ...params, fromAddress: tronAddress })
        // case Web3Type.SUI: {
        //   const suiGas = await getSuiSendGas({
        //     ...params,
        //     fromAddress: suiAddress,
        //     coinType: params.token.address,
        //   })
        //   return new BigNumber(suiGas).multipliedBy(gasMagnification).toFixed()
        // }

        // case Web3Type.COSMOS: {
        //   return getCosmosEstimateGasFee()
        // }
        case Web3Type.TONTEST:
        case Web3Type.TON: {
          if (params.token?.address) {
            return avgTonJettonTransferFee
          } else {
            return avgTonNativeTransferFee
          }
        }
        // case Web3Type.DOGE: {
        //   const dogeGas = await getDogeFeeByBlock()
        //   return new BigNumber(dogeGas).toFixed()
        // }
        default:
      }
    },
  })
  const data = useMemo(() => {
    return {
      gasFee: gasFee.data || '0',
      gasFeeUsd: new BigNumber(gasFee?.data || '0')
        .multipliedBy(new BigNumber(nativeToken?.price || '0'))
        .toString(),
    }
  }, [nativeToken, gasFee.data])

  const solPriorityFee = priorityFee.data?.fee

  const solPriorityFees = priorityFee.data?.fees

  return {
    ...data,
    isLoading: gasFee.isLoading,
    solPriorityFee: solPriorityFee,
    nativeTokenPrice: nativeToken?.price,
    solPriorityFees,
    isFetching: gasFee.isFetching,
    priorityFeeLoading: priorityFee.isLoading,
  }
}

export default useEstimatedGas
