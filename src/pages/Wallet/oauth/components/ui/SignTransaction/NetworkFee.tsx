import { ReactNode, useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import ListItem from './ListItem'
import Container from './Container'
import { GasFeeStatus } from './const'
import { Skeleton } from 'antd-mobile'
import { NumberFormatter } from '@/components/NumberFormatter'
import { arrowSvgs } from '@/assets'
import reload from '@/assets/imgs/oauth/reload.svg'
import { deposit } from '@/utils/oauth/helper'

function NetworkFee({
  gasFeeStatus,
  goNetworkFee,
  gasFee,
  estimateGasFee,
  symbol,
  chainId
}: {
  gasFeeStatus: GasFeeStatus
  goNetworkFee: () => void
  gasFee: string
  estimateGasFee: () => void
  symbol: string
  chainId: number
}) {
  const GasFeeDom = useMemo(() => {
    return (
      <GasFee
        gasFee={gasFee}
        symbol={symbol}
        showArrow
        onClick={goNetworkFee}
      />
    )
  }, [gasFee, symbol, goNetworkFee])

  const GasFeeMap: Record<GasFeeStatus, ReactNode> = {
    [GasFeeStatus.UNKNOWN]: (
      <Skeleton animated className="h-[21px] w-[60px] rounded-full" />
    ),
    [GasFeeStatus.SUCCESS]: GasFeeDom,
    [GasFeeStatus.FAIL]: (
      <div className="flex text-[#ff2a8b]">
        <img
          src={reload}
          className="size-5 cursor-pointer pr-1"
          onClick={estimateGasFee}
        />
        unable to estimate
      </div>
    ),
    [GasFeeStatus.INSUFFICIENT_FUNDS]: (
      <div className="flex flex-col items-end gap-[6.5px]">
        {GasFeeDom}

        <Deposit chainId={chainId} symbol={symbol} />
      </div>
    ),

    [GasFeeStatus.CUSTOM]: GasFeeDom
  }

  return GasFeeMap[gasFeeStatus]
}

export default NetworkFee

export function GasFee({
  gasFee,
  symbol,
  showArrow,
  onClick
}: {
  gasFee: string
  symbol: string
  showArrow?: boolean
  onClick?: () => void
}) {
  if (!Number(gasFee)) return null
  return (
    <div
      className={`${showArrow ? 'cursor-pointer' : ''} flex items-center`}
      onClick={onClick}
    >
      <NumberFormatter value={gasFee} />
      &nbsp;
      {symbol}
      {showArrow && (
        <img
          src={arrowSvgs.rightNewSvg}
          className={`ml-[10px] size-[12px] cursor-pointer`}
        />
      )}
    </div>
  )
}

export function Deposit({
  chainId,
  address = '',
  canDeposit = true,
  symbol
}: {
  chainId: number
  address?: string
  symbol: string
  canDeposit?: boolean
}) {
  const goDeposit = useCallback(async () => {
    deposit({ chainId, tokenAddress: address })
  }, [address, chainId])
  return (
    <div className="flex text-[#FF288A]">
      {canDeposit && (
        <span
          onClick={goDeposit}
          className="mr-2 cursor-pointer rounded-[4px] border border-[#ff2a8b] bg-[#FF288A] px-[7px] py-px text-xs text-white"
        >
          Deposit
        </span>
      )}
      Out of {symbol}
    </div>
  )
}

export interface NetworkFeeProps {
  fee: string
  price: string | number
  limit: string | number
  symbol?: string
}
type IProps = NetworkFeeProps & {
  footer?: ReactNode
}
export function NetworkFeeDetail({
  fee,
  price,
  limit,
  symbol = 'ETH',
  footer
}: IProps) {
  return (
    <Container title="Network Fee" footer={footer}>
      <ListItem title={'Gas Price'}>
        <ItemWrap>
          <NumberFormatter
            value={String(convertGasWeiToGasGwei(String(price)))}
          />
          &nbsp;GWei
        </ItemWrap>
      </ListItem>
      <div className={`my-[8px] h-px bg-gray-100`}></div>
      <ListItem title={'Gas Limit'}>
        <ItemWrap>{limit}</ItemWrap>
      </ListItem>
      <div className={`my-[8px] h-px bg-gray-100`}></div>
      <ListItem title={<span className="font-[500] text-gray-1000">Fee</span>}>
        <ItemWrap>
          <GasFee gasFee={fee} symbol={symbol} />
        </ItemWrap>
      </ListItem>
    </Container>
  )
}

const ItemWrap = ({ children }: { children: ReactNode }) => (
  <div className="max-w-[170px] text-title">{children}</div>
)

export function NetworkFeeTag({
  gasFeeStatus
}: {
  gasFeeStatus: GasFeeStatus
}) {
  const tag = {
    [GasFeeStatus.SUCCESS]: 'fast',
    [GasFeeStatus.INSUFFICIENT_FUNDS]: '',
    [GasFeeStatus.CUSTOM]: 'custom',
    [GasFeeStatus.FAIL]: '',
    [GasFeeStatus.UNKNOWN]: ''
  }[gasFeeStatus]
  if (!tag) return null
  return (
    <div className="flex h-[16px] items-center justify-center rounded-[16px] bg-neutral4 px-[8px] text-[10px] font-[500] text-desc">
      {tag}
    </div>
  )
}

function convertGasWeiToGasGwei(gasWei: string) {
  const gwei = new BigNumber(gasWei)
  return gwei.dividedBy(1e9)
}
