import { useEffect, useRef, useState } from 'react'
import { SlideButton, SlideButtonHandle } from '../BaseButton/SlideButton'
import {
  useAccount,
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
import { rewardEvent } from '@/api'
import { MessageType, WrappedMessage } from '../Chat/types'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'

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
  const { switchChain } = useSwitchChain()

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const { formatMessage } = useFormatMessage()
  const { sendMessage } = useIM()

  const toast = useToast()
  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()

  const [isApproving, setIsApproving] = useState(false)

  const handleSendReward = () => {
    console.log('handleSendReward', amount, tokenAddress, contractAddress, current_uid)
    if (!contractAddress) {
      toast({
        render: () => <CustomToast title="Coming soon" type={typeOptions.info} />,
        position: 'bottom',
      })
      return slideButtonRef.current?.reset()
    }

    if (tokenAddress !== '0x0000000000000000000000000000000000000000') {
      switchChain(
        {
          chainId,
        },
        {
          onSuccess: async () => {
            console.log(
              'writeContract approve',
              tokenAddress as `0x${string}`,
              parseUnits(amount, decimals)
            )

            setIsApproving(true)

            writeContract({
              address: tokenAddress as `0x${string}`,
              abi: approveAbi,
              functionName: 'approve',
              args: [contractAddress as `0x${string}`, parseUnits(amount, decimals)],
              gas: gasLimit,
              maxFeePerGas: feesPerGas?.maxFeePerGas,
              maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
            })
          },
        }
      )
      return
    }

    switchChain(
      {
        chainId,
      },
      {
        onSuccess: async () => {
          console.log(
            'writeContract onSuccess',
            parseUnits('0', decimals),
            tokenAddress as `0x${string}`,
            parseUnits(amount, decimals),
            BigInt(current_uid),
            BigInt(toUid)
          )

          writeContract({
            address: contractAddress as `0x${string}`,
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
            gas: gasLimit,
            maxFeePerGas: feesPerGas?.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
          })
        },
      }
    )
  }

  const { isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (error || receiptError) {
      toast({
        render: () => {
          return <CustomToast title={'Failed'} type={typeOptions.error} />
        },
        position: 'bottom',
      })
      setIsApproving(false)
      slideButtonRef.current?.reset()
    }
  }, [error, receiptError])

  useEffect(() => {
    if (isConfirmed && !isApproving) {
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
    } else if (isConfirmed && isApproving) {
      setIsApproving(false)
      // 开始打赏
      switchChain(
        {
          chainId,
        },
        {
          onSuccess: async () => {
            console.log(
              'writeContract onSuccess',
              parseUnits('0', decimals),
              tokenAddress as `0x${string}`,
              parseUnits(amount, decimals),
              BigInt(current_uid),
              BigInt(toUid)
            )

            writeContract({
              address: contractAddress as `0x${string}`,
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
              gas: gasLimit,
              maxFeePerGas: feesPerGas?.maxFeePerGas,
              maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
            })
          },
        }
      )
    }
  }, [isConfirmed, isApproving])

  useEffect(() => {
    console.log('hash', hash)
  }, [hash])
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
