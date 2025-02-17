// import { TStatusButton as StatusButton } from '@/components/tmd'
// import useBiometricManager from '@/hooks/useBiometricManager'
// import TxSuccess from '@/assets/imgs/tx-success.svg?react'
// import { useLoading } from '@/hooks/useLoading'
// import { isSendBioAuthAtom, sendStatusAtom } from '@/state'
// import { useAtom, useAtomValue } from 'jotai'
// import { useEffect, useState } from 'react'
// import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
// import { IWeb3ChainType, Web3Type } from '@/proviers/web3Provider/type'
// import { tonSendTransactionDataAtom } from '@/state/tonconnect'
// // import { getPageChainId } from '@/proviers/web3Provider/chainUtils'
// import useSendTransaction, {
//   useReadyBtcTransaction
// } from '@/hooks/useSendTransaction'
// import { errorContents } from '@/config/const'
// import {
//   TON_EVENT_SEND_FAILED,
//   TON_EVENT_SEND_SUCCESS,
//   TonEvent
// } from '@/utils/tonConnect/config'
// import { useNavigate } from 'react-router-dom'
// import { Toast } from 'antd-mobile'
// import { useNewSendTransaction } from '@/hooks/useNewSendTransaction'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { DexTransaction } from '@/constants/types'
// import useUserStore from '@/stores/userStore/hooks/useUserStore'
// import { TToast } from '@/components/tmd'
// import { getFastConnection } from '@/config/sol'
// import doge from '@/proviers/web3Provider/chains/wagmiConfig/doge'
// import isError from '@/utils/sentry/logger/isError'
// import { getErrorContext } from '@/utils/error'
// import { loggerT } from '@/utils/sentry/logger'
// import { t } from 'i18next'
// import { UseQueryResult } from '@tanstack/react-query'
// import { ChainGasFeesType } from '@/hooks/api/chain'

import { IWeb3ChainType, Web3Type } from '@/store/wallet/chainType'
import { useLoading } from '@/store/wallet/hooks/useLoading'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { ChainGasFeesType, DexTransaction } from '@/store/wallet/type'
import { UseQueryResult } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'
// import { tonSendTransactionDataAtom } from '@/store/wallet/util/tonconnect'
import { IconTxSuccess } from '@/components/tmd/icons/txSuccess'
import { errorContents } from '@/config/wallet/const'
import { getErrorContext } from '@/config/wallet/error'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import BaseButton from '@/components/BaseButton/BaseButton'
import { useNewSendTransaction } from '../../hooks/useNewSendTransaction'
import { getFastConnection } from '@/store/wallet/config/sol'
import useSendTransaction from '../../hooks/useSendTransaction'

interface ConfirmSendBtnType {
  toAddress: string
  amount: string
  walletBtcType: string
  fromAddress: string
  curChainId: string
  chain: IWeb3ChainType
  tonTransData: any
  tonTestTransData: any
  token: AssetsToken
  gasGWei: string
  btcPsbtData: any
  feesQuery?: UseQueryResult<
    | {
        fees: {
          Instant: ChainGasFeesType
          Average: ChainGasFeesType
          Fast: ChainGasFeesType
        }
        fee: ChainGasFeesType
      }
    | undefined,
    Error
  >
  isLoading?: boolean
  gasFee?: string
}
export const getEVMDexTransaction = ({
  fromAddress,
  toAddress,
  amount,
  token,
}: {
  fromAddress: string
  toAddress: string
  amount: string
  token: AssetsToken
}) => {
  const params: DexTransaction = {
    approveData: undefined,
    approveTo: undefined,
    data: '',
    fromAddress,
    fromToken: {
      ...token,
      logoURI: token.image,
    },
    toAddress,
    targetAddress: toAddress,
    toToken: {
      ...token,
      logoURI: token.image,
    },
    params: {
      routeInfo: {
        originRoute: [
          {
            fromTokenAmount: parseUnits(amount, token.decimals).toString(),
            toTokenAmount: parseUnits(amount, token.decimals).toString(),
          },
        ],
      },
    },
    value: parseUnits(amount || '0', token.decimals).toString(),
  }

  return params
}
export const sendEvmParams = ({
  amount,
  token,
  toAddress,
  fromAddress,
}: {
  amount: string
  token: AssetsToken
  toAddress: string
  fromAddress: string
}) => {
  const params = getEVMDexTransaction({
    fromAddress,
    toAddress,
    amount,
    token,
  })
  let data = ''
  if (params.fromToken.isNative) {
    params.value = parseUnits(amount || '0', token.decimals).toString()
  } else {
    data = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [toAddress as `0x${string}`, parseUnits(amount, token?.decimals ?? 18)],
    })
    params.value = '0'
    params.toAddress = params.fromToken.address
  }
  params.data = data

  return params
}

