import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useNativeToken from './hook/useNativeToken'
import chains from '@/store/wallet/chains'
import { Web3Type } from '@/store/wallet/chainType'
import { FeeMode } from '../components/FeeSelect'
import useEstimatedGas, { UseEstimatedGasParamsType } from './hook/useEstimatedGas'
import { sendEvmParams } from './components/ConfirmSendBtn'
import BigNumber from 'bignumber.js'
import getSendEvmData from './utils/getSendEvmData'
import { URLSearchParams } from 'url'
import { formatNumber } from '@/components/tmd/utils/format/number'
import AdaptiveNumber, { NumberType } from '../components/AdaptiveNumber'
import { Button, Input } from 'antd-mobile'
import { TContainer, TNumberKeyboard, TTip, TTokenImage } from '@/components/tmd'
import BaseButton from '@/components/BaseButton/BaseButton'
// import { useAtomValue } from 'jotai'
// import { tonSendTransactionDataAtom } from '@/store/wallet/util/tonconnect'
import useLoginInfo from '@/store/wallet/hooks/useLoginInfo'
import { useTokenStore } from '@/store/wallet/walletToken'

const rateButton = [
  {
    key: '10%',
    label: '10%',
    rate: 0.1,
  },
  {
    key: '25%',
    label: '25%',
    rate: 0.25,
  },
  {
    key: '50%',
    label: '50%',
    rate: 0.5,
  },
  {
    key: '100%',
    label: 'MAX',
    rate: 1,
  },
]
function InputAmount() {
  const [search, setSearch] = useSearchParams()
  const navigate = useNavigate()
  const address = search.get('address') || ''
  const amount = search.get('amount') || ''
  const toAddress = search.get('toAddress') || ''
  const chainId = search.get('chainId') || ''
  const btcAdrType = search.get('btcAdrType') || ''
  const spanRef = useRef<HTMLSpanElement>(null)
  const [inputAmount, setInputAmount] = useState<string>(amount)
  // const { marketTokens } = useMarketStore()
  const chain = getChainByChainId(Number(chainId || '1'))

  const onSetInputAmount = (amount: string) => {
    setSearch(
      {
        chainId,
        address,
        toAddress,
        btcAdrType,
        amount,
      },
      { replace: true }
    )
    setInputAmount(amount)
  }
  const { tokenList } = useTokenStore()
  // const tonSendTxData = useAtomValue(tonSendTransactionDataAtom)
  const { getAddressByToken } = useLoginInfo()
  useEffect(() => {
    setInputAmount(amount)
  }, [])

  const tokenInfo = useMemo(() => {
    const findAssetsToken = tokenList.find?.((token) => {
      return (
        token?.chainId === Number(chainId) &&
        token?.address?.toLocaleUpperCase() === address?.toLocaleUpperCase()
      )
    })
    return findAssetsToken
  }, [tokenList])

  // useEffect(() => {
  //   if (store.walletTokens.length !== 0 && !tokenInfo) {
  //     navigate('/', { replace: true })
  //   }
  // }, [tokenInfo, store.walletTokens])

  const nativeToken = useNativeToken(tokenInfo)
  const estimatedGasParams: UseEstimatedGasParamsType = {
    toAddress,
    token: tokenInfo!,
    walletBtcType: btcAdrType,
    amount: '0',
    inputAmount,
    data: chain?.type === 'EVM' ? getSendEvmData(tokenInfo, toAddress, '0') : undefined,
  }

  const {
    gasFee: estimatedGasFee,
    solPriorityFee,
    isFetching,
  } = useEstimatedGas({
    params: estimatedGasParams,
    chainId: Number(chainId || chains.ethereum.id),
    evmParams:
      tokenInfo &&
      getChainByChainId(tokenInfo.chainId)?.type === Web3Type.EVM &&
      sendEvmParams({
        amount: amount,
        token: tokenInfo,
        toAddress: toAddress,
        fromAddress: getAddressByToken(tokenInfo),
      }),
    gasMagnification: (() => {
      const chain = getChainByChainId(Number(chainId))
      // if (chain?.id === chains.optimism.id) {
      //   return 200
      // }
      if (chain?.id === chains.ethereum.id) {
        return 2
      }
      if (chain?.type === Web3Type.EVM) {
        return 5
      }
      return 2
    })(),
    feeModeParams: FeeMode.FAST,
    gasMagnMode: true,
  })

  const gasFee = (() => {
    if (tokenInfo?.chainId === chains.solana.id) {
      return BigNumber(estimatedGasFee || '0')
        .plus(new BigNumber(solPriorityFee || '0'))
        .toFixed()
    }
    return estimatedGasFee
  })()

  const gasFeeBigNumber = new BigNumber(gasFee || '0')

  const defaultFontSize = 48
  const minFontSize = 16
  const subFontSize = 4
  const fontLength = inputAmount.length
  const fontSize = Math.max(defaultFontSize - Math.floor(fontLength / 2) * subFontSize, minFontSize)
  // solana remain rent fee
  const reserveGasFee = useMemo(() => {
    switch (chain?.type) {
      case 'SOL':
        return 0.001
      case 'EVM':
        return (() => {
          const baseFee = 0.000003
          // if (chain.id === chains.scroll.id) {
          //   return baseFee * 3
          // }
          return baseFee
        })()
      default:
        return 0
    }
  }, [chain?.id, chain?.type])

  const minWidth = 48

  const [inputWidth, setInputWidth] = useState(minWidth)

  useEffect(() => {
    const mockWidth = spanRef.current?.offsetWidth || minWidth
    const width = Math.max(mockWidth, minWidth)
    setInputWidth(width)
  }, [inputAmount])

  const formatted = useMemo(() => {
    // if (tokenInfo?.chainId === chains.btc.id && tokenInfo.isNative) {
    //   return (
    //     (tokenInfo as BTCToken)?.balanceItem?.find?.((item) => item.type === btcAdrType)
    //       ?.formatted || '0'
    //   )
    // }
    if (tokenInfo?.isNative) {
      const efficientFormatted = new BigNumber(tokenInfo?.formatted || '0').minus(reserveGasFee)
      if (efficientFormatted.lt(0)) return '0'
      return efficientFormatted.toFixed()
    }
    return tokenInfo?.formatted || '0'
  }, [btcAdrType, reserveGasFee, tokenInfo])

  const formattedBigNnumber = new BigNumber(formatted || '0')
  const inputAmountBigNumber = new BigNumber(inputAmount || '0')
  const priceUsd: string = new BigNumber(tokenInfo?.price || 0)
    .multipliedBy(inputAmountBigNumber)
    .toString()

  const isValid =
    formattedBigNnumber.gte(0) &&
    !inputAmountBigNumber.isNaN() &&
    inputAmountBigNumber.gte(0) &&
    inputAmountBigNumber.lte(formattedBigNnumber)
  const confirmAmount = () => {
    const amount = new BigNumber(inputAmount).toFixed()
    const urlSearchParams = {
      toAddress,
      chainId,
      address,
      btcAdrType,
      amount,
    }
    const urlSearchStr = new URLSearchParams(urlSearchParams).toString()
    navigate(`/wallet/send/confirm-send?${urlSearchStr}`)
  }

  const estimateGasFailed = useMemo(() => {
    return !isFetching && gasFeeBigNumber.lte(0)
    // return !isFetching && tokenInfo?.chainId !== chains.tron.id && gasFeeBigNumber.lte(0)
  }, [isFetching, gasFeeBigNumber, tokenInfo])

  const noAffordGas = useMemo(() => {
    if (tokenInfo?.isNative) {
      return (
        formattedBigNnumber.minus(gasFeeBigNumber).lt(inputAmountBigNumber) ||
        formattedBigNnumber.lte(gasFeeBigNumber)
      )
    } else {
      return new BigNumber(nativeToken?.formatted || '0').minus(reserveGasFee).lte(gasFeeBigNumber)
    }
  }, [
    tokenInfo?.isNative,
    formattedBigNnumber,
    gasFeeBigNumber,
    inputAmountBigNumber,
    nativeToken?.formatted,
    reserveGasFee,
  ])

  // const isDuckChainDS =
  //   tokenInfo?.chainId === chains.duckChain.id &&
  //   tokenInfo?.address?.toLocaleUpperCase() === DuckChainDsAddress.toLocaleUpperCase()

  const setAmountByRate = (rate: number) => {
    if (tokenInfo?.isNative) {
      const calcGasFeeBigNumber = (() => {
        if (chain?.type === 'SOL' || chain?.type === 'EVM') {
          return gasFeeBigNumber.multipliedBy(1.5)
        }
        return gasFeeBigNumber
      })()

      if (formattedBigNnumber.lt(calcGasFeeBigNumber)) {
        return onSetInputAmount(formatNumber('0', true, false))
      }

      const amount = formattedBigNnumber.minus(calcGasFeeBigNumber).multipliedBy(rate).toFixed()

      onSetInputAmount(formatNumber(amount, true, false))
    } else {
      const amount = formattedBigNnumber.multipliedBy(rate).toFixed()
      onSetInputAmount(formatNumber(amount, true, false))
    }
  }

  const CardTips = ({
    title,
    onClick,
    content,
    arrow = false,
  }: {
    title: string
    onClick?: () => void
    content?: string
    arrow?: boolean
  }) => (
    <div className="mt-[32px] w-full" onClick={onClick}>
      <TTip
        arrow={arrow}
        title={title ? <span className="font-semibold">{title}</span> : <></>}
        content={content || ''}
      />
    </div>
  )

  // const isStarSupport = StarSupportChains.includes(Number(chainId))

  // const needNativeAmount = (() => {
  //   const nativeFormatted = new BigNumber(nativeToken?.formatted || '0')
  //   if (tokenInfo?.isNative) {
  //     return nativeFormatted
  //       .minus(reserveGasFee)
  //       .minus(gasFeeBigNumber)
  //       .minus(inputAmountBigNumber)
  //       .abs()
  //   } else {
  //     return nativeFormatted.minus(reserveGasFee).minus(gasFeeBigNumber).abs()
  //   }
  // })()

  const BalanceErrorTips = () => {
    // const isShowStarExchange =
    // !inputAmountBigNumber.isNaN() && !inputAmountBigNumber.eq(0) && isStarSupport
    // const content = isShowStarExchange ? 'You can try to exchange Gas' : ''
    // const onClick = () => {
    //   isShowStarExchange &&
    //     navigate(
    //       Routers.star.swap({
    //         chainId: String(tokenInfo?.chainId || ''),
    //         amount: needNativeAmount.toFixed(),
    //         to: 'trade',
    //       })
    //     )
    // }
    // if (isDuckChainDS) {
    //   return <CardTips arrow={false} content="" title="Cannot transfer DS" />
    // }
    if (estimateGasFailed) {
      return (
        <CardTips
          title="Failed to estimate gas"
          content={'Please ensure you have enough funds in your wallet'}
        />
      )
    }
    if (!isValid) {
      return (
        <CardTips
          title="Insufficient balance"
          // arrow={isShowStarExchange}
          // onClick={onClick}
          // content={content}
        />
      )
    }
    if (noAffordGas) {
      return (
        <CardTips
          title={`Insufficient ${nativeToken?.symbol} balance to pay for network fee`}
          // arrow={isShowStarExchange}
          // content={content}
          // onClick={onClick}
        />
      )
    }

    return <></>
  }

  const handleInputChange = (inputValue: string) => {
    let finalValue = inputValue
    finalValue = formatNumber(inputValue, true, false)
    // parse 001/00.212
    if (!finalValue.includes('.')) {
      finalValue = finalValue.replace(/^0+(?!$)/, '')
    } else {
      finalValue = finalValue.replace(/^0+(?=\d)/, '')
    }
    onSetInputAmount(finalValue)
  }

  return (
    <TContainer className="flex flex-col size-full px-5" scrollable>
      {/* <BackButton onClick={() => navigate(-1)} /> */}
      <div className=" mt-[24px] flex justify-center">
        <div className="flex items-center rounded-[39px] bg-bg3 p-[8px] pr-[16px]">
          <TTokenImage image={tokenInfo?.image ?? ''} symbol={tokenInfo?.symbol ?? ''} size={28} />
          <span className="ml-[8px] text-sm text-t2">Balance&nbsp;:</span>
          <AdaptiveNumber
            className="ml-[8px] text-sm text-t1"
            value={formatted}
            type={NumberType.BALANCE}
            decimalSubLen={6}
          />
        </div>
      </div>
      <div className="mt-[32px] flex flex-col items-center justify-center">
        <div className="flex h-[64px] justify-center">
          <Input
            placeholder="0"
            value={inputAmount}
            readOnly
            onFocus={(e) => {
              e.preventDefault()
            }}
            style={{
              '--text-align': 'right',
              '--color': 'var(--text-t1)',
              '--placeholder-color': 'var(--text-t4)',
              '--font-size': `${fontSize}px`,
              width: `${inputWidth}px`,
              maxWidth: '60vw',
              minWidth: `${minWidth}px`,
            }}
          />

          <div className="ml-[8px] flex items-center text-t1" style={{ fontSize: `${fontSize}px` }}>
            <span className="max-w-[160px] truncate">{tokenInfo?.symbol}</span>
          </div>
          <span
            ref={spanRef}
            style={{
              fontSize: `${fontSize}px`,
              visibility: 'hidden',
              position: 'absolute',
            }}
          >
            {inputAmount}
          </span>
        </div>
        <AdaptiveNumber
          className="mt-[4px] text-base text-t2"
          value={priceUsd}
          type={NumberType.USD}
        />
        <BalanceErrorTips />
      </div>
      <div className="mb-[10px] flex flex-1 flex-col justify-end">
        <div className="mb-[24px] grid grid-cols-4 gap-[8px]">
          {rateButton.map((item) => (
            <Button
              key={item.key}
              disabled={isFetching}
              className="w-full !bg-bg3 !text-t1 focus:border-none"
              // shape="round"
              onClick={() => setAmountByRate(item.rate)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <TNumberKeyboard
          customKey={'.'}
          onDelete={() => onSetInputAmount(inputAmount.slice(0, -1))}
          onInput={(v) => {
            handleInputChange(`${inputAmount ?? ''}${v}`)
          }}
        />

        <BaseButton
          disabled={
            // isDuckChainDS ||
            !isValid ||
            noAffordGas ||
            isFetching ||
            estimateGasFailed ||
            inputAmountBigNumber.lte(0)
          }
          text="Confirm"
          className="mt-[24px]"
          handler={confirmAmount}
          height="52px"
          loading={isFetching}
        />
      </div>
    </TContainer>
  )
}

export default InputAmount
