import React, { FC, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AdaptiveNumber, { NumberType } from '../../components/AdaptiveNumber'
import { useTokenStore } from '@/store/wallet/walletToken'
import { IconWallet } from '@/components/tmd/icons/wallet'
import { IconArrowDown } from '@/components/tmd/icons/arrowDown'
import usePopup from '../../hooks/usePopup'
import clsx from 'clsx'
import WalletAddress from './WalletAddress'
import WalletMenus from './WalletMenus'

const WalletBtn = () => {
  const { setOpen, component, open } = usePopup({
    showCloseButton: true,
    content: <WalletAddress />,
  })

  return (
    <>
      {component}
      <button
        className="bg-bg3 rounded-[39px] pl-4 pr-3 py-2 flex items-center"
        onClick={() => setOpen(true)}
      >
        <IconWallet className="size-5" />
        <span className="ml-1.5">My wallet</span>
        <IconArrowDown
          className={clsx('ml-0.5 size-4 text-black transition-transform duration-300', {
            'rotate-180': open,
          })}
        />
      </button>
    </>
  )
}

const WalletHeader = () => {
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
    <div className="flex flex-col w-full items-center justify-between">
      <WalletBtn />

      <div className="flex items-center justify-center mt-[30px] w-full">
        <AdaptiveNumber
          value={totalBal}
          type={NumberType.USD}
          className="text-[40px] font-semibold leading-[1.2] text-t1"
        />
      </div>

      <WalletMenus className="mt-6" />

      <div className="rounded-lg bg-[#F7F9FC] px-3.5 py-3 w-full mt-6">
        <p className="text-[13px] text-b2 leading-normal font-normal">
          Only select EVM/BSC/Solana tokens are shown. Other tokens can’t be used here. We will soon
          support other tokens.
        </p>
      </div>
    </div>
  )
}

export default WalletHeader
