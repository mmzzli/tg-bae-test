import React, { useMemo } from 'react'
import usePageOpen from '@/pages/Wallet/hooks/usePageOpen'
import useTransactionHash from '@/pages/Wallet/hooks/useTransactionHash'
import { IHistoryType } from '@/store/wallet/type'
import { getScanUrl } from '@/store/wallet/util/tokenHelper'
import { useStore } from '@/store'

const Link = ({ tx }: { tx: IHistoryType }) => {
  const webApp = usePageOpen()
  const walletUserInfo = useStore((state) => state.walletUserInfo)
  const { data: scanHash } = useTransactionHash({
    hash: tx.hash,
    chain: tx.fromSwapTokens?.chain,
    tonAddress: walletUserInfo.tonAddress,
  })
  const chainScanTxUrl = useMemo(() => {
    return getScanUrl({
      hash: scanHash,
      hashTest: '',
      chain: tx.fromSwapTokens?.chain,
    })
  }, [scanHash, tx.fromSwapTokens?.chain])

  const canClick = !!chainScanTxUrl && !!tx.hash

  return (
    <div
      className="mb-[41px] text-end text-blue underline"
      onClick={() => canClick && webApp.openLink(chainScanTxUrl)}
    >
      View on block explorer
    </div>
  )
}

export default Link
