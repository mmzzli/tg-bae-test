import { formatUnits } from 'viem'
import {
  createSigningTransaction,
  getTonWebAsync,
  mockTonChainId,
  sendMessageFee,
  sendTransaction,
  TonSendTransactionParams,
  TonSigningTransactionType,
} from '@/store/wallet/config/ton'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { Aggregator, IHistoryType } from '@/store/wallet/type'
import { useToast } from '@chakra-ui/react'
import { useMfa } from '../Account/hooks/useMfa'
import useTransactions from '@/store/wallet/hooks/useTransactions'
import useTonTransactions from './useTonTransactions'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { tonSignMessage, v1AddAssetApi } from '@/api/wallet'
import { allChains } from '@/store/wallet/chains'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useStore } from '@/store'

type ITonSigningType = {
  token: AssetsToken | undefined
} & TonSigningTransactionType

export interface TonTransactionType {
  fromAddress: string | undefined
  toAddress: string
  targetAddress?: string
  fromValue: bigint | undefined //1e9   decimal: 9
  toValue?: bigint | undefined //1e9   decimal: 9
  fromToken?: AssetsToken | undefined
  toToken?: AssetsToken | undefined
  historyType?: 'Send' | 'Swap' | 'Approve' | 'Gift'
  type?: 'OKX' | 'Rango' | 'Ston.fi' | undefined | 'Jupiter'
  routeInfo?: {
    swapperTitle: string
    swapperLogo: string
    aggregatorType: Aggregator | undefined
  }
}

const useTonTransaction = (transInfo: ITonSigningType) => {
  const { getMfaParams } = useMfa()
  const { addTx: setTransactionHistory } = useTransactions()
  const chainId = mockTonChainId
  // const { tonPublicKey } = useLoginInfo()
  const { waitForTonTransactionSuccess } = useTonTransactions()
  const toast = useToast()
  const refreshTokenStore = useStore((state) => state.refreshTokenStore)

  const handleTransferMessage = async (data?: TonSendTransactionParams) => {
    try {
      let singingMessage
      if (data?.data) {
        // if (!tonPublicKey) return
        const buffer = (await getTonWebAsync()).utils.base64ToBytes(data.data)
        const memo = (await getTonWebAsync()).boc.Cell.oneFromBoc(buffer)
        singingMessage = await createSigningTransaction({
          ...transInfo,
          // @ts-ignore
          memo: memo,
          toAddress: data.to,
          amount: formatUnits(BigInt(data.value), data.decimals),
        })
      } else {
        // @ts-ignore
        singingMessage = await createSigningTransaction({
          ...data,
          amount: formatUnits(BigInt(data?.value || 0), data?.decimals || 9),
        })
      }

      if (!singingMessage?.signingMessageBoc) return { success: false, data: '' }

      const mfaParams = {
        signingMessageBoc: singingMessage.signingMessageBoc,
        stateInitBoc: singingMessage?.stateInitBoc || '',
      }

      const mfaRes = await getMfaParams({
        content: mfaParams,
        chainid: chainId,
      })

      const { mfa } = mfaRes
      // console.log('mfa', mfa)

      if (!mfa) {
        return { success: false, data: 'cancelled' }
      }
      setPassKey(mfa)
      console.log({
        key: 'tonSignMessage',
        mfa,
        mfaParams,
      })
      const { result, code, message } = await tonSignMessage(mfa, mfaParams)
      // console.log('mfa', result, code, message);
      if (code != 10000) throw new Error(message)

      return { success: true, data: result as string }
    } catch (error: any) {
      // toast.error(error.message ? error.message : error.name)
      return {
        success: false,
        data: error.message ? error.message : error?.name || error,
      }
    }
  }

  const handleTransferFee = async (fromAddress: string, signedTransaction: string) => {
    const result = await sendMessageFee(fromAddress, signedTransaction)
    // {@extra: "1723608477.1462789:0:0.6971379973574183", @type: "query.fees", destination_fees: [], source_fees: {@type: "fees",fwd_fee: 0,gas_fee: 0,in_fwd_fee: 1006800,storage_fee:618}}
    const storage_fees = result?.source_fees?.storage_fee || 0
    const in_fwd_fees = result?.source_fees?.in_fwd_fee || 0
    const gas_fee = result?.source_fees?.gas_fee || 0
    const fwd_fee = result?.source_fees?.fwd_fee || 0

    const transaction_fee = storage_fees + in_fwd_fees + gas_fee + fwd_fee
    return {
      fee: `${transaction_fee}`,
      formatted: (await getTonWebAsync()).utils.fromNano(`${transaction_fee}`),
    }
  }

  const handleTransferSend = async (
    signedTransaction: string,
    transaction?: TonTransactionType
  ) => {
    try {
      const tranRes = await sendTransaction(signedTransaction)
      if (tranRes && tranRes['@type'] == 'ok') {
        const chain = allChains.find((chain) => chain.type === 'TON')
        const success = await waitForTonTransactionSuccess({
          address: transInfo.fromAddress,
          msgHash: tranRes.msgHash,
        })
        // console.log('chainchainchain', chain, chains)
        const historySave: IHistoryType = {
          fromAddress: transaction?.fromAddress,
          toAddress: transaction?.toAddress,
          fromAmount: transaction
            ? transaction.fromValue?.toString()
            : `${Number(transInfo?.amount) * 1e9}`,
          toAmount: transaction
            ? (transaction.toValue?.toString() ?? (transaction.fromValue?.toString() || '0'))
            : `${Number(transInfo?.amount) * 1e9}`,
          fromSwapTokens: {
            // @ts-ignore
            token: transaction
              ? transaction.fromToken
              : {
                  ...transInfo.token,
                  balance: transInfo.token?.balance?.toString() || '0',
                  balanceItem: undefined,
                },
            chain: chain,
            balance: undefined,
          },
          toSwapTokens: {
            // @ts-ignore
            token: transaction
              ? transaction.toToken
              : {
                  ...transInfo.token,
                  balance: transInfo.token?.balance?.toString() || '0',
                  balanceItem: undefined,
                },
            chain: chain,
            balance: undefined,
          },
          nonce: Number(transInfo.memo),
          time: new Date().getTime(),
          hash: tranRes.msgHash,
          historyType: transaction?.historyType ? transaction.historyType : 'Send',
          chain: chain,
          type: transaction?.type,
          status: success ? 'success' : 'pending',
          routeInfo: transaction?.routeInfo,
        }

        if (typeof chainId === 'number') {
          setTransactionHistory({
            history: historySave,
            chainId,
          })
        }
        const hash = tranRes.msgHash
        if (hash) {
          const chainId = mockTonChainId
          const token = historySave.toSwapTokens?.token
          if (token && token?.address && chainId) {
            await v1AddAssetApi({
              chain_id: chainId,
              decimals: token.decimals,
              image: token.image,
              name: token.symbol,
              symbol: token.symbol,
              token: token.address,
            })
            refreshTokenStore()
          }
        }
        return { result: tranRes }
      }
    } catch (error: any) {
      console.warn({
        error,
      })
      toast({
        render: () => {
          return (
            <CustomToast title={error.message ? error.message : error} type={typeOptions.error} />
          )
        },
        position: 'bottom',
        duration: 2000,
      })
    }
  }

  return {
    handleTransferMessage,
    handleTransferFee,
    handleTransferSend,
  }
}

export default useTonTransaction
