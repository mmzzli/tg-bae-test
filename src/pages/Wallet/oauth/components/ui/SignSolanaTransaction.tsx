import { useMemo, useState } from 'react'
import useSdk from '@/hooks/oauth/useSdk'
import useApp from '@/hooks/oauth/useApp'
import useLoginInfo from '@/hooks/useLoginInfo'
import useSendTransaction from '@/hooks/useSendTransaction'
import toast from 'components/Toast'
import { TxInfo } from './TxInfo'
import { Button } from '@/components/tmd/button/Button'
import { mockSolEvmChainId } from '@/config/sol'
import { useQuery } from '@tanstack/react-query'
import { checkApproveHex } from '@/utils/oauth/helper'
import { getChainByChainId } from '@/stores/walletStore/utils'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import solana from '@/proviers/web3Provider/chains/wagmiConfig/solana'
import { useSolanaTx } from '@/hooks/oauth/useSolanaTx'

interface TransferModel {
  txHex: string
  chainId: number
}

export default function SignSolanaTransaction(props: { [other: string]: any }) {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()

  const { solAddress } = useLoginInfo()

  const { /* chainType, */ fee, unit } = props

  const { data: transData, isLoading } = useQuery({
    queryKey: ['sign-transaction'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  const transfer: TransferModel = useMemo(() => {
    if ((transData?.data?.params || []).length) {
      const data = transData?.data?.params[0]
      return data
    }
    return {}
  }, [transData?.data?.params])

  const chainId = mockSolEvmChainId
  const chain = useMemo(() => {
    return getChainByChainId(chainId) as typeof solana
  }, [chainId])

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )
  const { signSolRawTx } = useSolanaTx()

  const userAddress = solAddress

  const doSignTx = async () => {
    try {
      setStatus('loading')
      const result = await signSolRawTx(transfer.txHex)

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
  const getFee = () => {
    return 'Average ~ 0.000005 SOL'
  }

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between px-[16px] pb-[16px] pt-[20px]`}
      >
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
          Sign Tx (beta)
        </h2>

        <TxInfo
          txInfo={{
            chainName: chain.name,
            chainIcon: chain.icon,
            from: userAddress || '',
            tokenName: 'SOL',
            feeInfo: getFee(),
            rawData: transfer.txHex
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
            Confirm
          </Button>
        </div>
      </div>
    </>
  )
}

type TransDataType = {
  chainId: number
  from: string
  to: string
  value: string
}

function ListItem({
  title,
  children,
  className,
  np
}: {
  title: string
  children: React.ReactNode
  className?: string
  np?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-[8px] py-[8px]`}>
      <div className={`text-sm text-title/60`}>{title}</div>
      <div className={`text-sm text-black`}>{children}</div>
    </div>
  )
}
