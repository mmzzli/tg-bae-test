// import { Button } from '@/components/tmd/button/Button'
import { useEffect, useMemo, useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// // import useChains from 'hooks/useChains'
// import useSdk from '@/hooks/oauth/useSdk'
// import useApp from '@/hooks/oauth/useApp'
// import useLoginInfo from '@/hooks/useLoginInfo'
// import { useTonTx } from '@/hooks/oauth/useTonTx'
// import { useWebApp } from '@vkruglikov/react-telegram-web-app'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import toast from 'components/Toast'
// import { getTokenDetailByAddress } from '@/api'
// import {
//   mockTonChainId,
//   mockTonTestnetChainId,
//   minTonBalance
// } from '@/config/ton'
// import { TonTxRequest, TonTxRequestStandard } from '@tomo-inc/tomo-telegram-sdk'
// import { TxInfo } from './TxInfo'
import { Address, fromNano } from '@ton/core'
// import BigNumber from 'bignumber.js'
// import { getTonBalance } from '@/utils/oauth/getTonBalance'

import { useWalletRequestStore } from '@/store/wallet/walletRequest'
import BigNumber from 'bignumber.js'
import { TonTxRequestStandard } from '@tomo-inc/tomo-telegram-sdk'
import {
  getTonBalance,
  minTonBalance,
  mockTonChainId,
  mockTonTestnetChainId,
} from '@/store/wallet/config/ton'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { useTonTx } from '../../hooks/useTonTx'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { getTokenDetailByAddress } from '@/api/wallet'
import { TxInfo } from './TxInfo'
import BaseButton from '@/components/BaseButton/BaseButton'

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
  const {
    requestParam: { params },
  } = useWalletRequestStore()

  const [tokenName, setTokenName] = useState('')
  const toast = useToast()

  const { fee, unit, onSuccess } = props
  const chainType = 'ton'

  const transfer: Partial<TransferModel> = useMemo(() => {
    if (params.length > 0) {
      const data = params[0]
      const body = data as TonTxRequestStandard
      if (!body?.body?.messages?.[0]) return {}
      const valueRaw = body.body.messages[0].amount.toString()
      const rs: TransferModel = {
        from: body.body.from || '',
        to: body.body.messages[0].address,
        value: '',
        chainId: body?.chainId || 1100,
      }

      if (body.jettonInfo) {
        // jetton tx
        const jettonMinterAddress = (body.jettonInfo as any).jettonMinterAddress
        rs.contractAddress = jettonMinterAddress
        rs.to = body.jettonInfo.recipientAddress
        const precision = isJUSDT(jettonMinterAddress) ? 6 : 9
        rs.value = new BigNumber(body.jettonInfo.amount).dividedBy(10 ** precision).toString()
      } else {
        // regular tx
        rs.value = fromNano(valueRaw)
        rs.rawData = body.body.messages[0].payload
      }

      return rs
    }
    return {}
  }, [params])

  const chainId = useMemo(() => {
    return Number(transfer?.chainId || mockTonChainId)
  }, [transfer?.chainId])

  const chain = useMemo(() => {
    return getChainByChainId(chainId)
  }, [chainId])

  const [loading, setLoading] = useState<boolean>(false)

  const { signTonTransaction } = useTonTx({
    chainId: chainId,
  })

  const doSignTx = async () => {
    if (loading || !transfer?.from) return

    try {
      setLoading(true)

      // judge balance
      const { formatted = '0' } = (await getTonBalance({ tonAddress: transfer.from })) || {}
      if (transfer.contractAddress && +formatted < minTonBalance) {
        toast({
          render: () => {
            return (
              <CustomToast
                title={`Insufficient balance. Min balance is ${minTonBalance} TON`}
                type={typeOptions.error}
              />
            )
          },
          position: 'bottom',
          duration: 2000,
        })
      }
      const txRequestRaw: TonTxRequestStandard = params[0] as TonTxRequestStandard
      //  txRequestRaw.type === TonTxBodyType.STANDARD should be STANDARD BY DEFAULT
      const signData = txRequestRaw
      const result = await signTonTransaction({
        paramsForPure: signData as any,
      })

      if (!result) {
        return
      }
      if (result && result?.code == 10000) {
        onSuccess?.(result?.signedTransaction || '')
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

  useEffect(() => {
    if (!transfer?.from) return setTokenName('')
    const contractAddr = transfer.contractAddress
    if (contractAddr) {
      getTokenDetailByAddress(chain?.name || '', contractAddr).then((res) => {
        // todo... 需要看下接口返回数据
        // @ts-ignore
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
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">Sign Tx</h2>

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
            rawData: transfer.rawData,
          }}
        />

        <div className={`mt-[34px] w-full`}>
          <BaseButton
            handler={doSignTx}
            loading={loading}
            disabled={params.length == 0 || fee === '--'}
            text="Confirm"
            height="52px"
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

export function isJUSDT(address: string) {
  const usdtAddress = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'
  if (
    usdtAddress === address ||
    Address.parse(address).toString() === Address.parse(usdtAddress).toString() ||
    Address.parse(usdtAddress).toString() === address ||
    Address.parse(address).toString() === usdtAddress
  ) {
    return true
  } else {
    return false
  }
}
