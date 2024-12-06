import { Box } from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import { accountdetailList } from '@/api';
import { useStore } from '@/store/store';
import { StarsIcon } from '@/assets/icons';
import Icon from '@/components/comm/Icon';

import { AccountdetailRes } from '@/types';
import Skeleton from '@/components/Skeketon/Skeleton'

const EarningsHistory = () => {
  const [searchParams] = useSearchParams();
  const rate = searchParams.get('exchange_rate');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const { token } = useStore((state) => ({
    token: state.token,
  }));
  const [data, setData] = useState<AccountdetailRes>({ accounts: [] });
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (rate) {
      setExchangeRate(Number(rate));
    }
  }, [rate]);

  const fetchAccounts = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await accountdetailList({
        page_num: pageNum,
        records: 20,
        type: 1,
      });
      if (res.accounts.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData) => ({
          ...prevData,
          accounts: [...prevData.accounts, ...res.accounts],
        }));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAccounts(1);
    }
  }, [token]);

  const fetchMoreData = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAccounts(nextPage);
    }
  };

  return (
    <div
      id="earningsScrollableDiv"
      className="fixed w-screen h-screen bg-[#FFF] z-10 overflow-auto scrollbar-hide px-[16px]"
    >
      <div className="flex justify-between">
        <h3 className="text-[20px] text-[#333] font-[700] mt-[24px]">History</h3>
      </div>
      <div className="pt-[16px]">
        <InfiniteScroll
          dataLength={data.accounts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <Box textAlign="center" m="20px 0" className="p-4">
              <Skeleton />
            </Box>
          }
          scrollableTarget="earningsScrollableDiv"
        >
          {data.accounts.map((item, key) => (
            <div className="flex justify-between py-[20px] border-b border-[#EBEBF4]" key={key}>
              <div>
                <h4 className="text-[16px] text-[#333]">Income</h4>
                <p className="text-[12px] text-[#999] mt-[12px]">
                  {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
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
        {loading && !hasMore && (
          <Icon
            name="icon-none_search"
            style={{ width: '164px', height: '164px', margin: 'auto' }}
          />
        )}
      </div>
    </div>
  );
};

export default EarningsHistory;
