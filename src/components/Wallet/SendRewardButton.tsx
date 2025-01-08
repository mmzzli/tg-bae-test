import { useEffect, useRef } from 'react'
import { SlideButton, SlideButtonHandle } from '../BaseButton/SlideButton'
import {
  useEstimateFeesPerGas,
  useEstimateGas,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { parseUnits } from 'viem'

export const SendRewardButton = ({
  amount,
  decimals,
  tokenAddress,
  contractAddress,
  chainId,
  disabled = false,
}: {
  amount: string
  decimals: number
  tokenAddress: string
  contractAddress: string
  chainId: number
  disabled: boolean
}) => {
  const slideButtonRef = useRef<SlideButtonHandle>(null)

  const { data: hash, error, writeContract } = useWriteContract()
  const { switchChain } = useSwitchChain()

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const toast = useToast()
  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()
  const handleSendReward = () => {
    console.log('handleSendReward', amount, tokenAddress, contractAddress, current_uid)
    if (!contractAddress) {
      toast({
        render: () => <CustomToast title="Coming soon" type={typeOptions.info} />,
        position: 'bottom',
      })
      return slideButtonRef.current?.reset()
    }
    switchChain(
      {
        chainId,
      },
      {
        onSuccess: async () => {
          console.log('writeContract onSuccess', parseUnits(amount, decimals))
          console.log('gasLimit', gasLimit)
          console.log('feesPerGas', feesPerGas)

          writeContract({
            address: contractAddress as `0x${string}`,
            abi,
            functionName: 'reward',
            args: [
              parseUnits('0', decimals),
              tokenAddress as `0x${string}`,
              parseUnits(amount, decimals),
              BigInt(current_uid),
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

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (error) {
      toast({
        render: () => {
          return <CustomToast title={'Failed to send'} type={typeOptions.error} />
        },
        position: 'bottom',
      })
      slideButtonRef.current?.reset()
    }
  }, [error])

  useEffect(() => {
    if (isConfirmed) {
      toast({
        render: () => <CustomToast title="Sent" type={typeOptions.success} />,
        position: 'bottom',
      })
      slideButtonRef.current?.reset()
    }
  }, [isConfirmed])
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
