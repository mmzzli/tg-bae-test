import dayjs from 'dayjs'
import { Tabs, Swiper } from 'antd-mobile'
import { SwiperRef } from 'antd-mobile/es/components/swiper'
import { Box } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { animated, useSpring } from '@react-spring/web'

import { useStore } from '@/store/store'
import { accountdetailList, getGiftHistory } from '@/api'
import InfiniteScroll from 'react-infinite-scroll-component'
import loadingGif from '@/assets/loading.gif'
import { useSwipeBack } from '@/hooks/useSwipeBack'

import Icon from '@/components/comm/Icon'
import Skeleton from '@/components/Skeketon/Skeleton'
import { AccountdetailRes } from '@/types'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { ChainToken, getTransactionLink } from '@/config/chainBlockBrowser'
import './history.css'
import { StarsIcon } from '@/assets/icons'
import SubscriptCounting from '@/components/SubscriptCounting'
import { formatUSD } from '@/utils/utils'

interface CryptosProps {
  giftData: any[] // Replace 'any' with proper gift type if available
  fetchMoreGiftData: () => void
  giftHasMore: boolean
  cryptoLoading: boolean
  handleClick: (chainId: number, hash: string) => void
}

interface TelegramStarsProps {
  data: AccountdetailRes
  exchangeRate: number
  fetchMoreData: () => void
  hasMore: boolean
  starsLoading: boolean
}

const TelegramStars = ({
  data,
  exchangeRate,
  fetchMoreData,
  hasMore,
  starsLoading,
}: TelegramStarsProps) => {
  return (
    <div
      className="relative overflow-y-auto px-[20px]"
      style={{
        height: `calc(100vh - 164px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top) - var(--tg-safe-area-inset-bottom) - var(--tg-content-safe-area-inset-bottom) )`,
      }}
      id="starsScrollableDiv"
    >
      <InfiniteScroll
        dataLength={data.accounts.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Box textAlign="center" m="0 0" className="p-4">
            {/* <Skeleton childClassName="w-full h-[60px] m-[auto] mb-[20px]" /> */}
            <div className="flex items-center justify-center h-full pb-40 mt-[130px]">
              <i
                className="iconfont icon-loading animate-spin text-[#6254FF]"
                style={{ fontSize: '40px' }}
              />
            </div>
          </Box>
        }
        scrollableTarget="starsScrollableDiv"
        scrollThreshold={0.8}
        style={{
          overflow: 'visible',
        }}
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
                {formatUSD(item.coin_amount * exchangeRate, true)}
              </p>
            </div>
          </div>
        ))}
      </InfiniteScroll>
      {!starsLoading && data.accounts.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <Icon name="icon-search" style={{ width: '164px', height: '164px' }} />
        </div>
      )}
    </div>
  )
}

const Cryptos = ({
  giftData,
  fetchMoreGiftData,
  giftHasMore,
  cryptoLoading,
  handleClick,
}: CryptosProps) => {
  return (
    <div
      className="relative overflow-y-auto px-[20px]"
      style={{
        height: `calc(100vh - 164px - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top) - var(--tg-safe-area-inset-bottom) - var(--tg-content-safe-area-inset-bottom) )`,
      }}
      id="cryptoScrollableDiv"
    >
      <InfiniteScroll
        dataLength={giftData.length}
        next={fetchMoreGiftData}
        hasMore={giftHasMore}
        loader={
          <Box textAlign="center" m="0 0" className="p-4">
            {/* <Skeleton childClassName="w-full h-[60px] m-[auto] mb-[20px]" /> */}
            <div className="flex items-center justify-center h-full pb-40 mt-[130px]">
              <i
                className="iconfont icon-loading animate-spin text-[#6254FF]"
                style={{ fontSize: '40px' }}
              />
            </div>
          </Box>
        }
        scrollableTarget="cryptoScrollableDiv"
        scrollThreshold={0.8}
        style={{
          overflow: 'visible',
        }}
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
                  <span className="pl-[5px]">{ChainToken[item.currency]?.symbol}</span>
                </h3>
                <p className="text-[#666] text-[12px]">{formatUSD(item.dollar, false)}</p>
              </li>
            </ul>
          </div>
        ))}
      </InfiniteScroll>
      {!cryptoLoading && giftData.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <Icon name="icon-Empty_white_purchase" style={{ width: '164px', height: '164px' }} />
        </div>
      )}
    </div>
  )
}

