// import AdaptiveNumber, { NumberType } from '@/components/AdaptiveNumber'
// import { TCopy } from '@/components/tmd/copy'
// import { UsdFormatter } from '@/components/NumberFormatter'
// import { IWeb3ChainType, Web3Type } from '@/proviers/web3Provider/type'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { numberFormat } from '@/utils'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import BigNumber from 'bignumber.js'
// import { TIcon, TTokenImage } from '@/components/tmd'
import ConsmosMemo from './Memo'

// import FeeSelect, { FeeMode, getEvmFeeConfig, ModeFeesType } from '@/components/FeeSelect'
// import { solDecimals } from '@/config/sol'
// import usePopup from '@/hooks/popup/usePopup'
// import commonStore from '@/stores/commonStore'
// import { formatFees } from '@/utils/number'
import { useEffect, useMemo, useState } from 'react'
import { IWeb3ChainType, Web3Type } from '@/store/wallet/chainType'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { ChainGasFeesType } from '@/store/wallet/type'
import FeeSelect, { FeeMode, getEvmFeeConfig, ModeFeesType } from '../../components/FeeSelect'
import BigNumber from 'bignumber.js'
import { useCommonStore } from '@/store/wallet/walletCommon'
import { formatUnits } from 'viem'
import { formatFees } from '../utils/number'
import chains from '@/store/wallet/chains'
import AdaptiveNumber, { NumberType } from '../../components/AdaptiveNumber'
import { solDecimals } from '@/store/wallet/config/sol'
import { TCopy, TTokenImage } from '@/components/tmd'
import { numberFormat } from '@/components/tmd/utils/crypto'
import { IconArrowRight } from '@/components/tmd/icons/arrowRight'
import usePopup from '../../hooks/usePopup'

// import { ChainGasFeesType } from '@/hooks/api/chain'

interface ShowSendInfoType {
  amount: string
  chain: IWeb3ChainType
  fromAddress: string
  toAddress: string
  gasFeeRate: string
  gasPriceToken: number
  nativeToken: AssetsToken
  gasPriceUSD: string
  priorityFee?: string | null | undefined
  nativeTokenPrice?: number | undefined
  solPriorityFees?: ModeFeesType | undefined
  token: AssetsToken
  curChainId: number
  memoChange: (val: string) => void
  fees:
    | {
        Instant: ChainGasFeesType
        Average: ChainGasFeesType
        Fast: ChainGasFeesType
      }
    | undefined
}

