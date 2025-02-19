import { ChainItemWithSwitch } from '@/pages/Wallet/Tokens/components/ChainItem'
import { TSearch as Search, TIcon } from '@/components/tmd'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import classnames from 'classnames'

interface SelectSendTokenPropsType {
  title: string
  tokens: AssetsToken[]
  onSearch: (val: string) => void
  onClick: (token: AssetsToken) => void
  emptyTips?: string
  classNames?: string
}
export default function SelectToken({
  title,
  tokens,
  onSearch,
  onClick,
  emptyTips,
  classNames = '',
}: SelectSendTokenPropsType) {
  return (
    <div className={classnames('flex h-full flex-col', classNames)}>
      <div className="select-title ml-[20px] mt-4">
        <span className="text-h3 font-semibold  text-t1">{title}</span>
      </div>
      <div className="select-search mx-[20px] mt-4">
        <Search
          type={'change'}
          onChange={(v) => {
            onSearch(v)
          }}
          placeholder={'Search token name or address'}
        />
      </div>
      <div className="no-scrollbar flex-1 overflow-scroll">
        <div className="select-token-list mx-6 mt-[12px] h-full">
          {tokens.length > 0 ? (
            tokens.map((token) => (
              <ChainItemWithSwitch
                key={token.id}
                token={token}
                icon={token.image}
                symbol={token.symbol}
                price={token.price}
                holderNum={Number(token.formatted)}
                onClick={() => onClick(token)}
              />
            ))
          ) : (
            <div className="-mt-[68px] h-full">
              {/* <TNoResult
                  className=" text-sm text-t3"
                  emptyText={emptyTips ?? 'No search result'}
                  type="list"
                /> */}
              <span>No search result</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
