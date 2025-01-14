import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRequest } from 'ahooks'

import { Search, SearchItem } from '@/types'
import { searchByUsername } from '@/api'
import Empty from '@/components/comm/Empty'
import Icon from '@/components/comm/Icon'

import Image from '@/components/Image/Image'
import FollowButton from '@/components/PersonalDetails/FollowButton'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import GeneralSkeleton from '@/components/Skeketon/GeneralSkeleton'
import { SearchCloseIcon } from '@/assets/icons'
const Searching = () => {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<SearchItem | null>(null)
  const [field, setField] = useState<string>('')
  const [debouncedField, setDebouncedField] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { getCurrentUid } = useTMAUtils()
  const currentUid = getCurrentUid()
  const {
    loading,
    runAsync,
    data: res,
  } = useRequest(
    (field: string) =>
      searchByUsername({
        field: field.toLowerCase(),
        page_num: 1,
        records: 100,
      }),
    { manual: true }
  )

  useEffect(() => {
    if (res) {
      setData(res)
    }
  }, [res])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedField(field)
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [field])

  const load = async () => {
    setIsLoading(false)
    await runAsync(field)
    setIsLoading(true)
  }
  useEffect(() => {
    if (debouncedField) {
      load()
    } else {
      setData({ users: [] })
    }
  }, [debouncedField])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  return (
    <div
      className="absolute px-[16px] top-0 left-0 right-0 bg-[#fff] z-10 overflow-auto scrollbar-hide"
      style={{
        paddingTop:
          'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 64px)',
        height: 'calc(var(--tg-viewport-stable-height) + var(--tg-safe-area-inset-bottom))',
      }}
    >
      <div
        className="fixed inset-x-0 z-[999] bg-[#fff] w-full pb-2 top-0 px-[16px]"
        style={{
          paddingTop:
            'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top) + 16px)',
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
            ref={inputRef}
          />
          {field.length > 0 && (
            <div
              className="w-[24px] h-[24px] p-[12px] rounded-[50px] flex items-center justify-center cursor-pointer"
              onClick={() => {
                setField('')
                setDebouncedField('')
                setData({ users: [] })
                inputRef.current?.focus()
                setIsLoading(false)
              }}
            >
              <img src={SearchCloseIcon} alt="searchClose" className="w-[24px] h-[24px]" />
            </div>
          )}
        </div>
      </div>

      <div className="pt-[28px]">
        {!isLoading && debouncedField.length ? (
          <GeneralSkeleton />
        ) : (
          data?.users.map((item, key) => (
            <div className="flex items-center justify-between py-[12px] mb-[12px]" key={key}>
              <div
                className="flex gap-[12px] items-center"
                onClick={() => item.tg_id !== currentUid ? navigate(`/profile/${item.tg_id}`) : navigate(`/profile`)}
              >
                <div className="flex-shrink-0">
                  <Image
                    rect
                    width={56}
                    height={56}
                    type="avatar"
                    src={item.avatar}
                    alt="Avatar"
                    className="w-[56px] h-[56px] rounded-full"
                    loaderClassName="rounded-full"
                  />
                </div>
                <h3 className="text-[#333] text-[16px] w-[16ch] whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.tgname}
                </h3>
              </div>
              {item.tg_id !== currentUid && (
                <FollowButton tgid={item.tg_id} avatar={item.avatar} username={item.tgname} />
              )}
            </div>
          ))
        )}
      </div>
      {data?.users.length === 0 && debouncedField.length > 0 && isLoading && (
        <div>
          <Empty
            title="No search result."
            icon={<Icon name="icon-search" style={{ width: '164px', height: '164px' }}></Icon>}
          ></Empty>
        </div>
      )}
    </div>
  )
}
export default Searching
