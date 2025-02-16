import { ReactNode } from 'react'
import ListItem from './ListItem'
import { formatUnits } from 'viem'
import { Popover } from 'antd-mobile'
import { toastSvgs } from '@/assets'
import Container from './Container'
import Skeleton from './Skeleton'
import { useNavigate } from 'react-router-dom'
import { TokenData } from './types'
import { numberFormat } from '@/utils/oauth/helper'

function DescriptionOrRawData({
  transferData,
  tokenData,
  tokenInfo
}: {
  transferData: string
  tokenData: TokenData
  tokenInfo: {
    name: string
    symbol: string
    decimals: number
    image?: string
  }
}) {
  const navigator = useNavigate()
  if (tokenData?.function === 'transfer') return null
  /**
   * if can parse, show description else show raw data
   * https://qsg07xytt12z.sg.larksuite.com/wiki/TfJkwDqYYivrmHkN8qBlh998gNe?renamingWikiNode=false#share-MlvAdnYvaovlcSxBDgil4b1cg6g
   */
  const canParse = tokenData?.function === 'approve'
  return (
    <>
      <div className={`my-[8px] h-px bg-gray-100`}></div>
      {canParse ? (
        <ListItem title={'Description'}>
          {tokenData?.value && tokenInfo?.symbol ? (
            <div className="flex max-w-[170px] flex-col items-end text-right leading-[18px]">
              <div>
                <span className="text-[#FF288A]">Approve</span>{' '}
                {numberFormat(
                  formatUnits(
                    BigInt(tokenData?.value || 0),
                    tokenInfo.decimals
                  ),
                  6
                )?.toLowerCase()}
                &nbsp;
                {tokenInfo.symbol} to
              </div>
              <div className="w-[161px] truncate text-right">
                {tokenData.to}
              </div>
            </div>
          ) : (
            <div className={`flex max-w-[170px] flex-col gap-[3px]`}>
              <div className={`flex justify-end gap-[4px]`}>
                <span className="text-[#FF288A]">Approve</span>
                <Skeleton />
              </div>
              <Skeleton className="!w-[161px]" />
            </div>
          )}
        </ListItem>
      ) : (
        <ListItem
          title={
            <div className="flex items-center gap-[8px]">
              Raw Data
              <Popover
                // eslint-disable-next-line tailwindcss/no-custom-classname
                className="sign-transaction-raw-data-popover"
                content={`The smart contract data could
                not be parsed or identified.
                Use it at your own risk.`}
                trigger="click"
                placement="right"
              >
                <img
                  src={toastSvgs.toastWarningSvg}
                  className="size-[20px] cursor-pointer text-[#FFBA0A]"
                  alt=""
                />
              </Popover>
            </div>
          }
        >
          <div
            className="line-clamp-2 max-w-[198px] cursor-pointer break-all "
            onClick={() => {
              navigator('/oauth/raw-data', { state: transferData })
            }}
          >
            {transferData}
          </div>
        </ListItem>
      )}
    </>
  )
}
export default DescriptionOrRawData

export function RawData({
  rawData,
  footer
}: {
  rawData: string
  footer?: ReactNode
}) {
  return (
    <Container
      className="break-words"
      bodyClassName="min-h-[300px] !px-[12px] !py-[20px] text-[14px] text-[#333] leading-[18px]"
      title="Raw Data"
      footer={footer}
    >
      {rawData}
    </Container>
  )
}
