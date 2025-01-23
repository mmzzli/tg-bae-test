import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@chakra-ui/react'
import { useAccount, useReadContract, useSwitchChain, useWriteContract } from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'

import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, RightIcon } from '@/assets/icons'
import { totalAvailableInvoice, verifyWithdraw, getTotalGifts, approveEvent } from '@/api'
import { useStore } from '@/store/store'
import { GiftsRes, totalAvailable } from '@/types'
import { formatUSD } from '@/utils/utils'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import ConnectModal from '@/components/Wallet/ConnectModal'
import RewardListModal from '@/components/Wallet/RewardListModal'
import { useRequest } from 'ahooks'

const Earnings = () => {
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
  const rewardRef = useRef<{ someMethod: () => void }>(null)
  const { address, chain, status } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: hash } = useWriteContract()
  const setNeedUpdateEarnings = useStore((state) => state.setNeedUpdateEarnings)
  const [totalGifts, setTotalGifts] = useState<GiftsRes>({
    gifts: 0,
    withdraw_gifts: 0,
    details: [],
  })
  const [writeContractSuccess, setWriteContractSuccess] = useState(false)
  const [writeContractError, setWriteContractError] = useState<any>(null)
  const { needUpdateEarnings } = useStore((state) => ({
    needUpdateEarnings: state.needUpdateEarnings,
  }))

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
      pollingInterval: 1200,
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

  const showRewardModal = () => {
    rewardRef.current?.someMethod()
  }

  const handleReward = async () => {
    console.log('status', status)
    console.log('address', address)
    console.log('chain', chain)
    if (status === 'disconnected') {
      connectModalRef.current?.someMethod()
    } else if (status !== 'connected') {
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
    toast({
      render: () => {
        return <CustomToast title={'success'} type={typeOptions.success} />
      },
      position: 'bottom',
    })
    setWriteContractSuccess(false)
    setWriteContractError(null)
    load()
  }

  useEffect(() => {
    if (writeContractSuccess) {
      verifyWithdrawEve()
    }
  }, [writeContractSuccess])

  const load = async () => {
    await updateEarnings()
    setNeedUpdateEarnings()
  }

  const updateEarnings = async () => {
    try {
      const [totalGiftsRes, availableInvoiceRes] = await Promise.all([
        getTotalGifts(),
        totalAvailableInvoice(),
      ])

      setTotalGifts(totalGiftsRes)
      setData(availableInvoiceRes)
    } catch (error) {
      console.error('Failed to fetch earnings data:', error)
      // 这里您可以添加错误处理，比如显示错误提示等
    }
  }

  useEffect(() => {
    if (!token) return
    load()
  }, [token])

  useEffect(() => {
    console.log(hash, 'talk')
    if (hash) {
      pollStatus()
    }
  }, [hash])

  useEffect(() => {
    if (needUpdateEarnings) {
      updateEarnings()
    }
  }, [needUpdateEarnings])

  useEffect(() => {
    switchChain({ chainId })
  }, [])
  return (
    <div
      className="px-4 fixed w-screen bg-[#fff] z-10 scrollbar-hide pt-6"
      id="scrollable"
      style={{
        height:
          'calc(100vh - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top))',
      }}
    >
      <h3 className="text-[#333] text-[20px]">Earnings</h3>
      <div className="text-center mt-12 mb-2">
        <h2 className="text-[#12122A] text-[40px]">
          {formatUSD(data.total * data.exchange_rate + totalGifts.gifts, true)}
        </h2>
        <p className="text-[#999] text-[14px] mt-2">Total earnings</p>
      </div>
      <div
        className="overflow-y-auto pb-10 scrollbar-hide"
        style={{ height: 'calc(100vh - 18rem)' }}
      >
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
                {formatUSD(data.total * data.exchange_rate, true)}
              </h5>
              <p className="flex gap-1">
                <span className="text-[#888] text-[14px]">{data.total}</span>
                <img src={StarsIcon} />
              </p>
            </li>
            <li>
              <p className="text-[#999] text-[12px]">Available to convert</p>
              <h5 className="text-[#000] text-[22px] my-4">
                {formatUSD(data.available * data.exchange_rate, true)}
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
                <h3 className="text-[#000] text-[22px] my-4">
                  {formatUSD(totalGifts.gifts, true)}
                </h3>
              </li>
              <li>
                <p className="text-[#999] text-[12px]">Available to withdraw</p>
                <h3 className="text-[#000] text-[22px] my-4">
                  {formatUSD(totalGifts.withdraw_gifts, true)}
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
                  text="Withdraw"
                  width="100%"
                  height="40px"
                  handler={() => {
                    showRewardModal()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <ConnectModal ref={connectModalRef} />
      <RewardListModal
        ref={rewardRef}
        totalReward={formatUSD(totalGifts.withdraw_gifts, true)}
        withdraw={totalGifts.details}
        onFinish={() => {
          load()
        }}
      />
    </div>
  )
}
export default Earnings
