// import { FeeMode } from '@/components/FeeSelect'
// import { getCosmosEstimateGasFee } from '@/config/cosmos'
// import { getSuiSendGas } from '@/config/sui'
// import { getDogeFeeByBlock } from '@/config/doge'
// import { DexTransaction } from '@/constants/types'
// import useLoginInfo from '@/hooks/useLoginInfo'
// import chains from '@/proviers/web3Provider/chains'
// import { Web3Type } from '@/proviers/web3Provider/type'
// import tokenStore from '@/stores/tokenStore'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { WalletType } from '@/stores/tokenStore/type/BTCToken'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import { getBitCoinTypeBySend } from '@/utils'
// import getBtcGas from '@/utils/estimateGas/getBtcGas'
// import getEvmGas from '@/utils/estimateGas/getEvmGas'
// import getTronGas from '@/utils/estimateGas/getTronGas'
// import { getSendEvmGas } from '@/utils/sendTransaction/sendEvm'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { formatUnits, parseUnits } from 'viem'
// import { getChainGasInfoByFeeMode } from '@/hooks/api/chain'
// import { getSolGasParams } from '@/hooks/useSendTransaction'
import { useUserStore } from '@/store/wallet/walletUser'
import { useTokenStore } from '@/store/wallet/walletToken'
import { Web3Type } from '@/store/wallet/chainType'
import chains from '@/store/wallet/chains'
import { DexTransaction } from '@/store/wallet/type'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { FeeMode } from '../../components/FeeSelect'

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
  gasMagnification = 1,
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
  const { walletUserInfo } = useUserStore()
  const { tokenList } = useTokenStore()
  // const { feeMode } = useCommonStore()
  // const { tronAddress, btcAddress, suiAddress, evmAddress, solAddress } = useLoginInfo()
  const evmAddress = walletUserInfo.ethereumAddress
  const solAddress = walletUserInfo.solanaAddress

  const nativeToken = useMemo(
    () => tokenList.find((token) => token.isNative && token.chainId === chainId),
    [chainId]
  )

  const chain = getChainByChainId(chainId)

  const fees = useQuery({
    queryKey: [
      'queryEstimatedGasByApi',
      params?.amount,
      params?.token?.address,
      params?.token?.symbol,
      chainId,
    ],
    queryFn: async () => {
      switch (chain?.type) {
        // case Web3Type.EVM: {
        //   return await (async () => {
        //     if (evmParams) {
        //       const gasFeeRes = await getChainGasInfoByFeeMode({
        //         chainId: chain.id,
        //         callData: evmParams.data || '0x',
        //         params: {
        //           from: evmAddress,
        //           to: evmParams.toAddress,
        //           value: evmParams.value?.toString() || '0',
        //         },
        //         feeMode: feeModeParams,
        //       })

        //       return gasFeeRes
        //     }
        //   })()
        // }
        // case Web3Type.SOL: {
        //   const value = parseUnits(params.inputAmount || '0', params.token.decimals)

        //   return getSolGasParams({
        //     solAddress: solAddress,
        //     toAddress: params.toAddress,
        //     value: value,
        //     contract: params.token.address,
        //     feeMode: feeModeParams,
        //   })
        // }
        default:
      }
    },
  })

  const gasFee = useQuery({
    queryKey: [
      'queryEstimatedGas',
      params?.amount,
      params?.token?.address,
      params?.token?.symbol,
      chainId,
    ],
    queryFn: async () => {
      switch (chain?.type) {
        // case Web3Type.BTC: {
        //   const btcGas = await getBtcGas({
        //     ...params,
        //     fromAddress: btcAddress[`${params.walletBtcType}Address`],
        //     addressType: getBitCoinTypeBySend(params.walletBtcType as WalletType),
        //     publicKey: getbtcPubKeysByType(
        //       getBitCoinTypeBySend(params.walletBtcType as WalletType)
        //     ),
        //   })

        //   return new BigNumber(btcGas).multipliedBy(gasMagnification).toString()
        // }

        // case Web3Type.EVM: {
        //   return await (async () => {
        //     if (evmParams) {
        //       const gasFee = await (async () => {
        //         try {
        //           const evmGasFeeV2 = await getSendEvmGas({
        //             params: evmParams,
        //             type: 'Send',
        //             evmAddress,
        //             feeMode: feeModeParams,
        //           })
        //           const chain = getChainByChainId(chainId)
        //           if (!evmGasFeeV2?.feeModeGas) {
        //             throw new Error('sendData is null')
        //           }
        //           const evmGasFeeV2Format = formatUnits(
        //             BigInt(evmGasFeeV2?.feeModeGas.toString()) || 0n,
        //             chain?.chain?.nativeCurrency.decimals || 18
        //           )
        //           return evmGasFeeV2Format
        //         } catch (error) {
        //           console.log('evmGasFeeV2', error)
        //           const evmGasFee = await getEvmGas({
        //             fromAddress: evmAddress,
        //             toAddress: params.toAddress,
        //             token: params.token,
        //             chainId,
        //             data: params.data,
        //           })
        //           return evmGasFee
        //         }
        //       })()
        //       return gasMagnMode ? new BigNumber(gasFee).toFixed() : new BigNumber(gasFee).toFixed()
        //     }
        //   })()
        // }

        // case Web3Type.SOL: {
        //   const totalFee = '5000'
        //   //sol can only estimated baseFee
        //   return formatUnits(
        //     BigInt(totalFee || '0') * 10n,
        //     chains.solana.chain?.nativeCurrency.decimals
        //   )
        // }
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

  const { isLoading, isFetching } = useMemo(() => {
    switch (chain?.type) {
      case Web3Type.EVM:
      case Web3Type.SOL:
        return fees.isFetched && !!fees.data ? fees : gasFee
      default:
        return gasFee
    }
  }, [chain?.type, fees, gasFee])

  const feeValue = useMemo(() => {
    if (!isLoading && !isFetching) {
      if (fees.data && fees.isFetched) {
        const value =
          typeof nativeToken?.decimals === 'number' &&
          formatUnits(BigInt(fees.data?.fee?.fee || '0'), nativeToken?.decimals)
        if (value) return value
      }
      if (gasFee?.data) return gasFee?.data.toString()
    }
    return '0'
  }, [fees.data, fees.isFetched, gasFee?.data, isFetching, isLoading, nativeToken?.decimals])

  const data = useMemo(() => {
    return {
      gasFee: feeValue || '0',
      gasFeeUsd: new BigNumber(feeValue || '0')
        .multipliedBy(new BigNumber(nativeToken?.price || '0'))
        .toString(),
    }
  }, [feeValue, nativeToken?.price])

  const solPriorityFee =
    typeof nativeToken?.decimals === 'number' &&
    formatUnits(BigInt(fees.data?.fee.priorityFee || '0'), nativeToken?.decimals)

  const solPriorityFees = useMemo(() => {
    if (fees.data?.fees && chain?.id === chains.solana.id) {
      const feesResult: { [k in FeeMode]?: string } = {}
      Object.entries(fees.data?.fees).map(([k, item]) => {
        const key = k as FeeMode
        feesResult[key] = item.priorityFee
      })
      return feesResult
    }
  }, [chain?.id, fees.data?.fees])

  return {
    ...data,
    isLoading: isLoading,
    fees: fees.data?.fees,
    feesQuery: fees,
    solPriorityFee: solPriorityFee,
    nativeTokenPrice: nativeToken?.price,
    solPriorityFees,
    isFetching,
    priorityFeeLoading: fees.isLoading,
  }
}

export default useEstimatedGas
