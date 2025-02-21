import React, { FC, useState } from 'react'
import { Skeleton } from 'antd-mobile'
import { ChainItemWithSwitch } from './ChainItem'
import { CustomPullToRefresh } from '@/pages/Wallet/components/CustomPullToRefresh'
import { useStore } from '@/store'

const Cryptos: FC = () => {
  const { tokenList, isLoading, refreshTokenStore } = useStore((state) => {
    return {
      tokenList: state.tokenList,
      isLoading: state.isLoading,
      refreshTokenStore: state.refreshTokenStore,
    }
  })

  return (
    <>
      <h3 className="mt-2 h-12 flex items-center text-t1 text-[20px] leading-[1.4] font-semibold">
        Tokens
      </h3>

      <CustomPullToRefresh
        onRefresh={async () => {
          refreshTokenStore()
        }}
      >
        <div className={`flex w-full flex-1 flex-col gap-[8px] rounded-[16px]`}>
          <div className=" flex flex-1 flex-col">
            {isLoading ? (
              <Skeleton.Paragraph lineCount={6} animated className={`customSkeleton`} />
            ) : tokenList && tokenList.length > 0 ? (
              tokenList.map((token) => {
                return (
                  <ChainItemWithSwitch
                    token={token}
                    key={`${token?.source}-${token?.symbol}-${token?.chainId}-${token?.address}`}
                    icon={token.image || ''}
                    symbol={token.symbol}
                    price={token.price || 0}
                    recentPercent={token.customToken?.price_change_h24}
                    holderNum={Number(token.formatted ?? 0)}
                  />
                )
              })
            ) : (
              <div className="flex h-full items-center justify-center">
                <span>No data</span>
              </div>
            )}
          </div>
        </div>
      </CustomPullToRefresh>
    </>
  )
}

export default Cryptos
