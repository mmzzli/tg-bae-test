import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Search, SearchItem } from '@/types'
import { searchByUsername } from '@/api'
import Empty from '@/components/comm/Empty'
import Icon from '@/components/comm/Icon'

import Image from '@/components/Image/Image'
import FollowButton from '@/components/PersonalDetails/FollowButton'

const Searching = () => {
  const navigate = useNavigate()
  const [data, setData] = useState<SearchItem | null>(null)
  const [field, setField] = useState<string>('')
  const [debouncedField, setDebouncedField] = useState<string>('')
  const searchingEve = async (field: string) => {
    const res = await searchByUsername({
      field: field.toLowerCase(),
      page_num: 1,
      records: 10,
    })
    setData(res)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedField(field)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [field])

  useEffect(() => {
    if (debouncedField) {
      searchingEve(field)
    }else{
      setData({ users: [] })
    }
  }, [debouncedField])

  return (
    <div
      className="absolute px-[16px] top-0 left-0 right-0 bg-[#fff] z-10 overflow-auto scrollbar-hide"
      style={{
        paddingTop:
          'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 16px)',
        height: 'calc(var(--tg-viewport-stable-height) + var(--tg-safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center bg-[#F5F3F3] rounded-[24px] pl-[16px] pr-[12px]">
        <div className="w-[48px] h-[48px] p-[12px] flex items-center justify-center cursor-pointer">
          <i className="iconfont icon-search-line text-[#999999] text-[24px]"></i>
        </div>
        <input
          className="bg-[#F5F3F3] w-[100%] pr-[12px] text-[#333] text-[15px]"
          value={field}
          placeholder="Search Users"
          onChange={(e) => setField(e.target.value)}
        />
        {field.length > 0 && (
          <div
            className="w-[24px] h-[24px] p-[12px] bg-[#A0A3BD] rounded-[50px] flex items-center justify-center cursor-pointer"
            onClick={() => {
              setField('')
              setData({ users: [] })
            }}
          >
            <i className="iconfont icon-icon_close text-[#fff] text-[24px]"></i>
          </div>
        )}
      </div>

      <div className="pt-[28px]">
        {data?.users.map((item, key) => (
          <div className="flex items-center justify-between py-[12px] mb-[12px]" key={key}>
            <div className="flex gap-[12px] items-center">
              <div className="flex-shrink-0" onClick={() => navigate(`/profile/${item.tg_id}`)}>
                <Image
                  width={56}
                  height={56}
                  type="avatar"
                  src={item.avatar}
                  alt="Avatar"
                  className="w-[56px] h-[56px] rounded-full"
                />
              </div>
              <h3 className="text-[#333] text-[16px]">{item.tgname}</h3>
            </div>
            <FollowButton
                fansid={item.fans_id}
                tgid={item.tg_id}
                avatar={item.avatar}
                username={item.tgname}
              />
          </div>
        ))}
      </div>
      {(data?.users.length === 0 && debouncedField.length > 0) && <div>
        <Empty
          title="No search result."
          icon={
            <Icon name="icon-search" style={{ width: '164px', height: '164px' }}></Icon>
          }
        ></Empty>
      </div>}
    </div>
  )
}
export default Searching
