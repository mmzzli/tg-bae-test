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

import { config, evmChainList } from '@/config/wagmi-config'
import { Chain, encodeFunctionData } from 'viem'
import { tokenIconMap } from '@/config/token-icon'
import { useReadContract, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi'
import { getBalance, getGasPrice, estimateGas } from '@wagmi/core'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { CustomToast, typeOptions } from '../comm/Toast'
import { approveEvent, giftSign, verifyWithdraw } from '@/api'
import { formatUSD } from '@/utils/utils'
import { useAccount } from '@/pages/Wallet/utils/walletProvider'

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
    const [writeContractApiError, setWriteContractApiError] = useState<any>(null)
    const [hash, setHash] = useState<`0x${string}` | undefined>(undefined)

    // Wagmi Hooks START
    // const { switchChain } = useSwitchChain()
    const { address } = useAccount()
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
    const startTimeRef = useRef<number>(0)

    const setIsPolling = (value: boolean) => {
      isPollingRef.current = value
      if (value) {
        startTimeRef.current = Date.now()
      }
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

      if (Date.now() - startTimeRef.current > 20000) {
        stopPolling()
        toast({
          render: () => {
            return <CustomToast title="Transaction timeout" type={typeOptions.error} />
          },
          position: 'bottom',
        })
        resetState()
        onFinish?.()
        return
      }

      try {
        const res = await approveEvent({
          hash: hash as `0x${string}`,
          chain_id: currentWithdrawChain,
        })

        if (res.status === 1) {
          stopPolling()
          if (!isHandledRef.current) {
            console.log('setWriteContractSuccess')
            setIsHandled(true)
            verifyWithdrawEve()
            onFinish?.()
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
        pollingTimeoutRef.current = setTimeout(() => {
          pollStatus()
        }, 2000)
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
    const calculateTotalCost = (estimatedGas: bigint, currentGasPrice: bigint) => {
      return estimatedGas * currentGasPrice
    }

    const walletWithdraw = async () => {
      if (!currentChain) return
      setLoading(true)
      // try {
      //   await switchChain({ chainId: currentChain.id })
      // } catch (error) {
      //   toast({
      //     render: () => <CustomToast title="Switch chain failed" type={typeOptions.error} />,
      //     position: 'bottom',
      //   })
      //   resetState()
      //   return
      // }
      if (rewards.length === 0) {
        toast({
          render: () => {
            return <CustomToast title="No rewards" type={typeOptions.info} />
          },
          position: 'bottom',
        })
        resetState()
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
        resetState()
        return
      }
      const gasPrice = await getGasPrice(config, {
        chainId: currentChain.id as 1 | 56 | undefined,
      })

      const gasLimit = await estimateGas(config, {
        chainId: currentChain.id as 1 | 56 | undefined,
      })

      console.log(gasPrice, gasLimit)
      const balance =
        address && currentChain
          ? getBalance(config, {
              address: address,
              chainId: currentChain.id as 1 | 56 | undefined,
            })
          : null

      if (balance) {
        const res = await balance
        console.log('balance', res)
        const estimatedGas = gasLimit ? BigInt(Number(gasLimit) * 4) : 100000n
        let totalCost = calculateTotalCost(estimatedGas, gasPrice ? gasPrice : 1000000000n)
        if (res.value < totalCost) {
          toast({
            render: () => (
              <CustomToast title="Insufficient gas for withdrawal" type={typeOptions.error} />
            ),
            position: 'bottom',
          })
          resetState()
          return
        }
      }

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
            return <CustomToast title="Signature error" type={typeOptions.info} />
          },
          position: 'bottom',
        })
        resetState()
      }

      console.log('args', [
        BigInt(current_uid),
        `${address}` as `0x${string}`,
        rewards,
        BigInt(_deadline),
        signatures,
      ])

      const abiData = encodeFunctionData({
        abi,
        functionName: 'withdrawMultiToken',
        args: [
          BigInt(current_uid),
          `${address}` as `0x${string}`,
          rewards,
          BigInt(_deadline),
          signatures,
        ],
      })

      try {
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction', // or eth_sendTransaction
          params: [
            {
              from: address,
              to: contractAddress,
              chainId: chainId,
              data: abiData,
              gasLimit: (gasLimit ? BigInt(Number(gasLimit) * 4) : 100000n).toString(),
              gasPrice: gasPrice.toString(),
            },
          ],
        })
        console.log('window.ethereum.request', hash)
        setHash(hash)
      } catch (error) {
        setWriteContractApiError(true)
      }

      // writeContract({
      //   address: contractAddress as `0x${string}`,
      //   abi,
      //   functionName: 'withdrawMultiToken',
      //   chainId,
      //   args: [
      //     BigInt(current_uid),
      //     `${address}` as `0x${string}`,
      //     rewards,
      //     BigInt(_deadline),
      //     signatures,
      //   ],
      //   ...gasConfig,
      // })
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
      const hasWithdraw = currentWithdraw.length > 0 && currentWithdraw[0].withdraw_gifts > 0

      console.log('current reward', currentReward)

      return !(hasRewards || hasWithdraw)
    }, [currentChain, bscReward, ethReward, testReward, withdraw])

    useEffect(() => {
      if (receiptError || writeContractApiError) {
        console.log(receiptError, writeContractApiError)
        stopPolling()
        toast({
          render: () => {
            return <CustomToast title={'Failed'} type={typeOptions.error} />
          },
          position: 'bottom',
        })
        resetState()
        onFinish?.()
      }
    }, [receiptError, writeContractApiError])

    useEffect(() => {
      if (isConfirmed && !isHandledRef.current) {
        console.log('isConfirmed')
        setIsHandled(true)
        stopPolling()
        verifyWithdrawEve()
        onFinish?.()
      }
    }, [isConfirmed])

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
      refetchBscReward()
      refetchEthReward()
      refetchTestReward()
      resetState()
      toast({
        render: () => {
          return <CustomToast title={'Success'} type={typeOptions.success} />
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
      setHash(undefined)
      setIsHandled(false)
      setCurrentWithdrawChain(0)
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
            <h3 className="font-bold text-2xl mb-[10px] text-[24px] text-[#333]">
              Choose a network
            </h3>
            <div className="text-[15px] text-[#999] font-normal leading-tight">
              Your assets are on multiple networks. Please select one network you want to withdraw
              from.
            </div>
            <div className="flex items-center text-[16px] text-[#999] font-normal mt-9 mb-4">
              Available :&nbsp;<span className="text-[#333333]">{totalReward}</span>
            </div>

            {evmChainList.map((chain) => (
              <div
                key={chain.id}
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
                <span className="text-[20px] font-semibold text-[#333]">
                  {formatUSD(
                    withdraw.filter((item) => item.chain_id === chain.id)[0]?.withdraw_gifts,
                    true
                  )}
                </span>
              </div>
            ))}

            <div className="mt-7 mx-[18px] mb-[30px]">
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
