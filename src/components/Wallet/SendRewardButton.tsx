import { useEffect, useRef } from 'react'
import { SlideButton, SlideButtonHandle } from '../BaseButton/SlideButton'
import { BaseError, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { parseEther } from 'viem'

export const SendRewardButton = ({
  amount,
  tokenAddress,
  contractAddress,
  chainId,
  disabled = false,
}: {
  amount: string
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
        onSuccess: () => {
          writeContract({
            address: contractAddress as `0x${string}`,
            abi,
            functionName: 'reward',
            args: [
              BigInt(0),
              tokenAddress as `0x${string}`,
              contractAddress === tokenAddress ? parseEther(amount) : 0n,
              BigInt(current_uid),
            ],
            value: contractAddress === tokenAddress ? parseEther(amount) : 0n,
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
          return (
            <CustomToast
              title={(error as BaseError).shortMessage || (error as BaseError).message}
              type={typeOptions.error}
            />
          )
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