function ListItem({
  title,
  children,
  className,
  np,
}: {
  title: string
  children: React.ReactNode
  className?: string
  np?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-[8px] ${
        np ? '' : 'py-[14px]'
      } ${className}`}
    >
      <div className="text-sm text-t3">{title}</div>
      <div className={`text-sm text-t1`}>{children}</div>
    </div>
  )
}

function ShowSendInfo({
  amount,
  chain,
  fromAddress,
  toAddress,
  gasFeeRate,
  gasPriceToken,
  nativeToken,
  gasPriceUSD,
  token,
  curChainId,
  priorityFee,
  solPriorityFees,
  nativeTokenPrice,
  fees,
  memoChange,
}: Partial<ShowSendInfoType>) {
  const defaultFontSize = 32
  const minFontSize = 16
  const subFontSize = 4
  const fontLength = (amount?.length ?? 0) + (token?.symbol?.length ?? 0)
  const priceUsd: string = new BigNumber(token?.price || '0')
    .multipliedBy(new BigNumber(amount || '0'))
    .toString()
  const fontSize = Math.max(defaultFontSize - Math.floor(fontLength / 4) * subFontSize, minFontSize)
  const [isFocus, setIsFocus] = useState(false)

  const { feeMode } = useCommonStore()

  const handleMemo = (val: string) => {
    memoChange && memoChange(val)
  }

  const onMemoFocus = () => setIsFocus(true)
  const onMemoBlur = () => setIsFocus(false)

  const evmFeeConfig = useMemo(() => {
    return getEvmFeeConfig({ chain: chain, type: 'Send' })
  }, [chain])

  const modeFees: ModeFeesType | undefined = useMemo(() => {
    try {
      if (evmFeeConfig) {
        const perBaseFee = Number(gasPriceToken) / evmFeeConfig[FeeMode.SLOW]

        switch (chain?.type) {
          case Web3Type.SOL:
            return solPriorityFees
          case Web3Type.EVM:
            if (fees && typeof nativeToken?.decimals === 'number') {
              const config: ModeFeesType = {
                [FeeMode.FAST]: 0,
                [FeeMode.SLOW]: 0,
                [FeeMode.AVERAGE]: 0,
              }
              Object.entries(fees).map(([k, val]) => {
                const key = k as FeeMode
                config[key] = Number(formatUnits(BigInt(val.fee), nativeToken?.decimals))
              })
              return config
            } else {
              return formatFees({
                [FeeMode.FAST]: (perBaseFee * evmFeeConfig[FeeMode.FAST] * 100) / 100,
                [FeeMode.SLOW]: (perBaseFee * evmFeeConfig[FeeMode.SLOW] * 100) / 100,
                [FeeMode.AVERAGE]: (perBaseFee * evmFeeConfig[FeeMode.AVERAGE] * 100) / 100,
              })
            }
            break
          default:
            return undefined
        }
      }
    } catch (error) {
      console.warn('sendModeFees', error)
    }
  }, [chain?.type, evmFeeConfig, fees, gasPriceToken, nativeToken?.decimals, solPriorityFees])

  const { component, setOpen } = usePopup({
    showCloseButton: true,
    fullscreen: true,
    title: 'Network Fee',
    content: (
      <FeeSelect
        modeFees={modeFees}
        onClose={() => {
          setOpen(false)
        }}
        nativeToken={nativeToken}
        chain={chain}
      />
    ),
  })

  const networkFeeSelectFee = useMemo(() => {
    if (chain?.type !== Web3Type.EVM || chain.id === chains.ethereum.id) {
      return (
        <ListItem title={'Network Fee'}>
          <div className={`flex flex-col items-end gap-[6px]`}>
            {/* {gasFeeRate ? <div>Fast {gasFeeRate}</div> : ''} */}
            {gasPriceToken ? (
              <div>
                <AdaptiveNumber
                  value={gasPriceToken || 0}
                  type={NumberType.BALANCE}
                  decimalSubLen={nativeToken?.decimals}
                  decimalFlag
                />
                &nbsp;{nativeToken?.symbol || '-'}
              </div>
            ) : (
              ''
            )}
            {
              <div className={`text-df`}>
                {gasPriceUSD ? (
                  <AdaptiveNumber
                    type={NumberType.USD}
                    value={Number(gasPriceUSD)}
                  ></AdaptiveNumber>
                ) : (
                  // <UsdFormatter value={Number(gasPriceUSD)} />
                  '0$'
                )}
              </div>
            }
          </div>
        </ListItem>
      )
    } else {
      const fee = gasPriceToken && modeFees && modeFees[feeMode]
      return (
        <ListItem title={'Network Fee'}>
          <div className="flex cursor-pointer items-center gap-[6px]" onClick={() => setOpen(true)}>
            <div className={`flex flex-col items-end gap-[4px]`}>
              {!!fee && <div className={``}>{feeMode}</div>}
              {fee ? (
                <div className="flex">
                  <AdaptiveNumber
                    value={fee || 0}
                    type={NumberType.BALANCE}
                    decimalSubLen={nativeToken?.decimals}
                    decimalFlag
                  />
                  {fee ? (
                    <div>
                      {nativeToken?.symbol}
                      &nbsp;
                    </div>
                  ) : (
                    ''
                  )}
                  (
                  {fee && nativeToken ? (
                    <AdaptiveNumber
                      type={NumberType.USD}
                      value={Number(fee * nativeToken.price)}
                    ></AdaptiveNumber>
                  ) : (
                    // <UsdFormatter value={Number(fee * nativeToken.price)} />
                    '0$'
                  )}
                  )
                </div>
              ) : (
                ''
              )}
            </div>
            <IconArrowRight className="text-t3 size-5" />
          </div>
        </ListItem>
      )
    }
  }, [chain?.id, chain?.type, feeMode, gasPriceToken, gasPriceUSD, modeFees, nativeToken, setOpen])

  const priorityFeeSelectFee = useMemo(() => {
    if (solPriorityFees) {
      const priorityFee = formatUnits(
        BigInt(solPriorityFees[feeMode] || 0),
        nativeToken?.decimals || 18
      )
      return (
        <ListItem title={'Priority fee'}>
          <div className="flex cursor-pointer items-center gap-[6px]" onClick={() => setOpen(true)}>
            <div className={`flex flex-col items-end gap-[4px]`}>
              {priorityFee && <div className={``}>{feeMode}</div>}
              {priorityFee ? (
                <div>
                  <AdaptiveNumber
                    value={priorityFee || 0}
                    type={NumberType.BALANCE}
                    decimalSubLen={nativeToken?.decimals}
                    decimalFlag
                  />
                  &nbsp;{nativeToken?.symbol || '-'}(
                  {nativeTokenPrice && solPriorityFees ? (
                    <AdaptiveNumber
                      type={NumberType.USD}
                      value={
                        Number(
                          formatUnits(
                            BigInt(solPriorityFees[feeMode] || 0),
                            chains.solana.chain?.nativeCurrency.decimals || solDecimals
                          )
                        ) * nativeTokenPrice
                      }
                    ></AdaptiveNumber>
                  ) : (
                    // <UsdFormatter
                    //   value={Number(
                    //     Number(
                    //       formatUnits(
                    //         BigInt(solPriorityFees[feeMode] || 0),
                    //         chains.solana.chain?.nativeCurrency.decimals ||
                    //           solDecimals
                    //       )
                    //     ) * nativeTokenPrice
                    //   )}
                    // />
                    '0$'
                  )}
                  )
                </div>
              ) : (
                ''
              )}
            </div>
            <IconArrowRight className="text-t3 size-5" />
          </div>
        </ListItem>
      )
    }
  }, [
    feeMode,
    nativeToken?.decimals,
    nativeToken?.symbol,
    nativeTokenPrice,
    setOpen,
    solPriorityFees,
  ])

  return (
    <>
      {component}
      <div
        className={` flex w-full flex-col items-center gap-[6px] border-b-[0.5px] border-b-l1 py-[16px] pb-[40px]`}
      >
        <TTokenImage
          size={56}
          className="rounded-full"
          symbol={token?.symbol}
          image={token?.image || ''}
        />
        <div className="mt-[12px] flex h-[32px] items-center justify-center font-[700]">
          <div
            className="text-right text-t1"
            style={{
              fontSize: `${fontSize}px`,
            }}
          >
            {amount}
          </div>
          <div
            className="ml-[8px] flex  items-center text-t1"
            style={{ fontSize: `${fontSize}px` }}
          >
            <span className="max-w-[160px] truncate">{token?.symbol}</span>
          </div>
        </div>
        <AdaptiveNumber className="text-base text-t2" value={priceUsd} type={NumberType.USD} />
      </div>
      <div className={'mt-[18px] w-full rounded-[8px]'}>
        {!isFocus && (
          <>
            <ListItem title={'Network Fee'}>
              <div className={`flex items-center gap-[6px] px-[8px] `}>
                <TTokenImage
                  size={16}
                  className="rounded-full"
                  symbol={chain?.name}
                  image={chain?.icon || ''}
                />
                <span>{chain?.name}</span>
              </div>
            </ListItem>
            <ListItem title={'From'}>
              <div className={`flex items-center gap-[12px]`}>
                <span className={`max-w-[170px] break-words text-right`}>{fromAddress}</span>
                <TCopy text={fromAddress ?? ''} />
              </div>
            </ListItem>
            <ListItem title="To">
              <div className={`flex items-center gap-[12px]`}>
                <span className={`max-w-[170px] break-words text-right`}>{toAddress}</span>
                <TCopy text={toAddress ?? ''} />
              </div>
            </ListItem>
            {networkFeeSelectFee}
            {priorityFeeSelectFee}
            <ListItem title="Total Amount">
              {token?.isNative ? (
                <AdaptiveNumber
                  value={(() => {
                    switch (chain?.type) {
                      case 'EVM':
                        return modeFees ? Number(amount) + modeFees[feeMode] : Number(amount)
                      case 'SOL':
                        return (
                          Number(amount) +
                          Number(gasPriceToken || 0) +
                          (priorityFee ? Number(priorityFee) : 0)
                        )
                      default:
                        return Number(amount) + Number(gasPriceToken || 0)
                    }
                  })()}
                  type={NumberType.BALANCE}
                  decimalSubLen={nativeToken?.decimals}
                  decimalFlag
                />
              ) : (
                numberFormat(Number(amount), 6)
              )}
              &nbsp;{token?.symbol}
            </ListItem>
          </>
        )}

        {chain?.id === chains.ton.id && (
          <ConsmosMemo memoChange={handleMemo} onBlur={onMemoBlur} onFocus={onMemoFocus} />
        )}
      </div>
    </>
  )
}

export default ShowSendInfo
