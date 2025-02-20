import { TIcon } from '@/components/tmd'
import AdaptiveNumber, { NumberType } from '@/pages/Wallet/components/AdaptiveNumber'
import TokenImg from '@/pages/Wallet/components/TokenImg'
import { IHistoryType } from '@/store/wallet/type'
import { getBalance } from '@/store/wallet/util/tokenHelper'
import { useTokenStore } from '@/store/wallet/walletToken'
import classNames from 'classnames'
import { useEffect, useMemo } from 'react'
import { formatUnits } from 'viem'

const DetailTokenInfo = ({ tx }: { tx: IHistoryType }) => {
  const { tokenList } = useTokenStore()
  const fromToken = useMemo(() => {
    const token = getBalance(
      tokenList,
      tx.fromSwapTokens.token?.chainId ?? -1,
      tx.fromSwapTokens.token?.address ?? ''
    )
    return token || tx.fromSwapTokens.token
  }, [tx.fromSwapTokens.token.address])

  const toToken = useMemo(() => {
    const token = getBalance(
      tokenList,
      tx.toSwapTokens.token?.chainId ?? -1,
      tx.toSwapTokens.token?.address ?? ''
    )
    return token || tx.toSwapTokens.token
  }, [tx.toSwapTokens.token.address])

  const fromFormat = useMemo(() => {
    if (tx.source === 'OKX') {
      return tx.fromAmount
    }

    switch (tx.historyType) {
      case 'Receive':
        return tx.fromAmount ?? '0'
      case 'Swap':
      case 'Send':
      case 'Approve':
      default:
        return formatUnits(BigInt(tx.fromAmount ?? '0'), fromToken.decimals)
    }
  }, [fromToken.decimals, tx.fromAmount, tx.historyType])

  const toFormat = useMemo(() => {
    if (tx.source === 'OKX') {
      return tx.toAmount
    }

    switch (tx.historyType) {
      case 'Receive':
        return tx.toAmount ?? '0'
      case 'Swap':
      case 'Send':
      case 'Approve':
      default:
        return formatUnits(BigInt(tx.toAmount ?? '0'), toToken.decimals)
    }
  }, [toToken.decimals, tx.historyType, tx.toAmount])

  const swapRender = useMemo(() => {
    return (
      <>
        <div className="flex w-full items-center justify-between">
          <div className="flex">
            <TokenImg
              symbol={fromToken.symbol}
              image={fromToken.image}
              chainId={fromToken.chainId}
              isNative={fromToken.isNative}
              symbolSize={36}
              chainSize={16}
            />
          </div>
          <div className="flex flex-col items-end justify-center gap-[2px]">
            <div className="text-h1 font-semibold text-t1">
              -<AdaptiveNumber type={NumberType.BALANCE} value={fromFormat || 0} />{' '}
              <span className="text-t4">
                {fromToken.symbol.toLocaleUpperCase()}
              </span>
            </div>
            <div className="text-sm font-normal text-t3">
              <AdaptiveNumber
                type={NumberType.USD}
                value={Number(fromFormat) * fromToken.price}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-start pl-[6px]">
          <TIcon className="text-t3" fontSize="24" name="tg_wallet_reception" />
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex">
            <TokenImg
              symbol={toToken.symbol}
              image={toToken.image}
              chainId={toToken.chainId}
              isNative={toToken.isNative}
              symbolSize={36}
              chainSize={16}
            />
          </div>
          <div className="flex flex-col items-end justify-center gap-[2px]">
            <div className="text-h1 font-semibold text-green">
              +<AdaptiveNumber type={NumberType.BALANCE} value={toFormat} />{' '}
              <span className="text-t4">
                {toToken.symbol.toLocaleUpperCase()}
              </span>
            </div>
            <div className="text-sm font-normal text-t3">
              <AdaptiveNumber
                type={NumberType.USD}
                value={Number(toFormat) * toToken.price}
              />
            </div>
          </div>
        </div>
      </>
    )
  }, [fromFormat, fromToken, toFormat, toToken])

  return (
    <div
      className={classNames('mb-2 flex flex-col gap-3 py-6', {
        ' h-[216px]': tx.historyType === 'Swap'
      })}
    >
      {(() => {
        switch (tx.historyType) {
          case 'Swap':
            return swapRender
          default:
            return (
              <>
                <div className="m-auto mt-3 flex">
                  <TokenImg
                    symbol={fromToken.symbol}
                    image={fromToken.image}
                    chainId={fromToken.chainId}
                    isNative={fromToken.isNative}
                    symbolSize={51.69}
                    chainSize={23}
                  />
                </div>
                <div className="flex flex-col items-center justify-center gap-[2px]">
                  <div className="text-center text-3xl font-semibold text-b1">
                    {tx.historyType === 'Send' ? '-' : '+'}{' '}
                    <AdaptiveNumber
                      type={NumberType.BALANCE}
                      value={fromFormat || 0}
                    />{' '}
                    <span>{fromToken.symbol.toLocaleUpperCase()}</span>
                  </div>
                  {fromToken.price > 0 && (
                    <div className="text-sm font-normal text-t3">
                      <AdaptiveNumber
                        type={NumberType.USD}
                        value={Number(fromFormat) * fromToken.price}
                      />
                    </div>
                  )}
                </div>
              </>
            )
        }
      })()}
    </div>
  )
}

export default DetailTokenInfo
