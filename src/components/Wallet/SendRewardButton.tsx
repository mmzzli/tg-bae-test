import { useEffect, useMemo, useRef, useState } from 'react'
import { SlideButton, SlideButtonHandle } from '../BaseButton/SlideButton'
import {
  useAccount,
  useChainId,
  useEstimateFeesPerGas,
  useEstimateGas,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi, approveAbi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { maxUint256, parseUnits } from 'viem'
import { approveEvent, rewardEvent } from '@/api'
import { MessageType } from '../Chat/types'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import BigNumber from 'bignumber.js'
import { useDailyTaskActions } from '@/hooks/useDailyTask'

export const SendRewardButton = ({
  amount,
  decimals,
  tokenAddress,
  contractAddress,
  chainId,
  chainName,
  token,
  disabled = false,
  toUid,
  afterReward,
}: {
  amount: string
  decimals: number
  tokenAddress: string
  contractAddress: string
  chainId: number
  chainName: string
  token: string
  toUid: number
  disabled: boolean
  afterReward?: () => void
}) => {
  const slideButtonRef = useRef<SlideButtonHandle>(null)
  const [showAllowance, setShowAllowance] = useState(false)

  const { runDailyChat } = useDailyTaskActions()

  const { data: hash, error, writeContract } = useWriteContract()
  const { address } = useAccount()

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const { formatMessage } = useFormatMessage()
  const { sendMessage } = useIM()

  const toast = useToast()
  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()

  const isPollingRef = useRef(false)
  const isHandledRef = useRef(false)

  const setIsPolling = (value: boolean) => {
    isPollingRef.current = value
  }

  const setIsHandled = (value: boolean) => {
    isHandledRef.current = value
  }
  const pollingTimeoutRef = useRef<NodeJS.Timeout>()

  const [isApproving, setIsApproving] = useState(false)
  const [writeContractError, setWriteContractError] = useState<any>(null)
  const { error: receiptError, isSuccess: receiptSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const {
    data: allowance,
    isLoading: allowanceLoading,
    refetch: refetchAllowance,
  } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: approveAbi,
    functionName: 'allowance',
    args: [address as `0x${string}`, contractAddress as `0x${string}`],
    query: {
      enabled: tokenAddress !== '0x0000000000000000000000000000000000000000',
    },
  })

  const needApprove = useMemo(() => {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      return false
    }
    if (!allowance) {
      return true
    }
    return BigInt(allowance) < parseUnits(amount, decimals)
  }, [allowance, amount, decimals, tokenAddress])

  const stopPolling = () => {
    setIsPolling(false)
    pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current)
  }
  const pollStatus = async () => {
    if (!hash || !isPollingRef.current || isHandledRef.current) return
    pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current)
    try {
      const res = await approveEvent({ hash: hash as `0x${string}`, chain_id: chainId })

      if (res.status === 1) {
        stopPolling()
        if (!isHandledRef.current) {
          setIsHandled(true)
          handleSuccess()
        }
      } else if (res.status === 2) {
        stopPolling()
        setWriteContractError(res)
      } else if (res.status === 0) {
        pollingTimeoutRef.current = setTimeout(() => {
          pollStatus()
        }, 1200)
      } else {
        throw new Error('Unknown status')
      }
    } catch (error) {
      stopPolling()
      console.error('Polling error:', error)
    }
  }

  const gasConfig =
    import.meta.env.VITE_APP_ENV === 'production'
      ? {
          gas: gasLimit ? BigInt(Number(gasLimit) * 4) : 1030000n,
          maxFeePerGas: feesPerGas?.maxFeePerGas,
          maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
        }
      : {
          gas: gasLimit ? BigInt(Number(gasLimit) * 4) : 1030000n,
          maxFeePerGas: feesPerGas?.maxFeePerGas,
          maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
        }

  const switchChain = async () => {
    // if (currentChainId !== chainId) {
    try {
      await switchChainAsync({ chainId })
    } catch (error) {
      toast({
        render: () => <CustomToast title="Switch chain failed" type={typeOptions.error} />,
        position: 'bottom',
      })
    }
    // }
  }
  const reward = () => {
    writeContract({
      address: contractAddress as `0x${string}`,
      chainId,
      abi,
      functionName: 'reward',
      args: [
        parseUnits('0', decimals),
        tokenAddress as `0x${string}`,
        parseUnits(amount, decimals),
        BigInt(current_uid),
        BigInt(toUid),
      ],
      value:
        tokenAddress === '0x0000000000000000000000000000000000000000'
          ? parseUnits(amount, decimals)
          : 0n,
      ...gasConfig,
    })
  }

  const handleSendReward = async () => {
    if (!contractAddress) {
      toast({
        render: () => <CustomToast title="Coming soon" type={typeOptions.info} />,
        position: 'bottom',
      })
      return slideButtonRef.current?.reset()
    }

    await switchChain()

    if (tokenAddress !== '0x0000000000000000000000000000000000000000' && needApprove) {
      console.warn('Approve:', tokenAddress as `0x${string}`, parseUnits(amount, decimals))
      setIsApproving(true)
      writeContract({
        address: tokenAddress as `0x${string}`,
        chainId,
        abi: approveAbi,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, maxUint256],
        ...gasConfig,
      })
      return
    }

    reward()
  }

  useEffect(() => {
    if (error || receiptError || writeContractError) {
      console.log('error', error, receiptError, writeContractError)
      toast({
        render: () => {
          return <CustomToast title={'Failed'} type={typeOptions.error} />
        },
        position: 'bottom',
      })
      stopPolling()
      setIsApproving(false)
      slideButtonRef.current?.reset()
    }
  }, [error, receiptError, writeContractError])

  const handleSuccess = () => {
    if (!isApproving) {
      rewardEvent({
        from: address as `0x${string}`,
        to_uid: toUid,
        chain_id: chainId,
        amount: parseFloat(amount),
        hash: hash as `0x${string}`,
      })
      // send card
      const newMessage = formatMessage({
        type: MessageType.REWARD,
        to: toUid,
        metadata: {
          chain_id: chainId,
          token,
          token_address: tokenAddress,
          chain_name: chainName,
          amount,
          to_uid: toUid,
          hash: hash as `0x${string}`,
        },
      })
      sendMessage(newMessage)
      runDailyChat()
      toast({
        render: () => <CustomToast title="Sent" type={typeOptions.success} />,
        position: 'bottom',
      })
      setIsApproving(false)
      afterReward?.()
      refetchAllowance()
      slideButtonRef.current?.reset()
    } else if (isApproving) {
      setIsApproving(false)
      refetchAllowance()
      // 开始打赏
      reward()
    }
  }

  useEffect(() => {
    if (receiptSuccess && !isHandledRef.current) {
      console.log('receiptSuccess', receiptSuccess, isHandledRef.current)
      stopPolling()
      setIsHandled(true)
      handleSuccess()
    }
  }, [receiptSuccess])

  useEffect(() => {
    if (hash) {
      console.warn(`${isApproving ? 'Approve' : 'Reward'} hash:`, hash)
      setIsHandled(false)
      setIsPolling(true)
      setTimeout(() => {
        pollStatus()
      }, 0)
    }
    return () => {
      stopPolling()
    }
  }, [hash])

  useEffect(() => {
    if (currentChainId !== chainId) {
      console.log('need chainId changed')
      switchChain()
    }
  }, [currentChainId])

  useEffect(() => {
    let lastTap = 0
    const handleTouchStart = (e: TouchEvent) => {
      const currentTime = new Date().getTime()
      const tapLength = currentTime - lastTap
      if (tapLength < 300 && tapLength > 0) {
        setShowAllowance(!showAllowance)
        e.preventDefault()
      }
      lastTap = currentTime
    }

    const handleDoubleClick = () => {
      setShowAllowance(!showAllowance)
    }

    // 同时监听触摸和鼠标事件
    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('dblclick', handleDoubleClick)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [showAllowance])
  return (
    <div>
      <SlideButton
        ref={slideButtonRef}
        disabled={disabled}
        onConfirm={() => {
          handleSendReward()
        }}
      />
      <div
        className="text-sm text-[#ccc] text-right mt-1 mr-1 ml-auto text-ellipsis overflow-hidden max-w-[300px] whitespace-nowrap"
        style={{ display: showAllowance ? 'block' : 'none' }}
      >
        Allowance:{' '}
        {allowanceLoading
          ? 'Loading...'
          : allowance
            ? new BigNumber(allowance.toString()).div(10 ** decimals).toString()
            : '0'}
      </div>
    </div>
  )
}
