import ResourceList from '../ResourceList/ResourceList';
import useCacheVideo, { useAllFeaturedList } from '@/store/hook/useResourceList';
import PostSkeleton from '../Skeketon/PostSkeleton';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store';
import { useVirtualizer } from '@tanstack/react-virtual';
import { debounce } from '@/utils/chat/schedulers';
import { getVoteDetail, postVote } from '@/api';
import { cn } from '@/utils/utils'
import{ VoteReq } from '@/types'

interface PostListProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface VoteItem {
  sort: string;
  username: string;
  amount: number;
}

interface VoteDetail {
  title?: string;
  vote?: VoteItem[];
  media?: any[];
}

const JKFCampaignList = ({ containerRef }: PostListProps) => {
  const { list, hasMore, fetchMoreData, isLoading } = useAllFeaturedList();
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

  useEffect(() => {
    const loadVoteDetail = async () => {
      const res = await getVoteDetail();
      if (res.media) {
        res.media = res.media.map(({ post, user }: any) => ({
          ...user,
          ...post,
          media:
            post.type === 1 && typeof post.media === 'string'
              ? post.media.split(',')
              : [post.media],
        }));
      }
      setVoteDetail(res);
    };

    if (token) {
      loadVoteDetail();
    }
  }, [token]);

  if (isLoading && list.length === 0) {
    return (
      <div className="mt-12">
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
        <Campaign voteDetail={voteDetail} />
      </div>
      {isLoading && hasMore && (
        <div className="mt-12">
          <PostSkeleton />
        </div>
      )}
    </div>
  );
};

const Campaign = ({ voteDetail }: { voteDetail: VoteDetail }) => {
  const [voteNum, setVoteNum] = useState<number | null>(null);

  const voteEve = async(item:any,index: number) => {
    console.log(item)
    setVoteNum(index === voteNum ? null : index);
    await postVote({
      post_id: 728,
      vote_uid: item.uid,
      act_type: 2
    })
  };

  return (
    <div className="px-4 mb-10">
      <ul>
        {voteDetail.vote?.map((item, index) => (
          <li className="mb-2" key={index}>
            <span className="text-[#0F1419] text-[14px]">Pick {item.sort}</span>
            <a className="text-[#6254FF] text-[14px] ml-2">@{item.username}</a>
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
              <div className={cn(`absolute w-[22%] h-[100%] left-0 top-0 rounded-[6px]`)}
                style={{ background: voteNum === index ? '#EDEEFF' : '#F0F2F5' }}
              ></div>
              <div className={cn(`flex justify-between relative`)}
                style={{ color: voteNum === index ? '#6254FF' : '#333' }}
              >
                <div className="flex gap-2 relative">
                  <h4 className="text-[14px]">{item.sort}</h4>
                  <span className="text-[14px]">{item.username}</span>
                  {voteNum === index && (
                    <i className="iconfont icon-a-check-line1 text-[22px] text-[#6254FF] absolute right-[-30px] top-[-7px]"></i>
                  )}
                </div>
                <span className="text-[14px]">{item.amount}</span>
              </div>
            </li>
          ))}
        </ul>
        <p className="text-[12px] text-[#999] mt-3">Vote to see the ranking. You can only cast 1 vote.</p>
      </div>
    </div>
  );
};

export default JKFCampaignList;
