import React, { FC, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdaptiveNumber, { NumberType } from '../../components/AdaptiveNumber'
import { useTokenStore } from '@/store/wallet/walletToken'

const Icon = () => (
  <div className="relative flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#F8F8F8]">
    <i className="iconfont icon-notification-2-line text-[#333333]" style={{ fontSize: 24 }} />
  </div>
)

const WalletHeader = () => {
  const navigate = useNavigate()
  const { tokenList } = useTokenStore()

  const totalBal = useMemo(() => {
    return tokenList
      .map((token) => {
        return (token?.price || 0) * Number(token?.formatted ?? 0)
      })
      .reduce((accToken, curToken) => {
        return (accToken || 0) + curToken
      }, 0)
  }, [tokenList])

  return (
    <div className="flex flex-col h-[48px] w-full items-center justify-between px-[20px] py-[6px]">
      <div className="flex">
        <div className="flex items-center text-n2 font-bold text-t1">
          <AdaptiveNumber value={totalBal} type={NumberType.USD} />
        </div>
      </div>
      <div className="flex">
        <div className="flex cursor-pointer items-center justify-center">
          <div
            className="flex flex-col items-center justify-center gap-2"
            onClick={() => {
              navigate(`/send/select-token`)
            }}
          >
            <Icon />
            <span className="text-xs text-t1">Send</span>
          </div>
        </div>
        <div className="flex cursor-pointer items-center justify-center">
          <div
            className="flex flex-col items-center justify-center gap-2"
            onClick={() => {
              navigate(`/receive/select-token`)
            }}
          >
            <Icon />
            <span className="text-xs text-t1">Receive</span>
          </div>
        </div>
        <div className="flex cursor-pointer items-center justify-center">
          <div
            className="flex flex-col items-center justify-center gap-2"
            onClick={() => {
              navigate(`/receive/select-token`)
            }}
          >
            <Icon />
            <span className="text-xs text-t1">History</span>
          </div>
        </div>
      </div>
      <div>
        <span>Only select EVM/BSC/Solana tokens are shown. Other tokens can’t be used here. We will soon support other tokens.</span>
      </div>
    </div>
  )
}

export default WalletHeader
