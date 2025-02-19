import React from 'react'

import { InfiniteScroll } from 'antd-mobile'

type Props = {
  hasMore: boolean
  onRefresh: () => Promise<void>
  children: React.ReactNode
}
export function InfinteScrollToRefresh({
  children,
  onRefresh,
  hasMore
}: Props) {
  return (
    <>
      {children}
      <InfiniteScroll loadMore={onRefresh} hasMore={hasMore}>
        {hasMore && <span>...</span>}
      </InfiniteScroll>
    </>
  )
}