const EarningsHistory = () => {
  const [searchParams] = useSearchParams()
  const { openLink } = useTMAUtils()
  const scrollRef = useRef<HTMLDivElement>(null)
  const { bind, x } = useSwipeBack({ scrollRef })

  const rate = searchParams.get('exchange_rate')
  const type = searchParams.get('type')

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
  const [activeKey, setActiveKey] = useState(() => (type === 'cryptos' ? '2' : '1'))
  const styles = useSpring({
    paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
    transform: x.to((x) => `translateX(${x}px)`),
  })
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
        records: 10,
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

  // useEffect(() => {
  //   if (token) {
  //     fetchAccounts(1)
  //   }
  // }, [token])

  const handleChange = (key: string) => {
    setActiveKey(key)
  }
  const tabItems = [
    { key: '0', title: 'Telegram stars' },
    { key: '1', title: 'Cryptos' },
  ]
  const swiperRef = useRef<SwiperRef>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    // 设置头部颜色
    window.Telegram?.WebApp?.setHeaderColor('#fff')

    if (token) {
      console.log(activeIndex)
      if (activeIndex === 0) {
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
  }, [activeIndex, token])

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

  return (
    // <animated.div
    //   {...bind()}
    //   ref={scrollRef}
    //   id="earningsScrollableDiv"
    //   className="fixed top-0 left-0 bottom-0 right-0 bg-[#FFF] z-10 scrollbar-hide"
    //   style={{
    //     paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
    //     transform: x.to((x) => `translateX(${x}px)`),
    //   }}
    // >
    <>
      <div className="flex justify-between px-[16px]">
        <h3 className="text-[20px] text-[#333] font-[700] mt-[24px]">History</h3>
      </div>
      <div className="mt-10">
        <Tabs
          defaultActiveKey="1"
          // activeKey={activeKey}
          // onChange={(key) => handleChange(key)}
          activeLineMode="fixed"
          // stretch={false}
          activeKey={tabItems[activeIndex].key}
          onChange={(key) => {
            const index = tabItems.findIndex((item) => item.key === key)
            setActiveIndex(index)
            swiperRef.current?.swipeTo(index)
          }}
        >
          {tabItems.map((item) => (
            <Tabs.Tab
              title={item.title}
              key={item.key}
              className={item.key === '0' ? `px-[18px]` : `px-[18px] ml-[30px]`}
            />
          ))}
        </Tabs>

        <Swiper
          direction="horizontal"
          loop
          indicator={() => null}
          ref={swiperRef}
          defaultIndex={activeIndex}
          onIndexChange={(index) => {
            console.log(index)
            setActiveIndex(index)
            // handleChange(String(index))
          }}
        >
          <Swiper.Item>
            <TelegramStars
              data={data}
              exchangeRate={exchangeRate}
              fetchMoreData={fetchMoreData}
              hasMore={hasMore}
              starsLoading={starsLoading}
            />
          </Swiper.Item>
          <Swiper.Item>
            <Cryptos
              giftData={giftData}
              fetchMoreGiftData={fetchMoreGiftData}
              giftHasMore={giftHasMore}
              cryptoLoading={cryptoLoading}
              handleClick={handleClick}
            />
          </Swiper.Item>
        </Swiper>

        {/* <Tabs
          defaultActiveKey="1"
          activeKey={activeKey}
          onChange={(key) => handleChange(key)}
          activeLineMode="fixed"
          stretch={true}
        >
          <Tabs.Tab title="Telegram stars" key="1" className="px-[18px]">
            <TelegramStars
              data={data}
              exchangeRate={exchangeRate}
              fetchMoreData={fetchMoreData}
              hasMore={hasMore}
              starsLoading={starsLoading}
            />
          </Tabs.Tab>
          <Tabs.Tab title="Cryptos" key="2" className="px-[18px] ml-[30px]">
            <Cryptos
              giftData={giftData}
              fetchMoreGiftData={fetchMoreGiftData}
              giftHasMore={giftHasMore}
              cryptoLoading={cryptoLoading}
              handleClick={handleClick}
            />
          </Tabs.Tab>
        </Tabs> */}
      </div>
    {/* </animated.div> */}
    </>
  )
}

export default EarningsHistory
