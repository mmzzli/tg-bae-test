import { Button } from '@/components/tmd/button/Button'
import Copy from 'components/Copy'
import useSdk from '@/hooks/oauth/useSdk'
import { useEffect, useMemo, useState } from 'react'
import { numberFormat } from 'utils'
import { useQuery } from '@tanstack/react-query'
import useApp from '@/hooks/oauth/useApp'
import { checkApproveHex, shortenAddress } from '@/utils/oauth/helper'
import useLoginInfo from '@/hooks/useLoginInfo'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import toast from 'components/Toast'
import { getTokenDetailByAddress } from '@/api'
import { getTonBalance, minTonBalance } from '@/config/ton'
import {
  TonTxBodyType,
  TonTxRequest,
  TonTxRequestStandard
} from '@tomo-inc/tomo-telegram-sdk'
import { getChainByChainId } from '@/stores/walletStore/utils'
import { useTonTx } from '@/hooks/oauth/useTonTx'
import { useSolanaTx } from '@/hooks/oauth/useSolanaTx'

interface TransferModel {
  from: string
  to: string
  value: string
  chainId: number
  /**
   * for sol ↓ ---
   */
  contract?: string
  data?: any // could be some leftover code
  /**
   * -------↑-------
   */
  /**
   * for ton ↓ ---
   */
  contractAddress?: string
  publicKey?: string
  memo?: string
  precision?: number
  /**
   * -------↑-------
   */
}

export default function SignTransactionUILegacy(props: {
  chainType: 'sol' | 'ton'
  [other: string]: any
}) {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()
  const [chainDisplayName, setChainDisplayName] = useState('')
  const [decimals, setDecimals] = useState(9)

  const { solAddress, tonAddress } = useLoginInfo()

  const { chainType, fee, unit } = props

  const { data: transData, isLoading } = useQuery({
    queryKey: ['sign-transaction'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  const transfer: Partial<TransferModel> = useMemo(() => {
    try {
      if ((transData?.data?.params || []).length) {
        const data = transData?.data?.params[0]
        if (
          chainType === 'ton' &&
          (data as TonTxRequest).type === TonTxBodyType.STANDARD
        ) {
          const body = data as TonTxRequestStandard
          const rs: TransferModel = {
            from: body.body.from || '',
            to: body.body.messages[0].address,
            value: body.body.messages[0].amount.toString(),
            chainId: body.chainId || -1
          }
          return rs
        }
        return data
      }
      return {}
    } catch (error) {
      return {}
    }
  }, [transData?.data?.params])

  const chainId = useMemo(() => {
    return Number(transfer?.chainId)
  }, [transfer?.chainId])

  const chain = useMemo(() => {
    return getChainByChainId(chainId)
  }, [chainId])

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )

  const { sendSolTransactionLegacy } = useSolanaTx()

  const { signTonTransaction } = useTonTx({ chainId })

  const getUserAddress = (chainType: (typeof props)['chainType']) => {
    if (chainType === 'sol') return solAddress
    if (chainType === 'ton') return tonAddress
    return ''
  }

  const doSignTx = async (chainType: (typeof props)['chainType']) => {
    if (status !== 'normal') return
    const userAddress = getUserAddress(chainType)

    if (
      !userAddress ||
      !transfer?.from ||
      userAddress.toLowerCase() != `${transfer.from}`.toLowerCase()
    ) {
      return toast.error('From address error.')
    }

    try {
      setStatus('loading')

      let signData
      let result
      if (chainType === 'sol') {
        signData = {
          fromAddress: transfer?.from,
          toAddress: transfer?.to,
          value: BigInt(+(transfer?.value || 0) * 10 ** decimals || 0),
          contract: transfer?.contract
        }
        console.log('%c signData ==>', 'color: red', signData)
        result = await sendSolTransactionLegacy(signData as any)
      }
      if (chainType === 'ton') {
        // judge balance
        const { formatted = '0' } =
          (await getTonBalance({ tonAddress: transfer.from })) || {}
        if (transfer.contractAddress && +formatted < minTonBalance) {
          return toast.error(
            `Insufficient balance. Min balance is ${minTonBalance} TON`
          )
        }
        const txRequestRaw: TonTxRequest = transData?.data?.params[0]
        if (txRequestRaw.type === TonTxBodyType.STANDARD) {
          // TODO  signTransaction
          signData = txRequestRaw as TonTxRequestStandard
          result = await signTonTransaction({ paramsForPure: signData })
        } else {
          //  "JETTON_PAYLOAD_JSON_LEGACY" or not defined
          signData = {
            fromAddress: transfer.from,
            publicKey: transfer.publicKey || '',
            amount: transfer.value + '',
            toAddress: transfer.to || '',
            memo: transfer.memo || '',
            tokenContractAddress: transfer.contractAddress,
            tokenPrecision: transfer.precision
          }

          result = await signTonTransaction({ params: signData })
        }
      }

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

  const handleConfirmClick = () => {
    if (['sol', 'ton'].includes(chainType)) {
      doSignTx(chainType)
    }
  }

  useEffect(() => {
    if (!transfer?.from) return setChainDisplayName('')
    const contractAddr = transfer.contractAddress || transfer.contract
    if (contractAddr) {
      getTokenDetailByAddress(chain?.name || '', contractAddr).then((res) => {
        setChainDisplayName(res?.symbol)
        setDecimals(res?.decimals)
      })
    } else {
      if (chainType === 'ton') return setChainDisplayName('TON')
      if (chainType === 'sol') return setChainDisplayName('SOL')
      setChainDisplayName(chain?.chain?.nativeCurrency.symbol || 'ETH')
    }
  }, [chain, chainType, transfer])

  const getFee = () => {
    if (chainType === 'ton') {
      return 'Average ~ 0.0055 TON'
    }
    if (chainType === 'sol') {
      return 'Average ~ 0.000005 SOL'
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

        <div className="mt-[20px] rounded-[12px] bg-[#F9F9F9]">
          <div
            className={
              'my-[20px] w-full rounded-[8px] bg-[#f9f9f9] px-[16px] py-[8px]'
            }
          >
            <ListItem title={'Network'}>
              <div
                className={`flex items-center gap-[4px] text-sm font-medium leading-[18px]`}
              >
                <span>{chain?.name}</span>
                {chain?.icon && (
                  <img src={chain?.icon} className={`size-[20px]`} alt="" />
                )}
              </div>
            </ListItem>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'From'}>
              <div className={`flex items-center gap-[12px]`}>
                <span className={`max-w-[170px] break-words text-right`}>
                  {shortenAddress(transfer?.from || '', 8, 8)}
                </span>
              </div>
            </ListItem>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'To'}>
              <div className={`flex items-center gap-[4px]`}>
                <span className={`max-w-[170px] break-words text-right`}>
                  {shortenAddress(transfer?.to || '', 8, 8)}
                </span>
                <Copy text={transfer?.to ?? ''} />
              </div>
            </ListItem>
            <div className={`my-[8px] h-px bg-gray-100`}></div>

            <ListItem title={'Amount'}>
              <div className={`flex items-center gap-[4px]`}>
                <span className={`max-w-[170px] text-right`}>
                  <>
                    {numberFormat(transfer?.value, 6)}
                    &nbsp;
                    {chainDisplayName}
                  </>
                </span>
                <div></div>
              </div>
            </ListItem>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'Network Fee'}>
              <div className={`flex flex-col items-end gap-[6px]`}>
                <div>{getFee()}</div>
              </div>
            </ListItem>
          </div>
        </div>

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
            onClick={handleConfirmClick}
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
