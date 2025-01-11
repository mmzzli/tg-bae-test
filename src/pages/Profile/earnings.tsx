import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoolean, useToast } from '@chakra-ui/react'
import { parseUnits } from 'viem'
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  useEstimateFeesPerGas,
  useEstimateGas,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { supportEVMTokenList } from '@/config/wagmi-config'

import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, RightIcon } from '@/assets/icons'
import { totalAvailableInvoice, giftSign, verifyWithdraw, getTotalGifts, approveEvent } from '@/api'
import { useStore } from '@/store/store'
import { totalAvailable } from '@/types'
import { formatNumber } from '@/utils/utils'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import ConnectModal from '@/components/Wallet/ConnectModal'
import { useRequest } from 'ahooks'

interface RewardItem {
  amount: string | number
}

const Earnings = () => {
  console.log(supportEVMTokenList)
  const navigate = useNavigate()
  const toast = useToast()
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const [data, setData] = useState<totalAvailable>({
    available: 0,
    exchange_rate: 0,
    total: 0,
  })
  const connectModalRef = useRef<{ someMethod: () => void }>(null)
  const myTokensModalRef = useRef<{ someMethod: () => void }>(null)
  const { address, chain, status } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: hash, error, writeContract } = useWriteContract()
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()
  const setNeedUpdateEarnings = useStore((state) => state.setNeedUpdateEarnings)
  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()
  const [loading, setLiading] = useState(false)
  const [totalGifts, setTotalGifts] = useState({
    gifts: 0,
    withdraw_gifts: 0,
  })
  const [writeContractSuccess, setWriteContractSuccess] = useState(false)
  const [writeContractError, setWriteContractError] = useState<any>(null)

  const { run: pollStatus, cancel: stopPolling } = useRequest(
    async () => {
      const res = await approveEvent({ hash: hash as `0x${string}`, chain_id: chainId })
      if (res.status === 1) {
        stopPolling()
        setWriteContractSuccess(true)
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

  // 都先用主网
  const chainId = import.meta.env.VITE_APP_ENV === 'production' ? 56 : 56
  const contractAddress =
    import.meta.env.VITE_APP_ENV === 'production'
      ? `0x359E9Ef12132ea2a49701F838B5CdFbc13771AaF`
      : `0x359E9Ef12132ea2a49701F838B5CdFbc13771AaF`

  const { data: rewardByUidList, refetch } = useReadContract({
    abi,
    address: contractAddress as `0x${string}`,
    functionName: 'getRewardByUid',
    args: [BigInt(current_uid)],
  })

  const getTokenInfoByChainId = (chainId: number) => {
    return supportEVMTokenList.filter((token) => token.chainId === chainId)
  }

  const { error: receiptError } = useWaitForTransactionReceipt({
    hash,
  })

  const walletWithdraw = async () => {
    const tokenInfo = getTokenInfoByChainId(chainId)
    console.log(tokenInfo, rewardByUidList)
    if (!(rewardByUidList && rewardByUidList.length)) {
      toast({
        render: () => {
          return <CustomToast title="No balance" type={typeOptions.info} />
        },
        position: 'bottom',
      })
      return
    }

    const signatures: `0x${string}`[] = []
    const tokenAmounts: { token: `0x${string}`; amount: bigint }[] = []
    let _deadline = 0

    rewardByUidList.forEach(async (item) => {
      const { signature, deadline } = await giftSign({
        receiver: `${address}` as `0x${string}`,
        token: item.token as `0x${string}`,
        chainid: chainId,
        amount: Number(item.amount),
      })
      signatures.push(signature as `0x${string}`)
      tokenAmounts.push({
        token: item.token as `0x${string}`,
        amount: item.amount,
      })
      _deadline = deadline
    })

    setLiading(true)
    // const { signature, deadline } = await giftSign({
    //   receiver: `${address}` as `0x${string}`,
    //   token: token as `0x${string}`,
    //   chainid: chainId,
    //   amount: Number(amount),
    // })
    const args1 = [
      BigInt(current_uid),
      `${address}` as `0x${string}`,
      tokenAmounts,
      BigInt(_deadline),
      signatures,
    ]
    console.log(args1)

    const gasConfig =
      import.meta.env.VITE_APP_ENV === 'production'
        ? {}
        : {
            gas: BigInt(Number(gasLimit) * 3),
            maxFeePerGas: feesPerGas?.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
          }

    writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: 'withdrawMultiToken',
      chainId,
      args: [
        BigInt(current_uid),
        `${address}` as `0x${string}`,
        // token as `0x${string}`,
        // amount,
        tokenAmounts,
        BigInt(_deadline),
        signatures,
      ],
      ...gasConfig,
    })
  }

  const handleAfterConnect = () => {
    status === 'connected' && address && myTokensModalRef.current?.someMethod()
  }

  const handleReward = async () => {
    console.log('status', status)
    console.log('address', address)
    console.log('chain', chain)
    if (status === 'disconnected') {
      connectModalRef.current?.someMethod()
    } else if (status === 'connected') {
      myTokensModalRef.current?.someMethod()
    } else {
      toast({
        render: () => {
          return <CustomToast title="Connecting..." type={typeOptions.info} />
        },
        position: 'bottom',
      })
    }
  }

  const verifyWithdrawEve = async () => {
    await verifyWithdraw({
      from: address as `0x${string}`,
      chain_id: chainId,
      amount: totalGifts.gifts,
      hash: hash as `0x${string}`,
    })
    load()

    toast({
      render: () => {
        return <CustomToast title={'success'} type={typeOptions.success} />
      },
      position: 'bottom',
    })
    setLiading(false)
    setWriteContractSuccess(false)
    setWriteContractError(null)
  }

  useEffect(() => {
    if (writeContractSuccess) {
      verifyWithdrawEve()
    }
  }, [writeContractSuccess])

  useEffect(() => {
    if (error || receiptError || writeContractError) {
      console.log(error || receiptError || writeContractError)
      toast({
        render: () => {
          return <CustomToast title={'Failed'} type={typeOptions.error} />
        },
        position: 'bottom',
      })
      setLiading(false)
    }
  }, [error, receiptError, writeContractError])

  const load = async () => {
    const totalRes = await getTotalGifts()
    setTotalGifts(totalRes)
    const res = await totalAvailableInvoice()
    setData(res)
    setNeedUpdateEarnings()
  }

  useEffect(() => {
    if (!token) return
    load()
  }, [token])

  useEffect(() => {
    if (hash) {
      pollStatus()
    }
  }, [hash])
  return (
    <div
      className="px-4 fixed w-screen bg-[#fff] z-10 scrollbar-hide pt-6"
      id="scrollable"
      style={{ height: 'calc(100vh - 3rem - var(--tg-safe-area-inset-top))' }}
    >
      <h3 className="text-[#333] text-[20px]">Earnings</h3>
      <div className="text-center mt-12 mb-2">
        <h2 className="text-[#12122A] text-[40px]">
          ${formatNumber(data.total * data.exchange_rate + totalGifts.gifts)}
        </h2>
        <p className="text-[#999] text-[14px] mt-2">Total earnings</p>
      </div>
      <div className="overflow-y-auto pb-10" style={{ height: 'calc(100vh - 18rem)' }}>
        <div className="flex justify-between items-center mt-12">
          <h4 className="text-[#333] text-[16px]">Telegram stars</h4>
          <div
            className="flex gap-2"
            onClick={() => navigate(`/profile/earningsHistory?exchange_rate=${data.exchange_rate}`)}
          >
            <p className="text-[#666] text-[14px]">History</p>
            <img className="mt-[2px]" src={RightIcon} />
          </div>
        </div>
        <div className="bg-[#F7F9FC] px-6 pt-9 pb-6 mt-3 rounded-lg">
          <ul className="flex justify-between items-center">
            <li>
              <p className="text-[#999] text-[12px]">Total stars earned</p>
              <h5 className="text-[#000] text-[22px] my-4">
                ${formatNumber(data.total * data.exchange_rate)}
              </h5>
              <p className="flex gap-1">
                <span className="text-[#888] text-[14px]">{data.total}</span>
                <img src={StarsIcon} />
              </p>
            </li>
            <li>
              <p className="text-[#999] text-[12px]">Available to convert</p>
              <h5 className="text-[#000] text-[22px] my-4">
                ${formatNumber(data.available * data.exchange_rate)}
              </h5>
              <p className="flex gap-1">
                <span className="text-[#888] text-[14px]">{data.available}</span>
                <img src={StarsIcon} />
              </p>
            </li>
          </ul>
          <div className="px-3">
            <BaseButton
              className="mt-5"
              text="Withdraw"
              width="100%"
              height="40px"
              handler={() => {
                toast({
                  render: () => {
                    return <CustomToast title="coming soon" type={typeOptions.warning} />
                  },
                  position: 'bottom',
                })
                // toggle()
              }}
            />
          </div>
        </div>
        <div className="mt-7">
          <div className="flex justify-between items-center">
            <h4 className="text-[#333] text-[16px]">Cryptos</h4>
            <div
              className="flex gap-2"
              onClick={() =>
                navigate(
                  `/profile/earningsHistory?exchange_rate=${data.exchange_rate}&type=cryptos`
                )
              }
            >
              <p className="text-[#666] text-[14px]">History</p>
              <img className="mt-[2px]" src={RightIcon} />
            </div>
          </div>
          <div className="bg-[#F7F9FC] px-5 py-5 mt-3 rounded-lg">
            <ul className="flex justify-between items-center">
              <li>
                <p className="text-[#999] text-[12px]">Cryptos received</p>
                <h3 className="text-[#000] text-[22px] my-4">${formatNumber(totalGifts.gifts)}</h3>
              </li>
              <li>
                <p className="text-[#999] text-[12px]">Available to withdraw</p>
                <h3 className="text-[#000] text-[22px] my-4">
                  ${formatNumber(totalGifts.withdraw_gifts)}
                </h3>
              </li>
            </ul>
            <div className="px-3">
              {status === 'disconnected' ? (
                <BaseButton
                  className="mt-5"
                  text="Connect wallet"
                  width="100%"
                  height="40px"
                  handler={() => {
                    handleReward()
                  }}
                />
              ) : (
                <BaseButton
                  className="mt-5"
                  text="Launch wallet to withdraw"
                  width="100%"
                  height="40px"
                  loading={loading}
                  handler={() => {
                    walletWithdraw()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConnectModal ref={connectModalRef} afterConnect={handleAfterConnect} />
    </div>
  )
}
export default Earnings
