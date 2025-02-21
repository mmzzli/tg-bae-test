import React, { useMemo } from 'react'
// import classNames from 'classnames'
import TokenImg from '../../components/TokenImg'
import { IHistoryType } from '@/store/wallet/type'
import { shortenAddress } from '@/store/wallet/util'
// import { TIcon } from '@/components/tmd'
import { getBalance } from '@/store/wallet/util/tokenHelper'
import { IconContract } from '@/components/tmd/icons/contract'
import { useStore } from '@/store'

const ItemTokenSymbol = ({ history }: { history: IHistoryType }) => {
  const tokenList = useStore((state) => state.tokenList)
  const fromToken = useMemo(() => {
    const token = getBalance(
      tokenList,
      history.fromSwapTokens.token?.chainId ?? -1,
      history.fromSwapTokens.token?.address ?? ''
    )
    return token || history.fromSwapTokens.token
  }, [JSON.stringify(history?.fromSwapTokens?.token)])

  const toToken = useMemo(() => {
    const token = getBalance(
      tokenList,
      history.toSwapTokens.token?.chainId ?? -1,
      history.toSwapTokens.token?.address ?? ''
    )
    return token || history.toSwapTokens.token
  }, [JSON.stringify(history?.toSwapTokens?.token)])

  const tokenSymbol = useMemo(() => {
    switch (history.historyType) {
      case 'Swap':
      case 'Pay':
        return (
          <>
            <div className="flex">
              <TokenImg
                symbol={fromToken.symbol}
                image={fromToken.image}
                chainId={fromToken.chainId}
                isNative={true}
                symbolSize={32}
                chainSize={16}
                hideChainImg
              />
            </div>
            <div className="absolute left-[14px] flex">
              <TokenImg
                symbol={toToken.symbol}
                image={toToken.image}
                chainId={toToken.chainId}
                isNative={true}
                symbolSize={32}
                chainSize={16}
                hideChainImg
              />
            </div>
          </>
        )
      case 'Receive':
      case 'Send':
        return (
          <div className="flex w-full justify-center">
            <div className="relative">
              <TokenImg
                symbol={fromToken.symbol}
                image={fromToken.image}
                chainId={fromToken.chainId}
                isNative={!fromToken.address}
                symbolSize={36}
              />
              {/* <div
                className={classNames(
                  'absolute size-4 rounded-full flex items-center justify-center border border-bg1 -right-1 -bottom-1 ',
                  {
                    ' bg-green ': history.historyType === 'Receive',
                    ' bg-red ': history.historyType === 'Send'
                  }
                )}
              >
                <TIcon
                  className="m-auto text-white"
                  fontSize="10"
                  name={
                    history.historyType === 'Receive'
                      ? 'tg_wallet_reception'
                      : 'tg_wallet_sent'
                  }
                />
              </div> */}
            </div>

            {/*  */}
          </div>
        )
      case 'Approve':
      case 'Withdraw': {
        if (toToken && (history.toAmount || history.fromAmount)) {
          return (
            <div className="flex w-full justify-center">
              <div className="relative">
                <TokenImg
                  symbol={fromToken.symbol}
                  image={fromToken.image}
                  chainId={fromToken.chainId}
                  isNative={!fromToken.address}
                  symbolSize={36}
                />
              </div>
            </div>
          )
        }
        return (
          <div className="flex w-full justify-center">
            <div className="relative">
              <div className="relative flex size-9 flex-none items-center justify-center rounded-full bg-bg3">
                <IconContract className="size-5" />
                {/* <TIcon
                  className="m-auto text-white dark:text-black"
                  fontSize="20"
                  name="tg_wallet_address"
                /> */}
              </div>
            </div>
          </div>
        )
      }
      default:
        break
    }
  }, [fromToken, history, toToken])
  return (
    <div className="flex items-center">
      <div className="relative mr-2 flex min-w-[46px]">{tokenSymbol}</div>
      <div className="flex flex-col">
        <span className="text-base font-medium text-t1">
          {history.historyType === 'Swap'
            ? fromToken.chainId === toToken.chainId
              ? history.historyType
              : 'Cross-chain Swap'
            : history.historyType}

          {history.status === 'fail' || history.status === 'failed' ? (
            <div className="px-[4px] py-[2px] ml-[4px] inline-block border-[1px] border-red2 text-red2 font-normal text-xs rounded-[4px] scale-[0.8]">
              <i className="iconfont icon-kong text-red2 text-[12px]"></i>
              <span className="ml-[4px]">Fail</span>
            </div>
          ) : null}
        </span>
        <div className="flex items-center text-xs font-normal text-b2">
          {history.historyType === 'Receive'
            ? 'from'
            : history.historyType === 'Send' || history.historyType === 'Withdraw'
              ? 'to'
              : ''}{' '}
          &nbsp;
          {shortenAddress(
            history.historyType === 'Receive'
              ? history.fromAddress
              : history.historyType === 'Send' || history.historyType === 'Withdraw'
                ? history.toAddress
                : history.hash,
            6,
            4
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemTokenSymbol
