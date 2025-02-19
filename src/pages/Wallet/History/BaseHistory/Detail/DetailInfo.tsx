import DetailInfoItem from './DetailInfoItem'
import dayjs from 'dayjs'
import { formatUnits } from 'viem'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IHistoryType } from '@/store/wallet/type'
import { shortenAddress } from '@/store/wallet/util'
import AdaptiveNumber, { NumberType } from '@/pages/Wallet/components/AdaptiveNumber'
import { numberFormat } from '@/components/tmd/utils/crypto'
import { getTransactionDetail } from '@/store/wallet/util/transaction/getTransactionDetail'
import useTransactions from '@/store/wallet/hooks/useTransactions'
import { getChainByChainId, getScanUrl } from '@/store/wallet/util/tokenHelper'
import usePageOpen from '@/pages/Wallet/hooks/usePageOpen'
import { useUserStore } from '@/store/wallet/walletUser'
import useTransactionHash from '@/pages/Wallet/hooks/useTransactionHash'

const DetailInfo = ({ tx }: { tx: IHistoryType }) => {
  const { updateTxs } = useTransactions({
    chain_id: -1,
    historyType: 'All',
    status: 'all'
  })

  const fromNativeTokenSymbol =
    tx.fromSwapTokens.chain?.chain?.nativeCurrency.symbol
  const fromToken = tx.fromSwapTokens.token
  const toToken = tx.toSwapTokens.token

  const gasInfoQuery = useQuery({
    queryKey: ['getTransactionDetail', JSON.stringify(tx)],
    queryFn: async () => {
      if (tx.gasAmount) {
        return {
          blocknumber: tx.blocknumber,
          endTime: tx.endTime,
          gasAmount: tx.gasAmount
        }
      } else {
        const data = await getTransactionDetail({
          hash: tx.hash,
          chainId: tx.fromSwapTokens.chain?.id,
          chainType: tx.fromSwapTokens.chain?.type
        })
        if (data) {
          const result = {
            blocknumber: data?.blocknumber || '',
            endTime: data?.timestamp,
            gasAmount: formatUnits(
              data?.gasAmount || 0n,
              getChainByChainId(tx.fromSwapTokens.chain?.id as number)?.chain
                ?.nativeCurrency.decimals as number
            )
          }
          const upTx: IHistoryType = {
            ...tx,
            ...result
          }
          updateTxs({ history: upTx })
          return result
        } else {
          return null
        }
      }
    }
  })

  const gasInfo = useMemo(
    () => tx.gasAmount || gasInfoQuery.data?.gasAmount,
    [gasInfoQuery.data?.gasAmount, tx.gasAmount]
  )

  const rateItem = useMemo(() => {
    if (tx.historyType === 'Swap') {
      let fromValue
      let toValue
      if (tx.source === 'OKX') {
        fromValue = tx.fromAmount
        toValue = tx.toAmount
      } else {
        fromValue = formatUnits(
          BigInt(tx.fromAmount ?? '0'),
          fromToken.decimals
        )
        toValue = formatUnits(BigInt(tx.toAmount ?? '0'), toToken.decimals)
      }
      const toValueCalc = Number(toValue) / Number(fromValue)
      return (
        <DetailInfoItem
          content={`1 ${fromToken.symbol.toLocaleUpperCase()} = ${numberFormat(
            toValueCalc
          )} ${toToken.symbol.toLocaleUpperCase()}`}
          title={"Rate"}
        ></DetailInfoItem>
      )
    }
  }, [fromToken, toToken, tx])

  const webApp = usePageOpen()
  const { walletUserInfo: user } = useUserStore()

  const { data: scanHash } = useTransactionHash({
    hash: tx.hash,
    chain: tx.fromSwapTokens?.chain,
    tonAddress: user.tonAddress
  })

  const chainScanTxUrl = useMemo(() => {
    return getScanUrl({
      hash: scanHash,
      hashTest: "",
      chain: tx.fromSwapTokens?.chain
    })
  }, [tx, scanHash])

  const canClick = !!chainScanTxUrl && !!tx.hash

  return (
    <div className="flex flex-col items-center justify-center">
      <DetailInfoItem
        isCopy
        content={tx.fromAddress}
        title={
          tx.historyType === 'Swap' ? (
            "Sending address"
          ) : (
            "From"
          )
        }
      ></DetailInfoItem>
      {tx.historyType !== 'Swap' && (
        <DetailInfoItem
          isCopy
          content={tx.toAddress}
          title={"To"}
        ></DetailInfoItem>
      )}
      <DetailInfoItem
        content={dayjs(tx.time).format('DD/MM/YYYY, HH:mm:ss')}
        title={"Date"}
      ></DetailInfoItem>
      <DetailInfoItem
        content={tx.historyType}
        title={"Type"}
      ></DetailInfoItem>
      <DetailInfoItem
        content={tx.fromSwapTokens.chain?.name}
        title={"Network"}
      ></DetailInfoItem>
      <DetailInfoItem
        content={
          Number(gasInfo) > 0 && gasInfo ? (
            <div>
              <AdaptiveNumber
                type={NumberType.BALANCE}
                value={gasInfo}
                decimalSubLen={18}
                decimalFlag
              ></AdaptiveNumber>{' '}
              {fromNativeTokenSymbol}(
              <AdaptiveNumber
                type={NumberType.USD}
                value={Number(gasInfo) * tx.fromSwapTokens.token.price}
              ></AdaptiveNumber>
              )
            </div>
          ) : (
            ''
          )
        }
        title={"Network fee"}
      ></DetailInfoItem>
      <DetailInfoItem
        isLine
        content={
          <div onClick={() => canClick && webApp.openLink(chainScanTxUrl)}>
            {shortenAddress(tx.hash, 6, 5)}
          </div>
        }
        isCopy
        title={"Txhash"}
        copyContent={tx.hash}
      ></DetailInfoItem>

      {rateItem}
    </div>
  )
}

export default DetailInfo
