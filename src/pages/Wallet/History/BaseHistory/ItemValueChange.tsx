import React, { useMemo } from 'react'
import { BaseHistoryType } from '.'
import { formatUnits, parseUnits } from 'viem'
import classNames from 'classnames'
import { IHistoryType } from '@/store/wallet/type'
import { TIcon } from '@/components/tmd'
import AdaptiveNumber, { NumberType } from '../../components/AdaptiveNumber'

const ItemValueChange = ({
  history,
  type
}: {
  history: IHistoryType
  type: BaseHistoryType
}) => {
  const fromToken = history.fromSwapTokens.token
  const toToken = history.toSwapTokens.token

  const fromFormat = useMemo(() => {
    if (history.source === 'OKX') {
      return history.fromAmount
    }
    switch (history.historyType) {
      case 'Receive':
      case 'Pay':
        return history.fromAmount
      case 'Swap':
      case 'Send':
      case 'Approve':
      default:
        return formatUnits(
          BigInt(history.fromAmount ?? '0'),
          fromToken.decimals
        )
    }
  }, [fromToken.decimals, history.fromAmount, history.historyType])

  const toFormat = useMemo(() => {
    if (history.source === 'OKX') {
      return history.toAmount
    }
    switch (history.historyType) {
      case 'Receive':
        return history.toAmount
      case 'Swap':
      case 'Send':
      case 'Approve':
      default:
        return formatUnits(BigInt(history.toAmount ?? '0'), toToken.decimals)
    }
  }, [history.historyType, history.toAmount, toToken.decimals])

  if (history.historyType === 'Approve') {
    return <></>
  }

  if (history.status === 'pending') {
    return (
      <div className="flex h-full animate-breath items-center ">
        <TIcon
          className="mr-1 animate-spin text-orange"
          fontSize="20"
          name="tg_wallet_load"
        />
        <span className="text-base font-medium text-orange">
          <span>Pending</span>
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-end justify-between overflow-hidden">
      <span
        className={classNames(
          'text-base font-medium w-full text-right overflow-hidden whitespace-nowrap text-ellipsis grow',
          {
            ' text-green':
              (history.historyType === 'Swap' ||
                history.historyType === 'Receive' ||
                history.historyType === 'Withdraw' ||
                history.historyType === 'Pay') &&
              history.status === 'success',
            ' text-red':
              (history.historyType === 'Swap' ||
                history.historyType === 'Receive' ||
                history.historyType === 'Withdraw' ||
                history.historyType === 'Pay') &&
              history.status === 'failed',
            ' text-t1': history.historyType === 'Send'
          }
        )}
        style={
          {
            // fontSize
          }
        }
      >
        {history.historyType === 'Swap' ||
        history.historyType === 'Receive' ||
        history.historyType === 'Withdraw' ||
        history.historyType === 'Pay'
          ? '+'
          : '-'}{' '}
        <AdaptiveNumber
          type={NumberType.BALANCE}
          value={toFormat}
          decimalSubLen={18}
          decimalFlag
        />{' '}
        {toToken.symbol.toLocaleUpperCase()}
      </span>
      {(history.historyType === 'Swap' || history.historyType === 'Pay') && (
        <label className="text-xs font-normal text-t3">
          -
          {history.historyType === 'Pay' ? (
            fromFormat
          ) : (
            <AdaptiveNumber
              type={NumberType.BALANCE}
              value={fromFormat || 0}
              decimalSubLen={18}
              decimalFlag
            />
          )}{' '}
          {fromToken.symbol.toLocaleUpperCase()}
        </label>
      )}
    </div>
  )
}

export default ItemValueChange
