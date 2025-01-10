import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoolean, useToast } from '@chakra-ui/react'
import { parseUnits } from 'viem'
import { useAccount, useReadContract, useSwitchChain, useWriteContract, useEstimateFeesPerGas, useEstimateGas } from 'wagmi'
import { abi } from '@/config/abi'
import { useTMAUtils } from '@/hooks/useTMAUtils'
// import {
//   useEstimateFeesPerGas,
//   useEstimateGas,
//   useSwitchChain,
//   useWaitForTransactionReceipt,
//   useWriteContract,
// } from 'wagmi'

import BaseButton from '@/components/BaseButton/BaseButton'
import { StarsIcon, RightIcon } from '@/assets/icons'
import { totalAvailableInvoice, giftSign } from '@/api'
import { useStore } from '@/store/store'
import { totalAvailable } from '@/types'
import { formatNumber } from '@/utils/utils'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import ConnectModal from '@/components/Wallet/ConnectModal'

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
  const myTokensModalRef = useRef<{ someMethod: () => void }>(null)
  const { address, chain, status } = useAccount()
  const { switchChain } = useSwitchChain()
  const { data: hash, error, writeContract } = useWriteContract()
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const { data: gasLimit } = useEstimateGas()
  const { data: feesPerGas } = useEstimateFeesPerGas()

  const { data: rewardByUid } = useReadContract({
    abi,
    address: `0xF165cFb92441544cF9DEF72427028Db85b0aDEe2` as `0x${string}`,
    functionName: 'getRewardByUid',
    args:[BigInt(current_uid)]
  })
  console.log(rewardByUid)

  const walletWithdraw = async () => {
    console.log(parseUnits("2", 18))
    switchChain(
      {
        chainId: 97,
      },
      {
        onSuccess: async () => {

          const {signature, deadline} = await giftSign({
            receiver: `${address}` as `0x${string}`,
            token:  `0x0000000000000000000000000000000000000000` as `0x${string}`,
            chainid:  97,
            amount:  Number(parseUnits("2", 18))
          })

          writeContract({
            address: `0xF165cFb92441544cF9DEF72427028Db85b0aDEe2` as `0x${string}`,
            abi,
            functionName: 'withdrawToken',
            args:[
              BigInt(current_uid),
              `${address}` as `0x${string}`,
              `0x0000000000000000000000000000000000000000` as `0x${string}`,
              parseUnits("2", 18),
              BigInt(deadline),
              signature as `0x${string}`
            ],
            gas: gasLimit,
            maxFeePerGas: feesPerGas?.maxFeePerGas,
            maxPriorityFeePerGas: feesPerGas?.maxPriorityFeePerGas,
          })

        }
      }
    )
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

  useEffect(() => {
    if (!token) return
    const load = async () => {
      const res = await totalAvailableInvoice()
      setData(res)
    }
    load()
  }, [token])
  return (
    <div
      className="px-4 fixed w-screen h-screen bg-[#fff] z-10 overflow-auto scrollbar-hide pb-10 pt-6"
      id="scrollable"
    >
      <h3 className="text-[#333] text-[20px]">Earnings</h3>
      <div className="text-center mt-12">
        <h2 className="text-[#12122A] text-[40px]">${formatNumber(data.total * data.exchange_rate)}</h2>
        <p className="text-[#999] text-[14px] mt-2">Total earnings</p>
      </div>
      <div className="flex justify-between items-center mt-12">
        <h4 className="text-[#333] text-[16px]">Telegram stars</h4>
        <div className='flex gap-2'
          onClick={() =>
            navigate(`/profile/earningsHistory?exchange_rate=${data.exchange_rate}`)
          }
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
            <p className="text-[#888] text-[12px]">
              {data.total}⭐️
            </p>
          </li>
          <li>
            <p className="text-[#999] text-[12px]">Total stars earned</p>
            <h5 className="text-[#000] text-[22px] my-4">
              ${formatNumber(data.available * data.exchange_rate)}
            </h5>
            <p className="text-[#888] text-[12px]">
              {data.available}⭐️
            </p>
          </li>
        </ul>
        <div className='px-3'>
          <BaseButton
            className='mt-5'
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
      <div className='mt-7'>
        <div className="flex justify-between items-center">
          <h4 className="text-[#333] text-[16px]">Tomo wallet</h4>
          <div className='flex gap-2'>
            <p className="text-[#666] text-[14px]">History</p>
            <img className="mt-[2px]" src={RightIcon} />
          </div>
        </div>
        <div className="bg-[#F7F9FC] px-5 py-5 mt-3 rounded-lg">
          <p className='text-[#999] text-[12px]'>Cryptos received</p>
          <h3 className='text-[#000] text-[22px] my-4'>$0.00</h3>
          <p className='text-[#666] text-[12px]'>This shows the estimated total value of crypto you received from others, subject to market fluctuations.</p>
          <div className='px-3'>
            {status === 'disconnected' ? <BaseButton
              className='mt-5'
              text="Connect wallet"
              width="100%"
              height="40px"
              handler={() => {
                handleReward()
              }}
            /> :
              <BaseButton
                className='mt-5'
                text="Lauch wallet to withdraw"
                width="100%"
                height="40px"
                handler={() => {
                  // toast({
                  //   render: () => {
                  //     return <CustomToast title="coming soon" type={typeOptions.warning} />
                  //   },
                  //   position: 'bottom',
                  // })
                  walletWithdraw()
                }}
              />
            }
          </div>
        </div>
      </div>
      <ConnectModal ref={connectModalRef} afterConnect={handleAfterConnect} />
    </div>
  )
}
export default Earnings
