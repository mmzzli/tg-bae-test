import { useCallback } from 'react'
import { getSendSplToken, mockSolEvmChainId, sendSolTx } from '@/store/wallet/config/sol'
import { useMfa } from '../../Account/hooks/useMfa'
import { setPassKey } from '@/components/tmd/utils/crypto'
import { solSignMessageWithMFA, solSignRawTransaction } from '@/api/wallet'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { Buffer } from 'buffer'

export function useSolanaTx() {
  const chainId = mockSolEvmChainId
  const { getMfaParams } = useMfa()

  const signSolRawTx = useCallback(
    async (txHex: string) => {
      try {
        const txStr = txHex

        const mfaRes = await getMfaParams({
          content: txStr,
          chainid: mockSolEvmChainId,
        })

        if (mfaRes.mfa) {
          setPassKey(mfaRes.mfa)

          const signRes = await solSignRawTransaction({
            rawTransaction: txStr ?? '',
          })

          return signRes
        }
      } catch (error) {
        console.error({
          error,
        })
      }
    },
    [getMfaParams]
  )

  const sendSolTransactionLegacy = useCallback(
    async (params: {
      fromAddress: string | undefined
      toAddress: string
      value: bigint | undefined //1e9   decimal: 9
      contract?: string
      token?: AssetsToken | undefined
    }) => {
      try {
        if (params.value && params.fromAddress) {
          let txStr: string
          if (!params.contract) {
            txStr =
              (
                await sendSolTx(
                  params.fromAddress, // my Address
                  params.toAddress, // toAddress
                  params.value || 0n //value
                )
              )?.transaction || ''
          } else {
            txStr =
              (
                await getSendSplToken(
                  params.contract,
                  params.fromAddress,
                  params.toAddress,
                  BigInt(params.value)
                )
              )?.transaction || ''
          }

          const mfaRes = await getMfaParams({
            content: txStr,
            chainid: chainId,
          })

          if (mfaRes.mfa) {
            setPassKey(mfaRes.mfa)

            const signRes = await solSignRawTransaction({
              rawTransaction: txStr ?? '',
            })

            return signRes
          }
        }
      } catch (error) {
        console.error({
          error,
        })
      }
    },
    [chainId, getMfaParams]
  )
  const signSolMessage = async (params: { message: string; walletId: number }) => {
    const mfaRes = await getMfaParams({
      content: params,
      chainid: chainId || 501,
    })

    if (mfaRes.mfa) {
      setPassKey(mfaRes.mfa)

      const signRes = await solSignMessageWithMFA(params)

      return signRes
    }
  }

  return {
    signSolRawTx,
    sendSolTransactionLegacy,
    signSolMessage,
  }
}
