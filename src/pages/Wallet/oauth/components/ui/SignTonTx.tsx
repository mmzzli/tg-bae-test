import { Button } from '@/components/tmd/button/Button'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
// import useChains from 'hooks/useChains'
import useSdk from '@/hooks/oauth/useSdk'
import useApp from '@/hooks/oauth/useApp'
import useLoginInfo from '@/hooks/useLoginInfo'
import { useTonTx } from '@/hooks/oauth/useTonTx'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import { getChainByChainId } from '@/stores/walletStore/utils'
import toast from 'components/Toast'
import { getTokenDetailByAddress } from '@/api'
import {
  mockTonChainId,
  mockTonTestnetChainId,
  minTonBalance
} from '@/config/ton'
import { TonTxRequest, TonTxRequestStandard } from '@tomo-inc/tomo-telegram-sdk'
import { TxInfo } from './TxInfo'
import { Address, fromNano } from '@ton/core'
import BigNumber from 'bignumber.js'
import { getTonBalance } from '@/utils/oauth/getTonBalance'

interface TransferModel {
  from: string
  to: string
  value: string
  chainId: number
  rawData?: string
  contractAddress?: string
  publicKey?: string
  memo?: string
  precision?: number
  forwardAmount?: string
}

export default function SignTonTx(props: { [other: string]: any }) {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()
  const [tokenName, setTokenName] = useState('')

  const { tonAddress, tonAddressTest } = useLoginInfo()

  const { fee, unit } = props
  const chainType = 'ton'

  const { data: transData, isLoading } = useQuery({
    queryKey: ['sign-transaction'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  useEffect(() => {
    console.log('SignTonTx')
  }, [])

  const transfer: Partial<TransferModel> = useMemo(() => {
    if ((transData?.data?.params || []).length) {
      const data = transData?.data?.params[0]
      console.log('standard payload')
      const body = data as TonTxRequestStandard
      if (!body?.body?.messages?.[0]) return {}
      const valueRaw = body.body.messages[0].amount.toString()
      const rs: TransferModel = {
        from: body.body.from || '',
        to: body.body.messages[0].address,
        value: '',
        chainId: body.chainId || -1
      }

      if (body.jettonInfo) {
        // jetton tx
        const jettonMinterAddress = (body.jettonInfo as any).jettonMinterAddress
        rs.contractAddress = jettonMinterAddress
        rs.to = body.jettonInfo.recipientAddress
        const precision = isJUSDT(jettonMinterAddress) ? 6 : 9
        rs.value = new BigNumber(body.jettonInfo.amount)
          .dividedBy(10 ** precision)
          .toString()
      } else {
        // regular tx
        rs.value = fromNano(valueRaw)
        rs.rawData = body.body.messages[0].payload
      }

      return rs
    }
    return {}
  }, [transData?.data?.params])

  const chainId = useMemo(() => {
    return Number(transfer?.chainId || mockTonChainId)
  }, [transfer?.chainId])

  const chain = useMemo(() => {
    return getChainByChainId(chainId)
  }, [chainId])

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )
  const [reStatus, setReStatus] = useState<'normal' | 'loading'>('normal')

  const { signTonTransaction } = useTonTx({
    chainId: chainId
  })

  const getUserAddress = () => {
    return chainId === mockTonTestnetChainId ? tonAddressTest : tonAddress
  }

  const doSignTx = async () => {
    if (status !== 'normal') return
    const userAddress = getUserAddress()

    if (
      !userAddress ||
      !transfer?.from ||
      userAddress?.toLowerCase() != `${transfer.from}`.toLowerCase()
    ) {
      return toast.error('From address error.')
    }

    try {
      setStatus('loading')

      // judge balance
      const { formatted = '0' } = (await getTonBalance(transfer.from)) || {}
      if (transfer.contractAddress && +formatted < minTonBalance) {
        toast.error(`Insufficient balance. Min balance is ${minTonBalance} TON`)
      }
      const txRequestRaw: TonTxRequestStandard = transData?.data?.params[0]
      //  txRequestRaw.type === TonTxBodyType.STANDARD should be STANDARD BY DEFAULT
      const signData = txRequestRaw
      const result = await signTonTransaction({
        paramsForPure: signData as any
      })

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

  useEffect(() => {
    if (!transfer?.from) return setTokenName('')
    const contractAddr = transfer.contractAddress
    if (contractAddr) {
      getTokenDetailByAddress(chain?.name || '', contractAddr).then((res) => {
        setTokenName(res?.symbol)
      })
    } else {
      setTokenName('TON')
    }
  }, [chain, chainType, transfer])

  const feeInfo = 'Average ~ 0.0055 TON'

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between overflow-scroll px-[16px] pb-[16px] pt-[20px]`}
      >
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
          Sign Tx
        </h2>

        <TxInfo
          txInfo={{
            chainName: chain?.name || '',
            chainIcon: chain?.icon || '',
            from: transfer.from || '',
            to: transfer.to || '',
            value: transfer.value || '',
            // value: fromNano(transfer.value || '0'),
            tokenName,
            feeInfo,
            rawData: transfer.rawData
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

export function isJUSDT(address: string) {
  const usdtAddress = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'
  if (
    usdtAddress === address ||
    Address.parse(address).toString() ===
      Address.parse(usdtAddress).toString() ||
    Address.parse(usdtAddress).toString() === address ||
    Address.parse(address).toString() === usdtAddress
  ) {
    return true
  } else {
    return false
  }
}
