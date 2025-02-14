import { TIcon } from '@/components/tmd'
import { IHistoryType } from '@/store/wallet/type'
import classNames from 'classnames'
import React, { useMemo } from 'react'

const Header = ({ tx }: { tx: IHistoryType }) => {
  const icon = useMemo(() => {
    switch (tx.status) {
      case 'success':
        return 'tg_wallet_finalize-linearly'
      case 'failed':
        return 'tg_wallet_fail-linearly'
      case 'pending':
        return 'tg_wallet_load'
      default:
        return 'tg_wallet_finalize-linearly'
    }
  }, [tx.status])

  const text = useMemo(() => {
    if (tx.historyType === 'Swap') {
      switch (tx.status) {
        case 'success':
          return "Swap successful"
        case 'failed':
          return "Swap failed"
        case 'pending':
          return "Pending..."
        default:
          return 'Swap Transaction'
      }
    } else {
      switch (tx.status) {
        case 'success':
          return "Successful"
        case 'failed':
          return "Failed"
        case 'pending':
          return "Pending..."
        default:
          return 'Transaction'
      }
    }
  }, [tx.historyType, tx.status])

  return (
    //  animate-breath
    <div
      className={classNames(
        'flex w-full items-center justify-center py-[10px] ',
        {
          ' animate-breath': tx.status === 'pending'
        }
      )}
    >
      <TIcon
        className={classNames('mr-3 ', {
          'text-green': tx.status === 'success',
          'text-red': tx.status === 'failed',
          'text-orange animate-spin': tx.status === 'pending'
        })}
        fontSize="24"
        name={icon}
      ></TIcon>
      <span className="text-xl font-semibold text-t1">{text}</span>
    </div>
  )
}

export default Header
