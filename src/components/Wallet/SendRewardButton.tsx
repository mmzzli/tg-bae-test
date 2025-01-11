import { useEffect, useRef, useState } from 'react'
import { SlideButton, SlideButtonHandle } from '../BaseButton/SlideButton'
import {
  useAccount,
  useChainId,
  useEstimateFeesPerGas,
  useEstimateGas,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi, approveAbi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { parseUnits } from 'viem'
import { approveEvent, rewardEvent } from '@/api'
import { MessageType } from '../Chat/types'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'
import { useRequest } from 'ahooks'

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
}) => {
  const slideButtonRef = useRef<SlideButtonHandle>(null)

  const { data: hash, error, writeContract } = useWriteContract()
  const { address } = useAccount()

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const { formatMessage } = useFormatMessage()
  const { sendMessage } = useIM()

  const toast = useToast()
  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()

  const [isApproving, setIsApproving] = useState(false)
  const [writeContractSuccess, setWriteContractSuccess] = useState(false)
  const [writeContractError, setWriteContractError] = useState<any>(null)
  const { error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const currentChainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const { run: pollStatus, cancel: stopPolling } = useRequest(
    async () => {
      const res = await approveEvent({ hash: hash as `0x${string}`, chain_id: chainId })
      if (res.status === 1) {
        setWriteContractSuccess(true)
        stopPolling()
        setTimeout(() => {
          handleSuccess()
        }, 0)
      } else if (res.status === 2) {
        setWriteContractError(res)
        stopPolling()
      }
      return res
    },
    {
      pollingInterval: 600,
      manual: true,
      pollingWhenHidden: false,
    }
  )

  const gasConfig =
    import.meta.env.VITE_APP_ENV === 'production'
      ? {}
      : {
          gas: gasLimit ? BigInt(Number(gasLimit) * 3) : 0n,
          maxFeePerGas: feesPerGas?.maxFeePerGas,
          maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
        }

  const switchChain = async () => {
    if (currentChainId !== chainId) {
      try {
        await switchChainAsync({ chainId })
      } catch (error) {
        toast({
          render: () => <CustomToast title="Switch chain failed" type={typeOptions.error} />,
          position: 'bottom',
        })
      }
    }
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
    console.log('handleSendReward', amount, tokenAddress, contractAddress, current_uid)
    if (!contractAddress) {
      toast({
        render: () => <CustomToast title="Coming soon" type={typeOptions.info} />,
        position: 'bottom',
      })
      return slideButtonRef.current?.reset()
    }

    await switchChain()

    if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
      console.log(
        'writeContract approve',
        tokenAddress as `0x${string}`,
        parseUnits(amount, decimals)
      )
      setIsApproving(true)
      writeContract({
        address: tokenAddress as `0x${string}`,
        chainId,
        abi: approveAbi,
        functionName: 'approve',
        args: [contractAddress as `0x${string}`, parseUnits(amount, decimals)],
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
      toast({
        render: () => <CustomToast title="Sent" type={typeOptions.success} />,
        position: 'bottom',
      })
      setIsApproving(false)
      slideButtonRef.current?.reset()
    } else if (isApproving) {
      setIsApproving(false)
      // 开始打赏
      reward()
    }
  }

  // useEffect(() => {
  //   console.log('writeContractSuccess', writeContractSuccess, isApproving)
  //   if (writeContractSuccess && !isApproving) {
  //     rewardEvent({
  //       from: address as `0x${string}`,
  //       to_uid: toUid,
  //       chain_id: chainId,
  //       amount: parseFloat(amount),
  //       hash: hash as `0x${string}`,
  //     })
  //     // send card
  //     const newMessage = formatMessage({
  //       type: MessageType.REWARD,
  //       to: toUid,
  //       metadata: {
  //         chain_id: chainId,
  //         token,
  //         token_address: tokenAddress,
  //         chain_name: chainName,
  //         amount,
  //         to_uid: toUid,
  //         hash: hash as `0x${string}`,
  //       },
  //     })
  //     sendMessage(newMessage)
  //     toast({
  //       render: () => <CustomToast title="Sent" type={typeOptions.success} />,
  //       position: 'bottom',
  //     })
  //     setIsApproving(false)
  //     slideButtonRef.current?.reset()
  //   } else if (writeContractSuccess && isApproving) {
  //     setIsApproving(false)
  //     // 开始打赏
  //     reward()
  //   }
  // }, [writeContractSuccess, isApproving])

  useEffect(() => {
    console.log('hash', hash)
    if (hash) {
      pollStatus() // 有新的 hash 时开始轮询
    }
    return () => {
      stopPolling() // 组件卸载时停止轮询
    }
  }, [hash])

  useEffect(() => {
    if (currentChainId !== chainId) {
      console.log('need chainId changed')
      switchChain()
    }
  }, [currentChainId])
  return (
    <SlideButton
      ref={slideButtonRef}
      disabled={disabled}
      onConfirm={() => {
        handleSendReward()
      }}
    />
  )
}
