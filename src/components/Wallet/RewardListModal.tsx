import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useBoolean, useToast } from '@chakra-ui/react'
import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import Image from '../Image/Image'

interface ChildMethods {
  someMethod: () => void
}

interface Props {
  onLoading?: () => void
  onFinish?: () => void
  totalReward?: string
  withdraw: { chain_id: number; withdraw_gifts: number }[]
}

import { evmChainList } from '@/config/wagmi-config'
import { Chain } from 'viem'
import { tokenIconMap } from '@/config/token-icon'
import {
  useAccount,
  useEstimateFeesPerGas,
  useEstimateGas,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { CustomToast, typeOptions } from '../comm/Toast'
import { approveEvent, giftSign, verifyWithdraw } from '@/api'
import { formatUSD } from '@/utils/utils'

const contractAddress = '0x359E9Ef12132ea2a49701F838B5CdFbc13771AaF'
const contractAddressTestnet = '0xF165cFb92441544cF9DEF72427028Db85b0aDEe2'

const RewardListModal = forwardRef<ChildMethods, Props>(
  ({ onLoading, onFinish, totalReward = '$0', withdraw }, ref) => {
    useImperativeHandle(ref, () => ({
      someMethod: () => {
        toggle()
      },
    }))

    const toast = useToast()

    const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
    const [currentChain, setCurrenChain] = useState<Chain | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const { getCurrentUid } = useTMAUtils()
    const current_uid = getCurrentUid()
    const [writeContractSuccess, setWriteContractSuccess] = useState(false)
    const [writeContractApiError, setWriteContractApiError] = useState<any>(null)

    // Wagmi Hooks START
    const { data: gasLimit } = useEstimateGas()
    const { data: feesPerGas } = useEstimateFeesPerGas()
    const { switchChain } = useSwitchChain()
    const { address } = useAccount()
    const { data: hash, error: writeContractError, writeContract } = useWriteContract()
    const { isSuccess: isConfirmed, error: receiptError } = useWaitForTransactionReceipt({
      hash,
      chainId: currentChain?.id,
      query: {
        enabled: !!currentChain,
      },
    })
    // Wagmi Hooks END

    // Tx Status Interval START
    const isPollingRef = useRef(false)
    const isHandledRef = useRef(false)
    const pollingTimeoutRef = useRef<NodeJS.Timeout>()

    const setIsPolling = (value: boolean) => {
      isPollingRef.current = value
    }

    const setIsHandled = (value: boolean) => {
      isHandledRef.current = value
    }

    const stopPolling = () => {
      setIsPolling(false)
      pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current)
    }

    const pollStatus = async () => {
      if (!hash || !isPollingRef.current || isHandledRef.current) return
      pollingTimeoutRef.current && clearTimeout(pollingTimeoutRef.current)
      try {
        const res = await approveEvent({
          hash: hash as `0x${string}`,
          chain_id: currentWithdrawChain,
        })

        if (res.status === 1) {
          stopPolling()
          if (!isHandledRef.current) {
            setIsHandled(true)
            setWriteContractSuccess(true)
          }
        } else if (res.status === 2) {
          stopPolling()
          setWriteContractApiError(res)
        } else if (res.status === 0) {
          pollingTimeoutRef.current = setTimeout(() => {
            pollStatus()
          }, 2000)
        } else {
          throw new Error('Unknown status')
        }
      } catch (error) {
        stopPolling()
        console.error('Polling error:', error)
      }
    }
    // Tx Status Interval END

    // Reward List
    const [rewards, setRewards] = useState<{ token: `0x${string}`; amount: bigint }[]>([])
    const [currentWithdraw, setCurrentWithdraw] = useState<{
      chain_id: number
      withdraw_gifts: number
    } | null>(null)
    const [currentWithdrawInProgress, setCurrentWithdrawInProgress] = useState<{
      chain_id: number
      withdraw_gifts: number
    } | null>(null)

    const [currentWithdrawChain, setCurrentWithdrawChain] = useState(0)

    // Read Contract START
    const { data: bscReward, refetch: refetchBscReward } = useReadContract({
      abi,
      address: contractAddress as `0x${string}`,
      chainId: 56,
      functionName: 'getRewardByUid',
      args: [BigInt(current_uid)],
      query: {
        enabled: !!current_uid,
      },
    })

    const { data: ethReward, refetch: refetchEthReward } = useReadContract({
      abi,
      chainId: 1,
      address: contractAddress as `0x${string}`,
      functionName: 'getRewardByUid',
      args: [BigInt(current_uid)],
      query: {
        enabled: !!current_uid,
      },
    })

    const { data: testReward, refetch: refetchTestReward } = useReadContract({
      abi,
      chainId: 97,
      address: contractAddressTestnet as `0x${string}`,
      functionName: 'getRewardByUid',
      args: [BigInt(current_uid)],
      query: {
        enabled: !!current_uid,
      },
    })
    // Read Contract END

    // Withdraw START
    const walletWithdraw = async () => {
      if (!currentChain) return
      try {
        await switchChain({ chainId: currentChain.id })
      } catch (error) {
        toast({
          render: () => <CustomToast title="Switch chain failed" type={typeOptions.error} />,
          position: 'bottom',
        })
        return
      }
      if (!currentWithdraw) {
        toast({
          render: () => {
            return (
              <CustomToast title="Withdrawal in progress, please wait." type={typeOptions.info} />
            )
          },
          position: 'bottom',
        })
        return
      }

      setLoading(true)
      setCurrentWithdrawChain(currentChain.id)
      setCurrentWithdrawInProgress(currentWithdraw)
      onLoading?.()

      let _deadline = 0
      let signatures: any
      const chainId = currentChain.id
      const token = rewards.map((item) => item.token)
      const amount = rewards.map((item) => Number(item.amount))

      try {
        const { signatures: sigRes } = await giftSign({
          receiver: `${address}` as `0x${string}`,
          token: token.join(','),
          chainid: chainId,
          amount: amount.join(','),
        })

        signatures = sigRes.map((item) => item.signature)
        console.log('signatures', signatures)
        _deadline = sigRes[0]?.deadline
      } catch (error) {
        toast({
          render: () => {
            return <CustomToast title="signature error" type={typeOptions.info} />
          },
          position: 'bottom',
        })
        resetState()
      }

      const gasConfig = {
        gas: BigInt(Number(gasLimit) * 10) || 530000n,
        maxFeePerGas: BigInt(Number(feesPerGas?.maxFeePerGas) * 2) || 530000n,
        maxPriorityFeePerGas: BigInt(Number(feesPerGas?.maxPriorityFeePerGas) * 2) || 530000n,
      }

      console.log('gas', gasLimit, gasConfig)

      console.log('args', [
        BigInt(current_uid),
        `${address}` as `0x${string}`,
        rewards,
        BigInt(_deadline),
        signatures,
      ])
      writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: 'withdrawMultiToken',
        chainId,
        args: [
          BigInt(current_uid),
          `${address}` as `0x${string}`,
          rewards,
          BigInt(_deadline),
          signatures,
        ],
        ...gasConfig,
      })
    }
    // Withdraw END

    const disabled = useMemo(() => {
      if (!currentChain) return true

      const chainRewardMap = {
        56: bscReward,
        1: ethReward,
        97: testReward,
      }

      const currentReward = chainRewardMap[currentChain.id as keyof typeof chainRewardMap] || []
      const currentWithdraw = withdraw.filter((item) => item.chain_id === currentChain.id)

      setRewards([...(currentReward || [])])
      setCurrentWithdraw(currentWithdraw[0] || null)

      const hasRewards = currentReward.length > 0
      const hasWithdraw = currentWithdraw.length > 0

      return !(hasRewards || hasWithdraw)
    }, [currentChain, bscReward, ethReward, testReward, withdraw])

    useEffect(() => {
      if (writeContractError || receiptError || writeContractApiError) {
        console.log(writeContractError, receiptError, writeContractApiError)
        toast({
          render: () => {
            return <CustomToast title={'Failed'} type={typeOptions.error} />
          },
          position: 'bottom',
        })
        resetState()
        onFinish?.()
      }
    }, [writeContractError, receiptError, writeContractApiError])

    useEffect(() => {
      if (isConfirmed && !isHandledRef.current) {
        stopPolling()
        verifyWithdrawEve()
        onFinish?.()
      }
      if (writeContractSuccess && !isHandledRef.current) {
        verifyWithdrawEve()
        onFinish?.()
      }
    }, [isConfirmed, writeContractSuccess])

    useEffect(() => {
      console.log('tx hash', hash)
      if (hash) {
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

    const verifyWithdrawEve = async () => {
      resetState()
      toast({
        render: () => {
          return <CustomToast title={'success'} type={typeOptions.success} />
        },
        position: 'bottom',
      })
      await verifyWithdraw({
        from: address as `0x${string}`,
        chain_id: currentWithdrawChain,
        amount: currentWithdrawInProgress?.withdraw_gifts || 0,
        hash: hash as `0x${string}`,
      })
    }

    const resetState = () => {
      setIsHandled(false)
      setCurrentWithdrawChain(0)
      setWriteContractSuccess(false)
      setWriteContractApiError(null)
      setCurrentWithdrawInProgress(null)
      setLoading(false)
    }
    return (
      <>
        <BaseModal
          isOpen={isBaseModalOpen}
          onClose={() => {
            off()
          }}
          height="491px"
          animation={{
            duration: 400,
            timingFunction: 'ease-in-out',
          }}
          theme={{
            darkBackgroundColor: '#1a1a1a',
            lightBackgroundColor: '#ffffff',
            handleColor: '#d1d5db',
          }}
          closeOnBackdropClick={true}
          showHandle={false}
        >
          <div className="mt-1 w-full">
            <h3 className="font-bold text-2xl mb-[14px] text-[24px] text-[#333]">
              Choose a network
            </h3>
            <div className="text-[15px] text-[#999] font-normal">
              Your assets are on multiple networks. Please select one network you want to withdraw
              from.
            </div>
            <div className="flex items-center text-[16px] text-[#999] font-normal mt-10 mb-4">
              Available :&nbsp;<span className="text-[#333333]">{totalReward}</span>
            </div>

            {evmChainList.map((chain) => (
              <div
                className="flex items-center px-5 h-[72px] rounded-lg bg-[#F7F9FC] mt-2 cursor-pointer"
                style={{
                  border: currentChain?.id == chain.id ? '2px solid #D1CFE3' : '2px solid #F7F9FC',
                }}
                onClick={() => {
                  setCurrenChain(chain)
                }}
              >
                <div className="w-[28px] h-[28px] mr-2">
                  <Image
                    src={tokenIconMap[chain.nativeCurrency.symbol]}
                    type="avatar"
                    rect
                    width="28px"
                    height="28px"
                  ></Image>
                </div>
                <span className="flex-1 overflow-hidden text-base font-medium text-[#333333]">
                  {chain.name}
                </span>
                <span className="text-[20px] font-semibold text-[#000]">
                  {formatUSD(
                    withdraw.filter((item) => item.chain_id === chain.id)[0]?.withdraw_gifts,
                    true
                  )}
                </span>
              </div>
            ))}

            <div className="mt-8 mx-[18px]">
              <BaseButton
                text="Launch wallet to withdraw"
                height="48px"
                disabled={disabled}
                loading={loading}
                handler={() => {
                  walletWithdraw()
                }}
              />
            </div>
          </div>
        </BaseModal>
      </>
    )
  }
)

export default RewardListModal