function ConfirmSendBtn({
  toAddress,
  amount,
  token,
  walletBtcType,
  fromAddress,
  curChainId,
  chain,
  tonTransData,
  tonTestTransData,
  btcPsbtData,
  isLoading,
  gasFee,
  feesQuery,
  // refetch
}: ConfirmSendBtnType) {
  const [, sendLoadingFn] = useLoading()
  // const tonSendTxData = useAtomValue(tonSendTransactionDataAtom)
  const navigate = useNavigate()

  const { sendSolTransaction } = useSendTransaction({
    chainId: chain?.chain?.id,
  })

  const { sendTransaction } = useNewSendTransaction('Send')
  const toast = useToast()
  const [status, setStatus] = useState('confirm')
  useEffect(() => {
    getFastConnection()
    return () => {
      setStatus('confirm')
    }
  }, [])

  const onSign = async () => {
    setStatus('loading')
    sendLoadingFn(async () => {
      try {
        const params: DexTransaction = {
          approveData: undefined,
          approveTo: undefined,
          data: '',
          fromAddress,
          fromToken: {
            ...token,
            logoURI: token.image,
          },
          toAddress,
          targetAddress: toAddress,
          toToken: {
            ...token,
            logoURI: token.image,
          },
          params: {
            routeInfo: {
              originRoute: [
                {
                  fromTokenAmount: parseUnits(amount, token.decimals).toString(),
                  toTokenAmount: parseUnits(amount, token.decimals).toString(),
                },
              ],
            },
          },
          value: parseUnits(amount || '0', token.decimals).toString(),
          gasFee,
        }

        const sendToken = async () => {
          switch (chain?.type) {
            case Web3Type.EVM: {
              let data = ''
              if (params.fromToken.isNative) {
                params.value = parseUnits(amount || '0', token.decimals).toString()
              } else {
                data = encodeFunctionData({
                  abi: erc20Abi,
                  functionName: 'transfer',
                  args: [toAddress as `0x${string}`, parseUnits(amount, token?.decimals ?? 18)],
                })
                params.value = '0'
                params.toAddress = params.fromToken.address
              }
              params.data = data
              return await sendTransaction({ params })
            }
            case Web3Type.SOL:
              return sendSolTransaction({
                fromAddress,
                toAddress,
                value: parseUnits(amount, token?.decimals || 9),
                contract: token?.address,
                token,
              })
            // case Web3Type.BTC:
            //   return (
            //     walletBtcType &&
            //     sendBtcTransaction({
            //       network: import.meta.env.VITE_TOMO_BTC_NETWORK,
            //       addressType: walletBtcType,
            //       // txStr: readyBtcTransaction.data,
            //       txStr: btcPsbtData.psbt.toHex(),
            //       value: parseUnits(amount, 8).toString(),
            //       token,
            //       fromAddress,
            //       toAddress,
            //     })
            //   )
            case Web3Type.TON:
              // eslint-disable-next-line no-case-declarations
              const tonParams = {
                ...params,
                ...tonTransData,
              }

              return await sendTransaction({ params: tonParams })
            // case Web3Type.TONTEST:
            //   // eslint-disable-next-line no-case-declarations
            //   const tonTestParams = {
            //     ...params,
            //     ...tonTestTransData,
            //   }

            //   return await sendTransaction({ params: tonTestParams })
            // case Web3Type.TRON:
            //   params.value = parseUnits(amount || '0', token?.decimals || 6).toString()
            //   return await sendTransaction({ params: params })
            // case Web3Type.SUI:
            //   return await sendTransaction({ params: params })
            // case Web3Type.COSMOS:
            //   return await sendTransaction({ params: params })
            // case Web3Type.DOGE:
            //   params.gasPrice = gasFee * 10 ** (doge.chain?.nativeCurrency.decimals ?? 8) + ''
            //   return await sendTransaction({ params: params })
          }
        }

        const hash = await sendToken()

        if (hash) {
          setStatus('success')
          // if (tonSendTxData) {
          //   // TonEvent.emit(TON_EVENT_SEND_SUCCESS, { boc: data.signature })
          // } else {
          // refetch()
          setTimeout(() => {
            // refetch()
            const urlParams = {
              to: toAddress,
              amount,
              symbol: token.symbol,
              chain_type: chain.type || '',
              hash,
            }
            const urlString = new URLSearchParams(urlParams).toString()
            navigate(`/wallet/send/result?${urlString}`)

            // onClose && onClose()
          }, 2000)
          // }
        } else {
          // if (tonSendTxData) TonEvent.emit(TON_EVENT_SEND_FAILED)
        }
      } catch (error: any) {
        // if (tonSendTxData) {
        // TonEvent.emit(TON_EVENT_SEND_FAILED)
        // }
        setStatus('confirm')
        console.warn({
          error,
        })

        let errorMsg = ''
        if (typeof error === 'string') {
          // if (error.includes('Pay PIN verification canceled')) {
          //   return
          // }
          if (error.includes('insufficient funds')) {
            errorMsg = errorContents.noEnoughGas
          } else if (error.includes('Failed to fetch')) {
            errorMsg = errorContents.networkError
          } else if (error.includes('Cannot transfer TRX to the same account')) {
            errorMsg = error
          } else {
            errorMsg = getErrorContext(error)
          }
        } else {
          if ((error?.message || '').include('cancelled')) return
          errorMsg = errorContents.rpcError
        }

        toast({
          render: () => {
            return <CustomToast title={errorMsg} type={typeOptions.error} />
          },
          position: 'bottom',
          duration: 2000,
        })

        // todo ...
        // if (isError(error)) {
        //   const extra = {
        //     type: 'Send',
        //     params: {
        //       fromAddress,
        //       toAddress,
        //       amount,
        //       token,
        //     },
        //     error: JSON.stringify(error),
        //   }
        //   loggerT.fatal('Send', 'send token err', error, { extra })
        // }
      } finally {
        // Toast.clear()
      }
    })
  }

  const isSlideDisable = () => {
    if (isLoading) {
      return true
    }
    if (chain?.type === Web3Type.BTC) {
      return !btcPsbtData
    }
    return false
  }

  return (
    <>
      <div className={`mt-auto w-full`}>
        {/* <StatusButton
            type={status}
            text={'Slide to Confirm'}
            onConfirm={onSign}
            disabled={isSlideDisable()}
          /> */}
        {status !== 'success' ? (
          <BaseButton
            text={'Confirm'}
            handler={onSign}
            disabled={isSlideDisable()}
            height="52px"
            loading={status == 'loading'}
          />
        ) : (
          <IconTxSuccess
            className="h-[52px]"
            style={{
              width: '100%',
            }}
          />
        )}
      </div>
    </>
  )
}

export default ConfirmSendBtn
