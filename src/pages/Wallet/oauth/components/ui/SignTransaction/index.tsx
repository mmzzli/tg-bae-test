import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import { Button } from '@/components/tmd/button/Button'
import Copy from 'components/Copy'
import toast from 'components/Toast'
import useSdk from '@/hooks/oauth/useSdk'
import useEvmMethods from '@/hooks/oauth/useEvmMethods'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useLoginInfo from 'hooks/useLoginInfo'
import { formatUnits } from 'viem'
import { useNavigate } from 'react-router-dom'
import useApp from '@/hooks/oauth/useApp'
import { getMulticallTokenInfo } from '@/stores/tokenStore/hooks/read/useReadErc20'
import { prepareTransactionRequest } from '@wagmi/core'
import { evmChainsConfig } from '@/proviers/web3Provider/chains'

import { GasFeeStatus } from './const'
import Container from './Container'
import ListItem from './ListItem'
import Skeleton from './Skeleton'
import DescriptionOrRawData from './DescriptionOrRawData'
import NetworkFee, { NetworkFeeTag, Deposit } from './NetworkFee'
import useGas from './useGas'
import useBalance from './useBalance'
import useDeposit from './useDeposit'
import { TokenInfo } from './types'
import { shortenAddress } from 'utils/helper'
import {
  constructEstGasParams,
  numberFormat,
  parseApproveOrTransferParams
} from '../../../../../utils/oauth/helper'
import { getChainByChainId } from '@/stores/walletStore/utils'

import './index.css'

