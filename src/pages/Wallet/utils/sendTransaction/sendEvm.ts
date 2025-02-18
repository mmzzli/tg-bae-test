import { DexTransaction } from '@/store/wallet/type'
import { FeeMode, getEvmFeeConfig } from '../../components/FeeSelect'
import { IChainId } from '@/store/wallet/chainType'
import { Hex } from 'viem'
import chains, { evmChainsConfig } from '@/store/wallet/chains'
import {
  estimateFeesPerGas,
  getBlock,
  getGasPrice,
  getTransactionCount,
  prepareTransactionRequest,
} from '@wagmi/core'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { GetMfaParamsType } from '../../hooks/useNewSendTransaction'
import saveHistory, { SetTransactionHistoryType } from './saveHistory'
import covertToAssetsToken from '../covertToAssetsToken'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { sendRawTransactionApi } from '@/store/wallet/config/evm'
import { v1AddAssetApi } from '@/api/wallet'
import { useTokenStore } from '@/store/wallet/walletToken'
import { useStore } from '@/store'

export const minPriorityFeePerGas = 200000n

export const getSendEvmGas = async ({
  params,
  type,
  evmAddress,
  feeMode,
}: {
  params: DexTransaction
  type: 'Swap' | 'Send' | undefined
  evmAddress: string
  feeMode: FeeMode
}) => {
  const { fromToken, toToken, gasPrice } = params
  const data = params.data || '0x'

  const chainId = fromToken.chainId as IChainId
  if (!chainId) return

  const config = evmChainsConfig()

  // pendingNonce
  const pendingNonce = await getTransactionCount(config, {
    address: evmAddress as Hex,
    chainId: params.fromToken.chainId,
    blockTag: 'pending',
  })

  const latestNonce = await getTransactionCount(config, {
    address: evmAddress as Hex,
    chainId: params.fromToken.chainId,
    blockTag: 'latest',
  })

  const gasPrice_chain = await getGasPrice(config, {
    chainId: chainId,
  })
  const blockInfo = await getBlock(config, {
    chainId: chainId,
  })

  const { maxPriorityFeePerGas } = await estimateFeesPerGas(config, {
    chainId: chainId,
  })

  const checkGasPrice = BigInt(gasPrice ?? '0') > gasPrice_chain

  const sendGasPrice = checkGasPrice
    ? (gasPrice ?? gasPrice_chain.toString())
    : gasPrice_chain.toString()

  // TODO When an error occurs due to insufficient balance during a swap, calculate the estimated gas using the params.
  // The params include maxGas and gasPrice.
  // TODO When sending a transaction and an error occurs due to insufficient balance, prevent the user's EVM transaction if gas cannot be obtained.
  const res = await prepareTransactionRequest(
    config,
    (() => {
      try {
        const result = (() => {
          const result = {
            chainId: chainId,
            account: params.fromAddress as `0x${string}`,
            to: params.toAddress as `0x${string}`,
            value: BigInt(Number(params.value) || '0'),
            data,
          }

          // if (chainId === chains.scroll.id) {
          //   if (type === 'Swap') {
          //     return {
          //       ...result,
          //       gasPrice: BigInt(
          //         (Number(sendGasPrice) * (latestNonce === pendingNonce ? 1.15 : 2)).toFixed(0)
          //       ),
          //       gas: params.maxGas ? BigInt(params.maxGas) * 2n : undefined,
          //     }
          //   }

          //   return {
          //     ...result,
          //     maxFeePerGas: (blockInfo.baseFeePerGas || gasPrice_chain) * 3n + maxPriorityFeePerGas,
          //     maxPriorityFeePerGas: maxPriorityFeePerGas,
          //   }
          // }

          // if (chainId === chains.arbitrum.id && type === 'Swap') {
          //   result.gas = params.maxGas ? BigInt(params.maxGas) : undefined
          //   // result.gas = params.maxGas ? params.maxGas : blockInfo.gasLimit
          // }

          // if (chainId === chains.bsc.id && type === 'Swap') {
          //   result.gas = params.maxGas ? BigInt(params.maxGas) : undefined
          //   // result.gas = params.maxGas ? params.maxGas : undefined
          //   // result.gas = params.maxGas
          // }

          if (
            typeof params.maxFeePerGas === 'number' &&
            params.maxFeePerGas &&
            typeof params.maxPriorityFeePerGas === 'string' &&
            params.maxPriorityFeePerGas &&
            typeof params.maxGas === 'string' &&
            params.maxGas
          ) {
            return {
              ...result,
              maxPriorityFeePerGas: BigInt(params.maxPriorityFeePerGas),
              maxFeePerGas: BigInt(params.maxFeePerGas),
              gas: BigInt(params.maxGas),
            }
          } else if (
            typeof params.gasPrice === 'string' &&
            params.gasPrice &&
            typeof params.maxGas === 'string' &&
            params.maxGas
          ) {
            return {
              ...result,
              gasPrice: BigInt(params.gasPrice),
              gas: BigInt(params.maxGas),
              // gas: BigInt(110000)
            }
          }
          return result
        })()

        return result
      } catch (error) {
        console.warn('gasFee', error)
        throw error
      }
    })()
  )

  const nonce = (() => {
    if (latestNonce === pendingNonce) {
      return res.nonce
    }
    return latestNonce
  })()

  res.nonce = nonce

  const evmFeeConfig = getEvmFeeConfig({
    chain: getChainByChainId(chainId),
    type: type,
  })

  if (res) {
    const result = (() => {
      const chainSpecificMethod = (result: typeof res) => {
        // if (chainId === chains.arbitrum.id && type === 'Swap') {
        //   result.gas = result.gas * 4n
        //   if (result.maxFeePerGas >= 0n) {
        //     // result.maxFeePerGas = result.maxFeePerGas * 2n
        //   }
        // }

        // if (chainId === chains.linea.id && type === 'Swap') {
        //   result.maxPriorityFeePerGas = result.maxFeePerGas
        // }

        return result
      }

      const sendData = (() => {
        if (res.type === 'eip1559') {
          const priorityFeePerGas =
            res.maxPriorityFeePerGas < minPriorityFeePerGas || !res.maxPriorityFeePerGas
              ? minPriorityFeePerGas
              : maxPriorityFeePerGas

          const maxFeePerGas =
            res.maxFeePerGas && res.maxFeePerGas > 0n
              ? res.maxFeePerGas
              : Number(sendGasPrice) && sendGasPrice
                ? sendGasPrice
                : priorityFeePerGas

          const feeModeResults: {
            [key in FeeMode]: typeof res | undefined
          } = {
            [FeeMode.FAST]: undefined,
            [FeeMode.SLOW]: undefined,
            [FeeMode.AVERAGE]: undefined,
          }

          // if (!evmFeeConfig && chainId !== chains.ethereum.id) {
          //   return undefined
          // }
          Object.entries(evmFeeConfig).map(([key, value]) => {
            const feeMode = key as FeeMode

            const feeModePriorityFeePerGas = BigInt((Number(priorityFeePerGas) * value).toFixed(0))

            feeModeResults[feeMode] = {
              ...res,
              maxPriorityFeePerGas:
                feeModePriorityFeePerGas < minPriorityFeePerGas
                  ? minPriorityFeePerGas
                  : feeModePriorityFeePerGas,
              maxFeePerGas: BigInt((Number(maxFeePerGas) * value).toFixed(0)),
            }
          })

          const feeModeResult = feeModeResults[feeMode]

          // Total Fee = Gas Limit x min(Base Fee + Max Priority Fee, Max Fee Per Gas)

          return feeModeResult && chainSpecificMethod(feeModeResult)
        } else {
          const gasPrice = res.gasPrice

          const feeModeResults: {
            [key in FeeMode]: typeof res | undefined
          } = {
            [FeeMode.FAST]: undefined,
            [FeeMode.SLOW]: undefined,
            [FeeMode.AVERAGE]: undefined,
          }

          Object.entries(evmFeeConfig).map(([key, value]) => {
            const feeMode = key as FeeMode

            const feeModeGasPrice = BigInt((Number(gasPrice) * value).toFixed(0))

            feeModeResults[feeMode] = {
              ...res,
              // todo... unknow
              // @ts-ignore
              gasPrice: feeModeGasPrice,
            }
          })

          const feeModeResult = feeModeResults[feeMode]

          return feeModeResult && chainSpecificMethod(feeModeResult)
        }
      })()

      const feeModeTotalFee =
        sendData &&
        sendData.gas *
          (sendData?.gasPrice ||
            (sendData.maxFeePerGas || blockInfo.baseFeePerGas || 0n) +
              sendData.maxPriorityFeePerGas)

      return {
        result: sendData,
        feeModeGas: feeModeTotalFee,
      }
    })()

    return result
  }
}

