import { useMemo } from 'react'
import { NumberFormatter } from '../../components/NumberFormatter'
import AdaptiveNumber, { NumberType } from '../../components/AdaptiveNumber'
import { shortenAddress } from '@/store/wallet/util'
import TokenImg from '../../components/TokenImg'
import { TIcon, TIconButton } from '@/components/tmd'
import chains from '@/store/wallet/chains'
import classNames from 'classnames'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'

const taprootAddressLength = 62

export const ChainItemWithSwitch = (props: {
  icon: string
  symbol: string
  price: number
  recentPercent?: number
  holderNum: number
  token?: AssetsToken
  showSwitch?: boolean
  hanldeSwitch?: (checked: boolean) => void
  checked?: boolean
  onClick?: () => void
  hideBalance?: boolean
}) => {
  const token = props?.token
  const isTaproot = (address: string | undefined) => {
    if (address) return address.length === taprootAddressLength
  }
  const evmETHFlag = useMemo(() => {
    return props.token?.symbol.includes('ETH') && !props.token?.address
  }, [props.token?.symbol, props.token?.address])

  const computedSymbol = useMemo(() => {
    return evmETHFlag ? 'ETH' : props.symbol
  }, [
    evmETHFlag,
    props.symbol,
    props?.token?.whiteToken?.display_name,
    props?.token?.customToken?.display_name,
  ])

  //TODO marketcup api not support balance
  const holdPriceDom = useMemo(() => {
    if (props.token?.formatted === '-') {
      return <></>
    }
    return (
      <div className="flex flex-col items-end justify-center gap-[2px]">
        <div className="h-[22px] text-base font-medium text-t1">
          {props.hideBalance ? (
            <span className="relative top-[2px]">*****</span>
          ) : (
            <AdaptiveNumber type={NumberType.BALANCE} value={props.holderNum} decimalSubLen={4} />
          )}
        </div>
        <div className="h-[17px] text-xs text-t2">
          {props.price > 0 && (
            <>
              {props.hideBalance ? (
                <span className="relative top-[2px]">*****</span>
              ) : (
                <AdaptiveNumber type={NumberType.USD} value={props.price * props.holderNum} />
              )}
            </>
          )}
        </div>
      </div>
    )
  }, [props])
  return (
    <div
      className={classNames('flex w-full cursor-pointer items-center py-[16px] overflow-hidden')}
      onClick={props.onClick}
    >
      <div className="flex flex-1 items-center justify-start overflow-hidden">
        <div className="relative mr-[10px]">
          <TokenImg
            symbol={token?.symbol ?? ''}
            image={token?.image}
            chainId={token?.chainId ?? -1}
            isNative={token?.isNative}
            symbolSize={36}
            chainSize={16}
          />
        </div>
        <div
          className={classNames(
            [props.showSwitch ? 'gap-[2px]' : 'gap-0'],
            'flex flex-1 flex-col overflow-hidden'
          )}
        >
          <div className="mb-[2px] block h-[22px] truncate text-base font-medium text-t1">
            {computedSymbol.toLocaleUpperCase()}
            {isTaproot(props.token?.address) && (
              <div className="ml-[4px] flex h-[18px] items-center rounded-[2px] bg-bg3 px-[4px] py-[2px] text-df text-t2">
                Taproot
              </div>
            )}
          </div>
          <div className="flex h-[17px] items-center gap-[4px]">
            {props.price > 0 && props.token?.formatted !== '-' ? (
              <div className="text-xs text-t2">
                <AdaptiveNumber type={NumberType.PRICE} value={props.price}></AdaptiveNumber>
              </div>
            ) : (
              <dd className="text-xs text-t2">
                {shortenAddress(props.token?.address ?? '') || '--'}
              </dd>
            )}

            {props.recentPercent ? (
              props.recentPercent > 0 ? (
                <span className="text-xs text-green">
                  <NumberFormatter
                    value={props.recentPercent}
                    suffix={'%'}
                    prefix={'+'}
                    tFixNum={2}
                    fixNum={2}
                  />
                </span>
              ) : (
                <span className="text-xs text-red">
                  <NumberFormatter
                    value={props.recentPercent}
                    suffix={'%'}
                    tFixNum={2}
                    fixNum={2}
                  />
                </span>
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      {holdPriceDom}
      {props.showSwitch ? (
        <div className="ml-[16px]">
          <TIconButton
            onClick={() => {
              props?.hanldeSwitch && props?.hanldeSwitch(props.checked || false)
            }}
          >
            {props.checked ? (
              <TIcon name="tg_wallet_Cancel-tokens" className="text-red" fontSize="20" />
            ) : (
              <TIcon name="tg_wallet_Adding-tokens" className="text-t1" fontSize="20" />
            )}
          </TIconButton>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
