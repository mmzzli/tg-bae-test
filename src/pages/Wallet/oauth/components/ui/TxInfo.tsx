import { TCopy } from '@/components/tmd'
import { shortenAddress } from '@/store/wallet/util'
import { numberFormat } from '../../utils/helper'
import { Skeleton } from 'antd-mobile'

function ListItem({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
  className?: string
  np?: boolean
}) {
  return (
    <div className={`flex items-center justify-between gap-[8px] py-[8px]`}>
      <div className={`text-sm text-title/60`}>{title}</div>
      <div className={`text-sm text-black`}>{children}</div>
    </div>
  )
}

interface IProps {
  txInfo: {
    chainName: string
    chainIcon: string
    from: string
    to?: string
    value?: string
    tokenName: string
    feeInfo: string
    rawData?: string
  }
}

export function TxInfo(props: IProps) {
  const {
    txInfo: { chainName, chainIcon, from, to, value, feeInfo, tokenName, rawData },
  } = props
  return (
    <div className="mt-[20px] rounded-[12px] bg-[#F9F9F9]">
      <div className={'my-[20px] w-full rounded-[8px] bg-[#f9f9f9] px-[16px] py-[8px]'}>
        <ListItem title={'Network'}>
          <div className={`flex items-center gap-[4px] text-sm font-medium leading-[18px]`}>
            <span>{chainName}</span>
            {chainIcon && <img src={chainIcon} className={`size-[20px]`} alt="" />}
          </div>
        </ListItem>
        <div className={`my-[8px] h-px bg-gray-100`}></div>
        <ListItem title={'From'}>
          <div className={`flex items-center gap-[12px]`}>
            <span className={`max-w-[170px] break-words text-right`}>
              {shortenAddress(from || '', 8, 8)}
            </span>
          </div>
        </ListItem>
        {to ? (
          <>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'To'}>
              <div className={`flex items-center gap-[4px]`}>
                <span className={`max-w-[170px] break-words text-right`}>
                  {shortenAddress(to || '', 8, 8)}
                </span>
                <TCopy text={to ?? ''} />
              </div>
            </ListItem>
          </>
        ) : null}
        {value ? (
          <>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'Amount'}>
              <div className={`flex items-center gap-[4px]`}>
                <span className={`max-w-[170px] text-right`}>
                  <>
                    {numberFormat(value, 6)}
                    &nbsp;
                    {tokenName}
                  </>
                </span>
                <div></div>
              </div>
            </ListItem>
          </>
        ) : null}
        <div className={`my-[8px] h-px bg-gray-100`}></div>
        <ListItem title={'Network Fee'}>
          <div className={`flex flex-col items-end gap-[6px]`}>
            {!feeInfo ? <Skeleton animated className="h-[21px] w-[60px] rounded-full" /> : feeInfo}
          </div>
        </ListItem>
        {rawData ? (
          <>
            <div className={`my-[8px] h-px bg-gray-100`}></div>
            <ListItem title={'Raw Data'}>
              <div
                style={{
                  textOverflow: 'ellipsis',
                  width: 200,
                  overflow: 'hidden',
                }}
              >
                {rawData}
              </div>
            </ListItem>
          </>
        ) : null}
      </div>
    </div>
  )
}
