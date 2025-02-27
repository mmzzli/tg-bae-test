import ResourceList from '../ResourceList/ResourceList';
import useCacheVideo, { useAllFeaturedList } from '@/store/hook/useResourceList';
import PostSkeleton from '../Skeketon/PostSkeleton';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Box, HStack, IconButton, useBoolean, Text, useToast } from '@chakra-ui/react'

import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { useStore } from '@/store';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from '@/utils/chat/schedulers';
import { getVoteDetail, postVote } from '@/api';
import { cn } from '@/utils/utils'
import { MP4_REGEX } from '@/utils/constants';

interface PostListProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface VoteItem {
  sort: string;
  username: string;
  amount: number;
  is_vote: boolean
  uid: number
}

interface VoteDetail {
  title?: string;
  vote?: VoteItem[];
  media?: any[];
  is_end?: boolean
}


const JKFCampaignList = ({ containerRef }: PostListProps) => {
  const { list, hasMore, fetchMoreData } = useAllFeaturedList();
  const [isLoading, setIsLoading] = useState(true)
  const token = useStore((state) => state.token);

  const [voteDetail, setVoteDetail] = useState<VoteDetail>({});

  const parentRef = containerRef || useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 500,
    overscan: 5,
  });

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const handleContainerScroll = debounce(() => {
      if (
        container.scrollHeight - container.scrollTop - container.clientHeight < 50
      ) {
        fetchMoreData();
      }
    }, 100);

    container.addEventListener('scroll', handleContainerScroll);
    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
    };
  }, [containerRef, fetchMoreData]);

  const loadVoteDetail = async () => {
    const res = await getVoteDetail();
    if (res.media) {
      res.media = res.media.map(({ post, user }: any) => ({
        ...user,
        ...post,
        media: post.type === 1 && typeof post.media === 'string' ? post.media.split(',') : post.media.split(',').length > 1 ? [post.media.split(',').find((item: string) => MP4_REGEX.test(item)) || ''] : [post.media]
          // post.type === 1 && typeof post.media === 'string'
          //   ? post.media.split(',')
          //   : [post.media],
      }));
    }
    setIsLoading(false)
    setVoteDetail(res);
  };
  useEffect(() => {

    if (token) {
      loadVoteDetail();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="mt-12 px-4">
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div
        id="view-container"
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ResourceList resources={voteDetail?.media || []} />
        <Campaign voteDetail={voteDetail} loadVoteDetail={loadVoteDetail} />
      </div>
      {isLoading && hasMore && (
        <div className="mt-12 px-4">
          <PostSkeleton />
        </div>
      )}
    </div>
  );
};

const Campaign = ({ voteDetail, loadVoteDetail }: { voteDetail: VoteDetail, loadVoteDetail: () => void }) => {
  const navigate = useNavigate()
  const toast = useToast()

  const [voteNum, setVoteNum] = useState<number | null>(null);
  const [totalAmount, setTotalAmount] = useState(0)
  const [hasVote, setHasVote] = useState(false)
  const [boll, setBoll] = useState(false)


  const voteEve = async (item: any, index: number) => {
    if(voteNum && voteNum > 0){
      return
    }
    if(voteDetail.is_end){
      toast({
        render: () => {
          return <CustomToast title="Vote ended" type={typeOptions.warning} />
        },
        position: 'bottom',
      })
      return
    }
    if (boll) return
    setBoll(true)
    setVoteNum(index === voteNum ? null : index);
    try {
      await postVote({
        post_id: voteDetail.media && voteDetail.media[0].id,
        vote_uid: item.uid
      })
    } catch (error) {
      console.log(error)
    }
    loadVoteDetail()
    setBoll(false)
  };

  useEffect(() => {
    if (voteDetail && voteDetail.vote) {
      // 总票数
      const totalAmount = voteDetail.vote.reduce((sum, item) => sum + item.amount, 0);
      setTotalAmount(totalAmount)
      // 是否已经投票
      const hasVote = voteDetail.vote.some(item => item.is_vote === true);
      setHasVote(hasVote)
      // 已经投了几号
      const index = voteDetail.vote.findIndex(item => item.is_vote === true);
      console.log(voteDetail.vote, index)
      setVoteNum(index)
    }
  }, [voteDetail])

  return (
    <div className="px-4 mb-10">
      <ul>
        {voteDetail.vote?.map((item, index) => (
          <li className="mb-2" key={index}>
            <span className="text-[#0F1419] text-[14px]">Pic {item.sort}</span>
            <a className="text-[#6254FF] text-[14px] ml-2"
              onClick={()=>navigate(`/profile/${item.uid}`)}
            >@{item.username}</a>
          </li>
        ))}
      </ul>
      <div className="border border-[#EBEBF4] p-4 mt-4 rounded-[8px]">
        <h3 className="text-[#333] text-[16px]">{voteDetail.title}</h3>
        <ul className="pt-1">
          {voteDetail.vote?.map((item, index) => (
            <li
              key={index}
              className={`bg-[#F7F9FC] px-4 py-4 mt-1 rounded-[6px] relative overflow-hidden`}
              onClick={() => voteEve(item, index)}
            >
              <div
                className={cn(
                  `absolute h-[100%] left-0 top-0 rounded-[6px] transition-all duration-300 ease-in-out`
                )}
                style={{
                  background: voteNum === index
                    ? 'linear-gradient(90deg, #EDEEFF, #D6DFFF)'
                    : '#F0F2F5',
                  width: (hasVote || voteDetail.is_end)
                    ? `${(item.amount / totalAmount) * 100}%`
                    : '0%',
                  transition: 'width 0.5s ease-in-out',
                }}
              ></div>
              <div className={cn(`flex justify-between relative`)}
                style={{ color: voteNum === index ? '#6254FF' : '#333' }}
              >
                <div className="flex gap-2 relative z-9">
                  <h4 className="text-[14px]">{item.sort}</h4>
                  <span className="text-[14px]">{item.username}</span>
                  {voteNum === index && (
                    <i className="iconfont icon-a-check-line1 text-[22px] text-[#6254FF] absolute right-[-30px] top-[-7px]"></i>
                  )}
                </div>
                <span
                  className="text-[14px]"
                  style={{
                    opacity: (hasVote || voteDetail.is_end) ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                    pointerEvents: (hasVote || voteDetail.is_end) ? 'auto' : 'none',
                  }}
                >
                  {item.amount}
                </span>
              </div>
            </li>
          ))}
        </ul>
        {
          voteDetail.is_end ?
            <p className="text-[12px] text-[#999] mt-3">Vote ended</p>
            :
            <>
              {
                hasVote ?
                  <p className="text-[12px] text-[#999] mt-3">{totalAmount} participants</p>
                  :
                  <p className="text-[12px] text-[#999] mt-3">Vote to see the ranking. You can only cast 1 vote.</p>
              }
            </>
        }
      </div>
    </div>
  );
};

export default JKFCampaignList;