const sendEvm = async (
  params: DexTransaction,
  getMfaParams: GetMfaParamsType,
  type: string,
  setTransactionHistory: SetTransactionHistoryType,
  evmAddress: string,
  feeMode: FeeMode
) => {
  const { fromToken, toToken, gasPrice } = params
  const selectChain = getChainByChainId(covertToAssetsToken(fromToken).chainId)

  try {
    const data = params.data || '0x'
    const chainId = fromToken.chainId as IChainId
    if (!chainId) return

    const sendRes = await getSendEvmGas({
      params,
      // @ts-ignore
      type,
      evmAddress,
      feeMode: feeMode,
    })

    const res = sendRes?.result

    if (res) {
      const mfaParams = (() => {
        const result = {
          value: res.value?.toString() || '',
          from: res.from,
          to: res.to || '',
          nonce: res.nonce,
          // nonce: nonce,
          data: data || '',
          gas: res?.gas?.toString?.() || params.maxGas,
        }
        if (
          typeof res.maxFeePerGas === 'bigint' &&
          typeof res.maxPriorityFeePerGas === 'bigint' &&
          res.maxFeePerGas >= 0n &&
          res.maxPriorityFeePerGas >= 0n
        ) {
          return {
            ...result,
            maxFeePerGas: res.maxFeePerGas.toString(),
            maxPriorityFeePerGas: res.maxPriorityFeePerGas.toString(),
          }
        }
        if (typeof res?.gasPrice === 'bigint' && res.gasPrice >= 0n) {
          return {
            ...result,
            gasPrice: res.gasPrice.toString(),
          }
        }
        // const gasPriceParam =
        //   params.params?.fromChain?.id === chains.scroll.id
        //     ? res?.gasPrice?.toString?.() || '0'
        //     : res?.gasPrice?.toString?.() || '0' || gasPrice
        const gasPriceParam = res?.gasPrice?.toString?.() || '0' || gasPrice

        return {
          gasPrice: gasPriceParam,
          ...result,
        }
      })()

      // return
      const mfaRes = await getMfaParams({
        content: mfaParams,
        chainid: chainId,
      })
      if (mfaRes) {
        const { mfa } = mfaRes
        if (!mfa) {
          return
        }
        setPassKey(mfa)

        const hash = await sendRawTransactionApi({
          mfa,
          // @ts-ignore
          mfaParams,
          chain: selectChain!,
        })
        if (!hash) {
          return
        }
        if (hash) {
          if (typeof chainId === 'number') {
            saveHistory(
              {
                params,
                // @ts-ignore
                type,
                hash,
                nonce: res.nonce,
              },
              setTransactionHistory
            )
          }

          const toChain = getChainByChainId(toToken.chainId)
          if (toToken && toToken?.address && toChain?.chain?.id) {
            try {
              await v1AddAssetApi({
                chain_id: toToken.chainId,
                decimals: toToken.decimals,
                image: toToken.logoURI,
                name: toToken.name,
                symbol: toToken.symbol || '',
                token: toToken.address.toLowerCase(),
              })

              useStore.getState().refreshTokenStore()
            } catch (error) {
              console.warn(error)
            }
          }

          return hash
        }
      }
    } else {
      console.error('prepareTransactionRequest')
    }
  } catch (error: any) {
    console.warn({
      error,
      params,
    })
    // if (error.name === 'EstimateGasExecutionError') {
    //   toast.error(error.details)
    // } else {
    //   toast.error(error.details ? error.details : error)
    // }
    throw error.details ? error.details : error?.message ? error?.message : error
  }
}

export default sendEvm
