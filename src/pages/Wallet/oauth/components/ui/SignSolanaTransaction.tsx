import { useMemo, useState } from 'react'
import { TxInfo } from './TxInfo'
import { useWalletRequestStore } from '@/store/wallet/walletRequest'
import { mockSolEvmChainId } from '@/store/wallet/config/sol'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import solana from '@/store/wallet/chains/wagmiConfig/solana'
import { useUserStore } from '@/store/wallet/walletUser'
import { useSolanaTx } from '../../hooks/useSolanaTx'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import BaseButton from '@/components/BaseButton/BaseButton'

interface TransferModel {
  txHex: string
  chainId: number
}

export default function SignSolanaTransaction(props: { [other: string]: any }) {
  const {
    requestParam: { params },
  } = useWalletRequestStore()
  const {
    walletUserInfo: { solanaAddress },
  } = useUserStore()
  const toast = useToast()

  const { /* chainType, */ fee, unit, onSuccess } = props

  const transfer: TransferModel = useMemo(() => {
    return params.length > 0 ? params[0] : {}
  }, [params])

  const chainId = mockSolEvmChainId
  const chain = useMemo(() => {
    return getChainByChainId(chainId) as typeof solana
  }, [chainId])

  const [loading, setLoading] = useState<boolean>(false)
  const { signSolRawTx } = useSolanaTx()

  const doSignTx = async () => {
    try {
      setLoading(true)
      const result = await signSolRawTx(transfer.txHex)
      if (!result) return
      if (result && result?.code == 10000) {
        onSuccess?.(result?.result || '')
      } else {
        throw result?.message || 'Network error.'
      }
    } catch (err: any) {
      toast({
        render: () => {
          return (
            <CustomToast
              title={err?.response?.data?.message || err?.message || err}
              type={typeOptions.error}
            />
          )
        },
        position: 'bottom',
        duration: 2000,
      })
    } finally {
      setLoading(false)
    }
  }
  const getFee = () => {
    return 'Average ~ 0.000005 SOL'
  }

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between px-[16px] pb-[16px] pt-[20px] overflow-y-auto`}
      >
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
          Sign Tx (beta)
        </h2>

        <TxInfo
          txInfo={{
            chainName: chain.name,
            chainIcon: chain.icon,
            from: solanaAddress,
            tokenName: 'SOL',
            feeInfo: getFee(),
            rawData: transfer.txHex,
          }}
        />

        <div className={`mt-[34px] w-full`}>
          <BaseButton
            text="Confirm"
            height="52px"
            handler={doSignTx}
            loading={loading}
            disabled={params.length == 0 || fee === '--'}
          />
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
  np,
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
