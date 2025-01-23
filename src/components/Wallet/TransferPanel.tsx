import { useState, useEffect, useRef } from 'react'
import { formatUnits, parseEther, parseUnits } from 'viem'
import BigNumber from 'bignumber.js'
import { SendRewardButton } from './SendRewardButton'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { useEstimateFeesPerGas, useEstimateGas, useEstimateMaxPriorityFeePerGas } from 'wagmi'

interface TransferPanelProps {
  balance: bigint
  symbol: string
  decimals: number
  price?: number // USD price
  onAmountChange: (amount: string) => void
  tokenAddress: string
  contractAddress: string
  chainId: number
  chainName: string
  toUid: number
}

export const TransferPanel = ({
  balance,
  symbol,
  decimals,
  price = 0,
  tokenAddress,
  contractAddress,
  onAmountChange,
  chainId,
  chainName,
  toUid,
}: TransferPanelProps) => {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const formattedBalance = formatUnits(balance, decimals)
  const toast = useToast()
  const [inputWidth, setInputWidth] = useState(0)
  const [unitMeasureWidth, setUnitMeasureWidth] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)
  const unitMeasureRef = useRef<HTMLSpanElement>(null)
  const percentages = [
    { label: '10%', value: 0.1 },
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: 'MAX', value: 1 },
  ]

  const { data: gasLimit } = useEstimateGas({
    chainId: chainId,
  })
  const { data: feesPerGas } = useEstimateFeesPerGas({
    chainId: chainId,
  })
  const { data: maxPriorityFee } = useEstimateMaxPriorityFeePerGas({
    chainId: chainId,
  })

  const validateAmount = (value: string) => {
    if (!value) {
      setError('')
      return true
    }

    const decimalParts = value.split('.')
    if (decimalParts.length > 1 && decimalParts[1].length > decimals) {
      toast({
        render: () => (
          <CustomToast title={`Max ${decimals} decimal places`} type={typeOptions.info} />
        ),
      })
      const truncatedValue = `${decimalParts[0]}.${decimalParts[1].slice(0, decimals)}`
      setAmount(truncatedValue)
      onAmountChange(truncatedValue)
      return false
    }

    if (!/^\d*\.?\d*$/.test(value)) {
      setError('Invalid input')
      return false
    }

    try {
      const inputBN = new BigNumber(value)
      const balanceBN = new BigNumber(formattedBalance)

      if (inputBN.isGreaterThan(balanceBN)) {
        setError('Insufficient balance')
        return false
      }
    } catch {
      setError('Invalid input')
      return false
    }

    const validNumberFormat = /^([1-9]\d*|0)(\.\d*[1-9])?$/
    if (!validNumberFormat.test(value)) {
      setError('Invalid input')
      return true
    }

    setError('')
    return true
  }

  const handleAmountChange = (value: string) => {
    // 匹配正常数字
    if (value !== '' && !/^[1-9]\d*\.?\d*$|^0\.?\d*$/.test(value)) return
    setAmount(value)
    if (validateAmount(value)) {
      onAmountChange(value)
    }
  }

  const formatToUsd = (value: string, price: number) => {
    if (!price) {
      return '$0'
    }
    const usdValue = new BigNumber(value || '0').multipliedBy(price)
    if (usdValue.eq(0)) {
      return '$0'
    }
    if (usdValue.lt(0.01)) {
      return '<$0.01'
    }
    return `$${usdValue.toFixed(2, 1)}`
  }

  const handlePercentageClick = (percentage: number) => {
    const balanceBN = new BigNumber(formattedBalance)
    let newAmount = balanceBN.multipliedBy(percentage).decimalPlaces(decimals, BigNumber.ROUND_DOWN)

    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      const estimatedGas = gasLimit ? BigInt(gasLimit) : 21000n
      const currentGasPrice = feesPerGas ? BigInt(feesPerGas.maxFeePerGas) : 0n
      const totalCost =
        estimatedGas * 2n * (currentGasPrice + (maxPriorityFee ? BigInt(maxPriorityFee) : 0n))

      if (totalCost + parseUnits(newAmount.toString(), decimals) > balance) {
        const amount = parseUnits(newAmount.toString(), decimals) - totalCost
        if (amount < 0) {
          toast({
            render: () => <CustomToast title={`Insufficient gas`} type={typeOptions.info} />,
          })
          setError('Insufficient gas')
          return
        }

        newAmount = new BigNumber(formatUnits(amount, decimals)).decimalPlaces(
          decimals,
          BigNumber.ROUND_DOWN
        )
      }
    }
    handleAmountChange(newAmount.toString())
  }

  const usdValue = formatToUsd(amount, price)

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth
      setInputWidth(Math.max(0, width + 12))
    }
  }, [amount])

  useEffect(() => {
    if (unitMeasureRef.current) {
      const width = unitMeasureRef.current.offsetWidth
      setUnitMeasureWidth(Math.max(0, width))
    }

    const preventScroll = (event: TouchEvent) => {
      event.preventDefault()
    }

    document.body.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      window.scrollTo(0, 0)
      document.body.removeEventListener('touchmove', preventScroll)
    }
  }, [])

  return (
    <div className="flex flex-col w-full">
      <div className="text-[48px] font-bold absolute invisible">
        <span ref={measureRef} className=" whitespace-pre" style={{ fontFamily: 'inherit' }}>
          {amount || '0'}
        </span>
        <span ref={unitMeasureRef} className="whitespace-pre" style={{ fontFamily: 'inherit' }}>
          {symbol}
        </span>
      </div>

      <div className="relative flex justify-center items-center h-[58px] overflow-hidden">
        <div
          className="relative inline-flex items-center text-[48px] font-bold"
          style={{ width: `${inputWidth + unitMeasureWidth}px` }}
        >
          <input
            autoFocus
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className=" h-[58px] w-full bg-transparent border-none outline-none text-[#12122A] placeholder:text-[#333] font-bold"
            placeholder="0"
            style={{ paddingRight: `${unitMeasureWidth}px` }}
          />
          <span
            className="absolute text-[#C1C0D8]"
            style={{ left: '100%', transform: 'translateX(-100%)' }}
          >
            {symbol}
          </span>
        </div>
      </div>

      <div className="text-center text-base text-[#616184]">{usdValue}</div>

      <div className="text-center text-xs text-[#EB4B6D] h-[18px] mt-2">{error}</div>

      <div className="flex items-center justify-center gap-2 mt-6 h-[42px]">
        {percentages.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => handlePercentageClick(value)}
            className="font-medium text-sm w-[74px] h-[34px] flex items-center justify-center rounded-full bg-[#F7F9FC] hover:bg-[#F7F9FC]"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <SendRewardButton
          amount={amount}
          balance={balance}
          decimals={decimals}
          tokenAddress={tokenAddress}
          contractAddress={contractAddress}
          chainId={chainId}
          chainName={chainName}
          token={symbol}
          toUid={toUid}
          disabled={!!error || amount === '' || parseFloat(amount) === 0}
          afterReward={() => {
            setAmount('')
            onAmountChange('')
          }}
        />
      </div>
    </div>
  )
}