export default function SignTransaction() {
  const { getPayload } = useSdk()
  const { evmAddress } = useLoginInfo()
  const webApp = useWebApp()
  const { webAppReject } = useApp()
  const navigate = useNavigate()

  const { data: transData, isLoading } = useQuery({
    queryKey: ['sign-transaction'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  const transfer = useMemo(() => {
    if ((transData?.data?.params || []).length) {
      const data = transData?.data?.params[0]

      return data
    }
    return {}
  }, [transData?.data?.params])

  const chainId = useMemo(() => {
    return Number(transfer?.chainId)
  }, [transfer?.chainId])

  const chain = useMemo(() => {
    return getChainByChainId(chainId)
  }, [chainId])

  // console.log('chain', chain, transfer?.chainId)

  const tokenData = useMemo(() => {
    return parseApproveOrTransferParams(transfer?.data || '')
  }, [transfer?.data])

  const [tokenInfo, setTokenInfo] = useState({
    name: '',
    symbol: '',
    decimals: 0,
    image: ''
  })

  useEffect(() => {
    if (transfer?.to && chainId && tokenData.value) {
      getMulticallTokenInfo({
        chainId: chainId,
        tokenAddress: transfer.to
      }).then((data) => {
        setTokenInfo(data)
      })
    }
  }, [transfer?.to, chainId, tokenData.value])

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )

  const { signEVMTransaction } = useEvmMethods({
    chainId: chainId
  })

  // this is the token that is being transacted
  const computedToken: TokenInfo = useMemo(() => {
    let symbol = ''
    let decimals = 0
    let value = BigInt(0)
    let formatted = ''
    let isNative = true

    // if there is data, it means not native
    if (transfer?.data) {
      isNative = false
      if (tokenData?.function === 'transfer') {
        // transfer
        symbol = tokenInfo?.symbol
        decimals = tokenInfo?.decimals
        value = BigInt(tokenData?.value || 0)
      } else {
        // approve or other
        symbol = chain?.chain?.nativeCurrency.symbol || ''
        decimals = chain?.chain?.nativeCurrency.decimals || 18
        value = BigInt(parseInt(transfer?.value) || 0)
      }
    } else {
      // native
      isNative = true
      symbol = chain?.chain?.nativeCurrency.symbol || ''
      decimals = chain?.chain?.nativeCurrency.decimals || 18
      value = BigInt(parseInt(transfer?.value) || 0)
    }
    formatted = numberFormat(formatUnits(value, decimals), 6)

    return {
      isNative,
      symbol,
      decimals,
      value,
      formatted
    }
  }, [
    chain?.chain?.nativeCurrency.decimals,
    chain?.chain?.nativeCurrency.symbol,
    tokenData?.function,
    tokenData?.value,
    tokenInfo?.decimals,
    tokenInfo?.symbol,
    transfer?.data,
    transfer?.value
  ])

  const balance = useBalance({
    chainId,
    address: transfer.from,
    // if token is not native, then use the token: transfer.to
    token: transfer?.data && tokenInfo?.symbol ? transfer.to : undefined,
    amount: computedToken.value
  })

  const { canDeposit } = useDeposit({
    chainId,
    // if token is not native, then use the token: transfer.to
    address: computedToken?.isNative ? '' : transfer?.to
  })

  const {
    gas,
    setGas,
    gasWei,
    setGasWei,
    gasFee,
    gasFeeStatus,
    setGasFeeStatus
  } = useGas({
    chainId,
    transfer,
    amount: computedToken.value,
    isNativeToken: computedToken.isNative
  })

  const estimateGasFee = useCallback(() => {
    try {
      if (
        chainId &&
        transfer?.from &&
        transfer?.to &&
        evmChainsConfig &&
        !isNaN(gasWei as any)
      ) {
        setGasFeeStatus(GasFeeStatus.UNKNOWN)

        prepareTransactionRequest(
          evmChainsConfig(),
          constructEstGasParams({
            chainId: chainId,
            account: transfer?.from,
            to: transfer?.to,
            value: BigInt(parseInt(transfer?.value) || 0),
            data: transfer?.data
          })
        )
          .then((res) => {
            setGas(res.gas)
            setGasFeeStatus(GasFeeStatus.SUCCESS)
          })
          .catch((e: any) => {
            console.log('e', e)
            if (e?.message?.includes('insufficient funds'))
              setGasFeeStatus(GasFeeStatus.INSUFFICIENT_FUNDS)
            else setGasFeeStatus(GasFeeStatus.FAIL)
          })
      }
    } catch (error) {
      console.log('error', error)
      setGasFeeStatus(GasFeeStatus.FAIL)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    chainId,
    transfer?.from,
    transfer?.to,
    transfer?.value,
    transfer?.data,
    evmChainsConfig,
    gasWei,
    chain?.chain?.nativeCurrency.decimals
  ])

  const customGasLimit = transfer.gasLimit
  const customGasPrice = transfer.gasPrice

  useEffect(() => {
    if (
      customGasLimit &&
      !isNaN(customGasPrice as any) &&
      chain?.chain?.nativeCurrency.decimals
    ) {
      console.log('estimating with custom gas limit')
      setGas(BigInt(customGasLimit))
      setGasWei(customGasPrice)
      setGasFeeStatus(GasFeeStatus.CUSTOM)
      return
    }
    if (chainId && transfer?.to && gasWei) estimateGasFee()
  }, [
    chainId,
    transfer?.to,
    gasWei,
    customGasLimit,
    customGasPrice,
    chain?.chain?.nativeCurrency.decimals
  ])

  const getUserAddress = () => evmAddress
  const handleConfirm = async () => {
    if (status !== 'normal') return
    const userAddress = getUserAddress()
    if (
      !userAddress ||
      !transfer?.from ||
      userAddress.toLowerCase() != `${transfer.from}`.toLowerCase()
    ) {
      toast.error('From address error.')
      return
    }
    try {
      setStatus('loading')

      type sendTxParam = Parameters<typeof signEVMTransaction>[0]

      const signData: sendTxParam = {
        chainId: chainId,
        fromAddress: transfer?.from,
        toAddress: transfer?.to,
        value: BigInt(parseInt(transfer?.value) || 0),
        data: transfer?.data
      }

      if (transfer.gasLimit) signData.gasLimit = transfer.gasLimit
      if (transfer.gasPrice) signData.gasPrice = transfer.gasPrice
      const result = await signEVMTransaction(signData)
      if (result && result?.code == 10000) {
        setStatus('success')

        setTimeout(() => {
          // webApp.enableClosingConfirmation()
          // webApp.disableClosingConfirmation()
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

  const goNetworkFee = useCallback(() => {
    navigate('/oauth/network-fee', {
      state: {
        fee: gasFee.formatted,
        price: gasWei,
        limit: gas.toString(),
        symbol: chain?.chain?.nativeCurrency.symbol
      }
    })
  }, [
    navigate,
    gasFee.formatted,
    gasWei,
    gas,
    chain?.chain?.nativeCurrency.symbol
  ])

  const Footer = (
    <div className={`mt-[25px] grid w-full grid-cols-2 items-end gap-5`}>
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
        onClick={handleConfirm}
        status={status}
        disabled={
          isLoading ||
          !transData?.data ||
          (gasFeeStatus !== GasFeeStatus.SUCCESS &&
            gasFeeStatus !== GasFeeStatus.CUSTOM)
        }
      >
        Approve
      </Button>
    </div>
  )

  return (
    <Container title={'Sign Tx'} footer={Footer}>
      {/* Network */}
      <ListItem title={'Network'}>
        <div
          className={`flex items-center gap-[4px] text-sm font-medium leading-[18px]`}
        >
          <span>{chain?.name}</span>
          {chain?.icon && (
            <img
              src={chain?.icon}
              className={`size-[20px] rounded-full`}
              alt=""
            />
          )}
        </div>
      </ListItem>

      <div className={`my-[8px] h-px bg-gray-100`}></div>

      {/* From */}
      <ListItem title={'From'}>
        <div className={`flex items-center gap-[12px]`}>
          <span className={`max-w-[170px] break-words text-right`}>
            {shortenAddress(transfer?.from || '', 8, 8)}
          </span>
        </div>
      </ListItem>

      <div className={`my-[8px] h-px bg-gray-100`}></div>

      {/* To */}
      <ListItem title={transfer?.data ? 'Interact With' : 'To'}>
        <div className={`flex items-center gap-[4px]`}>
          <span className={`max-w-[170px] break-words text-right`}>
            {shortenAddress(transfer?.to || '', 8, 8)}
          </span>
          <Copy text={transfer?.to ?? ''} />
        </div>
      </ListItem>

      <div className={`my-[8px] h-px bg-gray-100`}></div>

      {/* Amount */}
      <ListItem
        title={'Amount'}
        className={balance.isInsufficient ? '!items-start' : ''}
      >
        <div className={`flex max-w-[170px] items-center`}>
          {computedToken.symbol && computedToken.formatted ? (
            <div className="flex flex-col items-end gap-[6.5px]">
              <div className="max-w-[170px] whitespace-normal text-right">
                <span className=" break-words">{computedToken.formatted}</span>
                &nbsp;
                {computedToken.symbol}
              </div>

              {balance.isInsufficient && (
                <Deposit
                  chainId={chainId}
                  address={computedToken?.isNative ? '' : transfer?.to}
                  canDeposit={computedToken?.isNative ? true : canDeposit}
                  symbol={computedToken.symbol}
                />
              )}
            </div>
          ) : (
            <Skeleton />
          )}
        </div>
      </ListItem>

      <div className={`my-[8px] h-px bg-gray-100`}></div>

      {/* Network Fee */}
      <ListItem
        title={
          <div className="flex items-center gap-[8px]">
            Network Fee <NetworkFeeTag gasFeeStatus={gasFeeStatus} />
          </div>
        }
      >
        <div className="max-w-[170px]">
          <NetworkFee
            chainId={chainId}
            gasFeeStatus={gasFeeStatus}
            gasFee={gasFee.formatted}
            symbol={chain?.chain?.nativeCurrency.symbol || ''}
            estimateGasFee={estimateGasFee}
            goNetworkFee={goNetworkFee}
          />
        </div>
      </ListItem>

      {/* Description or RawData */}
      {transfer?.data && (
        <DescriptionOrRawData
          transferData={transfer.data}
          tokenData={tokenData}
          tokenInfo={tokenInfo}
        />
      )}
    </Container>
  )
}
