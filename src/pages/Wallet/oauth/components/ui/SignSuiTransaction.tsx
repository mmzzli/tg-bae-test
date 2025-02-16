import { useEffect, useMemo, useState } from 'react'
import toast from 'components/Toast'
import useSdk from '@/hooks/oauth/useSdk'
import useApp from '@/hooks/oauth/useApp'
import useSuiTx from '@/hooks/oauth/useSuiTx'
import useLoginInfo from '@/hooks/useLoginInfo'
import sui from '@/proviers/web3Provider/chains/wagmiConfig/sui'
import { Button } from '@/components/tmd/button/Button'
import { useQuery } from '@tanstack/react-query'
import { checkApproveHex } from '@/utils/oauth/helper'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import { TxInfo } from './TxInfo'
import {
  getSuiGasFromTx,
  mockSuiChainId,
  parseSuiTx,
  SendSuiParsedTXParams,
  SendSuiTransactionParams
} from '@/config/sui'
import { getTokenDetailByAddress } from '@/api'
import { getChainByChainId } from '@/stores/walletStore/utils'
import { loggerA } from '@/utils/sentry/logger'
import isError from '@/utils/sentry/logger/isError'

export default function SignSuiTransaction(props: {
  // chainType: 'sol' | 'ton'
  [other: string]: any
}) {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()

  const [fee, setFee] = useState('')
  const [transfer, setTransfer] = useState<
    SendSuiTransactionParams & SendSuiParsedTXParams
  >({
    chainId: mockSuiChainId,
    to: '',
    from: '',
    amount: '',
    value: '',
    transactionBlock: '',
    contractAddr: ''
  })
  const [tokenName, setTokenName] = useState('')
  const { suiAddress } = useLoginInfo()

  const { data: transData, isLoading } = useQuery({
    queryKey: ['sign-transaction'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  useEffect(() => {
    try {
      if ((transData?.data?.params || []).length) {
        const data = transData?.data?.params?.[0]
        parseSuiTx(data?.transactionBlock).then((txObj) => {
          setTransfer({ ...data, ...txObj })
        })
      }
    } catch (error: any) {
      if (isError(error)) {
        loggerA.error('Sign', 'sign sui transaction err', error)
      }
    }
  }, [transData?.data?.params])

  const chainId = useMemo(() => {
    return transfer.chainId || mockSuiChainId
  }, [transfer.chainId])

  const chain = useMemo(() => {
    return getChainByChainId(chainId) as typeof sui
  }, [chainId])

  useEffect(() => {
    const contractAddr = transfer.contractAddr
    if (contractAddr) {
      getTokenDetailByAddress(chain?.name || '', contractAddr).then((res) => {
        setTokenName(res?.symbol)
        setTransfer((preTx) => ({
          ...preTx,
          value: '' + Number.parseInt(preTx.amount + '') / 10 ** res.decimals
        }))
      })
    } else {
      setTokenName('SUI')
    }
  }, [chain, transfer.contractAddr])

  useEffect(() => {
    if (transfer.transactionBlock) {
      getSuiGasFromTx(transfer.transactionBlock)
        .then((res) => {
          if (res) {
            setFee(res)
          }
        })
        .catch((err) => {
          console.error(err)
          if (err.message?.includes('GasBalanceTooLow')) {
            setFee('Out of gas')
          }
        })
    }
  }, [transfer.transactionBlock])

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )
  const { signSuiTransaction } = useSuiTx({ chainId })

  const doSignTx = async () => {
    try {
      setStatus('loading')
      const result = await signSuiTransaction(transfer)

      if (result && result?.code == 10000) {
        setStatus('success')
        setTimeout(() => {
          webApp?.close()
        }, 500)
      } else {
        setStatus('normal')
        throw result?.message || 'Network error.'
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || err)
      setStatus('normal')
    }
  }

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between px-[16px] pb-[16px] pt-[20px]`}
      >
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
          Sign Tx
        </h2>

        <TxInfo
          txInfo={{
            chainName: chain?.name || '',
            chainIcon: chain?.icon || '',
            from: transfer.from || suiAddress || '',
            to: transfer.to || '',
            value: transfer.value || '',
            tokenName: tokenName || 'SUI',
            feeInfo: fee
          }}
        />

        <div
          className={`mt-[34px] grid w-full flex-1 grid-cols-2 items-end gap-5`}
        >
          <Button
            size="large"
            block
            onClick={() => webAppReject(false)}
            theme="ghost"
          >
            Reject
          </Button>
          <Button
            size="large"
            className="w-full"
            onClick={doSignTx}
            status={status}
            disabled={isLoading || !transData?.data || fee === '--'}
          >
            {transfer && transfer?.data && checkApproveHex(transfer?.data)
              ? 'Approve'
              : 'Confirm'}
          </Button>
        </div>
      </div>
    </>
  )
}
