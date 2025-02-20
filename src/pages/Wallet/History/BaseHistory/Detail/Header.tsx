import { TIcon } from '@/components/tmd'
import { IHistoryType } from '@/store/wallet/type'
import classNames from 'classnames'
import React, { useMemo } from 'react'

const Header = ({ tx }: { tx: IHistoryType }) => {
  const icon = useMemo(() => {
    switch (tx.status) {
      case 'success':
        return 'icon-kong'
      case 'failed':
      case 'fail':
        return 'icon-kong1'
      case 'pending':
        return 'icon-jiazai'
      default:
        return 'icon-kong'
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
        case 'fail':
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
      <i 
      className={classNames('mr-3 iconfont text-[24px]', icon, {
        'text-green': tx.status === 'success',
        'text-red2': tx.status === 'failed' || tx.status === 'fail',
        'text-orange animate-spin': tx.status === 'pending'
      })}></i>

      <span className="text-xl font-semibold text-b1">{text}</span>
    </div>
  )
}

export default Header
