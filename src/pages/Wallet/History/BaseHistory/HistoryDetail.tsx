import Header from './Detail/Header'
import DetailTokenInfo from './Detail/DetailTokenInfo'
import DetailInfo from './Detail/DetailInfo'
import Link from './Detail/Link'
import DetailButton from './Detail/DetailButton'
import classNames from 'classnames'
import useTransactions from '@/store/wallet/hooks/useTransactions'

const HistoryDetail = ({ hash }: { hash: string }) => {
  const { txsFlat, loading } = useTransactions({
    chain_id: -1,
    historyType: 'All',
    status: 'all'
  })
  const tx = txsFlat.find(
    (i) => i.hash.toLocaleUpperCase() === hash.toLocaleUpperCase()
  )

  if (!tx) {
    return (
      <div className="flex size-full items-center justify-center">
        {/* <Loading /> */}
        <span>...</span>
      </div>
    )
  }

  return (
    <div
      className={classNames('flex size-full flex-col', [
        window.Telegram?.WebApp?.isFullscreen
          ? window.Telegram?.WebApp?.platform === 'ios'
            ? '!h-[calc(100vh-118px)]'
            : '!h-[calc(100vh-110px)]'
          : ''
      ])}
    >
      <Header tx={tx} />
      <div className="no-scrollbar flex flex-1 flex-col overflow-y-auto">
        <DetailTokenInfo tx={tx} />
        <div className="my-[18px] h-px w-full bg-l1" />
        <DetailInfo tx={tx} />
        <Link tx={tx} />
        <DetailButton tx={tx} />
      </div>
    </div>
  )
}

export default HistoryDetail
