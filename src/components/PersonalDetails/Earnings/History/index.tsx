import dayjs from 'dayjs'
import { Tabs } from 'antd-mobile'
import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import InfiniteScroll from 'react-infinite-scroll-component'

import { useStore } from '@/store/store'
import { accountdetailList, getGiftHistory } from '@/api'

import Icon from '@/components/comm/Icon'
import Skeleton from '@/components/Skeketon/Skeleton'
import SubscriptCounting from '@/components/SubscriptCounting'

import { AccountdetailRes } from '@/types'
import { ChainToken, getTransactionLink } from '@/config/chainBlockBrowser'
import { useTMAUtils } from '@/hooks/useTMAUtils'

import { StarsIcon } from '@/assets/icons'
import './history.css'
import { formatDecimal, formatUSD } from '@/utils/utils'

const EarningsHistory = () => {
  const [searchParams] = useSearchParams()
  const { openLink } = useTMAUtils()

  const rate = searchParams.get('exchange_rate')
  const [exchangeRate, setExchangeRate] = useState<number>(0)
  const { token } = useStore((state) => ({
    token: state.token,
  }))
  const [data, setData] = useState<AccountdetailRes>({ accounts: [] })
  const [starsLoading, setStarsLoading] = useState(false)
  const [cryptoLoading, setCryptoLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [giftData, setGiftData] = useState<any[]>([])
  const [giftHasMore, setGiftHasMore] = useState(true)
  const [giftPage, setGiftPage] = useState(1)

  useEffect(() => {
    if (rate) {
      setExchangeRate(Number(rate))
    }
  }, [rate])

  const fetchAccounts = async (pageNum: number) => {
    if (starsLoading) return
    setStarsLoading(true)
    try {
      const res = await accountdetailList({
        page_num: pageNum,
        records: 20,
        type: 1,
      })
      if (res.accounts.length === 0) {
        setHasMore(false)
      } else {
        setData((prevData) => ({
          ...prevData,
          accounts: [...prevData.accounts, ...res.accounts],
        }))
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setStarsLoading(false)
    }
  }

  useEffect(() => {
    console.log('token', token)
    if (token) {
      fetchAccounts(1)
    }
  }, [token])

  const handleChange = (key: string) => {
    if (key === '1') {
      setPage(1)
      setHasMore(true)
      fetchAccounts(1)
      setGiftData([])
    } else {
      setData({ accounts: [] })
      setGiftPage(1)
      setGiftHasMore(true)
      fetchGiftHistory(1)
    }
  }

  const fetchGiftHistory = async (pageNum: number) => {
    if (cryptoLoading) return
    setCryptoLoading(true)
    try {
      const res = await getGiftHistory({ page_num: pageNum, records: 10 })
      if (res.gifts?.length === 0) {
        setGiftHasMore(false)
      } else {
        setGiftData((prevData) => [...prevData, ...res.gifts])
      }
    } catch (error) {
      console.error('Error fetching gift history:', error)
    } finally {
      setCryptoLoading(false)
    }
  }

  const fetchMoreGiftData = () => {
    if (giftHasMore && !cryptoLoading) {
      const nextPage = giftPage + 1
      setGiftPage(nextPage)
      fetchGiftHistory(nextPage)
    }
  }

  const fetchMoreData = () => {
    if (hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchAccounts(nextPage)
    }
  }

  const handleClick = (chainId: number, hash: string) => {
    const link = getTransactionLink(chainId, hash)
    openLink(link)
  }

  const TelegramStars = () => {
    return (
      <div
        className="overflow-y-auto"
        style={{
          height: 'calc(100vh - 164px)',
        }}
        id="starsScrollableDiv"
      >
        <InfiniteScroll
          dataLength={data.accounts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" m="0 0" className="p-4">
              <Skeleton childClassName="w-full h-[60px] m-[auto] mb-[20px]" />
            </Box>
          }
          scrollableTarget="starsScrollableDiv"
        >
          {data.accounts.map((item, key) => (
            <div
              className="flex justify-between py-[20px] border-b border-[#EBEBF4] last:border-b-0"
              key={key}
            >
              <div>
                <h4 className="text-[16px] text-[#333]">Income</h4>
                <p className="text-[12px] text-[#999] mt-[12px]">
                  {dayjs(item.created_at).format('MM/DD/YYYY HH:mm')}{' '}
                </p>
              </div>
              <div className="">
                <div className="flex gap-[4px]">
                  <h4 className="text-[20px] text-[#333]">+{item.coin_amount}</h4>
                  <img src={StarsIcon} alt="Stars Icon" />
                </div>
                <p className="text-[12px] text-[#666] text-right">
                  ${item.coin_amount * exchangeRate}
                </p>
              </div>
            </div>
          ))}
        </InfiniteScroll>
        {!starsLoading && data.accounts.length === 0 && (
          <Icon
            name="icon-search"
            style={{ width: '164px', height: '164px', margin: 'auto', marginTop: '30px' }}
          />
        )}
      </div>
    )
  }

  const Cryptos = () => {
    return (
      <div
        className="overflow-y-auto"
        style={{
          height: 'calc(100vh - 164px)',
        }}
        id="cryptoScrollableDiv"
      >
        <InfiniteScroll
          dataLength={giftData.length}
          next={fetchMoreGiftData}
          hasMore={giftHasMore}
          loader={
            <Box textAlign="center" m="0 0" className="p-4">
              <Skeleton childClassName="w-full h-[60px] m-[auto] mb-[20px]" />
            </Box>
          }
          scrollableTarget="cryptoScrollableDiv"
          scrollThreshold={0.8}
        >
          {giftData.map((item, index) => (
            <div
              key={index}
              className="py-[20px] border-b border-[#EBEBF4] last:border-b-0"
              onClick={() => handleClick(item.chain_id, item.hash)}
            >
              <ul className="flex justify-between items-center">
                <li>
                  <h4 className="text-[#12122A] text-[16px]">{item.source}</h4>
                  <p className="text-[#666] text-[12px]">
                    {item.source === 'Withdraw' ? 'to Tomo Wallet' : `from ${item.username}`}
                  </p>
                  <p className="text-[#999] text-[12px]">
                    {dayjs(item.created_at).format('MM/DD/YYYY HH:mm')}
                  </p>
                </li>
                <li className="text-right">
                  <h3
                    className="text-[16px]"
                    style={{
                      color: item.source === 'Withdraw' ? '#FF5596' : '#333',
                    }}
                  >
                    {item.source === 'Withdraw' ? '-' : '+'}
                    <SubscriptCounting className="pl-[5px]" amount={item.amount} />
                    <span className="pl-[5px]">{ChainToken[item.currency].symbol}</span>
                  </h3>
                  <p className="text-[#666] text-[12px]">{formatUSD(item.dollar)}</p>
                </li>
              </ul>
            </div>
          ))}
        </InfiniteScroll>
        {!cryptoLoading && giftData.length === 0 && (
          <Icon
            name="icon-search"
            style={{ width: '164px', height: '164px', margin: 'auto', marginTop: '30px' }}
          />
        )}
      </div>
    )
  }

  return (
    <div
      id="earningsScrollableDiv"
      className="fixed w-screen h-screen bg-[#FFF] z-10 scrollbar-hide px-[16px]"
    >
      <div className="flex justify-between">
        <h3 className="text-[20px] text-[#333] font-[700] mt-[24px]">History</h3>
      </div>
      <div className="mt-10">
        <Tabs defaultActiveKey="1" onChange={(key) => handleChange(key)} activeLineMode="fixed">
          <Tabs.Tab title="Telegram stars" key="1">
            <TelegramStars />
          </Tabs.Tab>
          <Tabs.Tab title="Cryptos" key="2">
            <Cryptos />
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  )
}

export default EarningsHistory
