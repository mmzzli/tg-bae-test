import { TonTxRequestStandard } from '@/store/wallet/util/tgSdkJavascript/ton/types'
import { useMfa } from '../../Account/hooks/useMfa'
import { createSigningTransactionPure, mockTonChainId } from '@/store/wallet/config/ton'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { tonSignMessage } from '@/api/wallet'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'

export function useTonTx({ chainId }: { chainId?: number | undefined }) {
  const { getMfaParams } = useMfa()
  const toast = useToast()

  const signTonTransaction = async ({
    paramsForPure,
  }: {
    paramsForPure?: TonTxRequestStandard
  }) => {
    try {
      let singingMessage: Awaited<ReturnType<typeof createSigningTransactionPure>>
      if (paramsForPure)
        singingMessage = await createSigningTransactionPure(paramsForPure, undefined)
      else throw 'sign ton tx by json payload is deprecated'
      if (!singingMessage?.signingMessageBoc) return

      const mfaRes = await getMfaParams({
        content: singingMessage,
        chainid: chainId || mockTonChainId,
      })

      const { mfa } = mfaRes
      if (!mfa) return

      setPassKey(mfa)

      const mfaParams = {
        signingMessageBoc: singingMessage.signingMessageBoc,
        stateInitBoc: singingMessage?.stateInitBoc || '',
        isTestnet: false, //chainId === mockTonTestnetChainId,
      }

      const { result: signedTransaction, code, message } = await tonSignMessage(mfa, mfaParams)

      if (+code !== 10000) throw new Error(message)

      return {
        signedTransaction,
        code,
        message,
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
  return {
    signTonTransaction,
  }
}
