import React from 'react'

import { PullToRefresh } from 'antd-mobile'
import { sleep } from '@/store/wallet/util'
import loadingGif from '@/assets/loading.gif'

type Props = {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  onLoading?: (freshing: boolean) => void
}
export function CustomPullToRefresh({ children, onRefresh, onLoading }: Props) {
  const completeDelay = 500
  return (
    <PullToRefresh
      headHeight={60}
      completeDelay={completeDelay}
      onRefresh={async () => {
        onLoading?.(true)
        setTimeout(() => onLoading?.(false), completeDelay)
        const now = Date.now()
        await onRefresh()
        const duration = Date.now() - now

        if (duration < 1200) {
          await sleep(1200 - duration)
        }
      }}
      renderText={(status) => {
        return (<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <img
          style={{
            width: '58px',
          }}
          src={loadingGif}
          alt="loading"
        />
      </div>)
      }}
      threshold={16}
    >
      {children}
    </PullToRefresh>
  )
}
