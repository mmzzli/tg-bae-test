import { useCallback, useEffect, useRef, useState } from 'react'
import { useSafeState } from 'ahooks'
import { ReportIconLight } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Report from './Report'
import { cn } from '@/utils/utils'
import { DeleteDialogWarp } from '../Chat/DeleteDialog'
import { useModal } from '@ebay/nice-modal-react'
import { useToast } from '@chakra-ui/react'
import BaseButton from '../BaseButton/BaseButton'
import { getSomeoneProfile, follow, getFollowingList } from '@/api'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'

type Props = {
  mediaData: FormatterListItem
  currentUid: number
  setReportVisible?:(boll:boolean)=>void
  className?: string
  type?: string
}

const SecondaryMenu = ({ mediaData, currentUid, className, type, setReportVisible }: Props) => {
  const { uid, id } = mediaData
  const [visible, setVisible] = useSafeState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  // const [reportVisible, setReportVisible] = useSafeState(false)
  const toast = useToast()
  const [isFollowLoading, setIsFollowLoading] = useState<boolean>(false)
  const followResource = useStore((state) => state.followResource)
  const setFollowResource = useStore((state) => state.setFollowResource)
  const setMyFollow = useStore((state) => state.setMyFollow)

  const deleteDialogWrap = useModal(DeleteDialogWarp)

  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTimeout(() => {
          setVisible(false)
        }, 0)
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible])

  const handleReport = () => {
    console.log('report')
  }
  const handleOptionClick = useCallback(
    async (option: 'report') => {
      switch (option) {
        case 'report':
          // toast({
          //   render: () => {
          //     return <CustomToast title={`Report successfully`} type={typeOptions.success} />
          //   },
          //   status: 'success',
          //   position: 'top',
          // })
          setReportVisible && setReportVisible(true)
          break
        default:
          break
      }
      setVisible(false)
    },
    [setVisible]
  )
  const doFollow = async () => {
    console.log(type)
    setVisible(false)
    setIsFollowLoading(true)
    await getSomeoneProfile(mediaData.uid)
    await follow({
      fansid: mediaData.id,
      tgid: mediaData.uid,
    })
    setIsFollowLoading(false)
    const res = followResource?.map((user) =>
      user.uid === mediaData.uid ? { ...user, boll: !user.boll } : user
    )
    console.log(res)
    setFollowResource(res)
    getFollowingList(current_uid).then((res) => setMyFollow(res))
  }

  return (
    <div className={cn(className, 'relative')} ref={menuRef}>
      <div className="flex items-center gap-[8px]">
        {!followResource?.some((user) => user.uid === mediaData.uid && user.is_follow) &&
          type === 'recommend' && (
            <BaseButton
              text={
                followResource?.some((user) => user.uid === mediaData.uid && user.boll)
                  ? `Following`
                  : `Follow`
              }
              loading={isFollowLoading}
              loadingColor="border-t-[#999]"
              handler={doFollow}
              className={`rounded-[20px] bg-[#F5F3F3] flex justify-center items-center gap-[4px] w-[80px] h-[34px] px-[8px] text-[#333]`}
            />
          )}
        <button className="rounded-full" onClick={() => setVisible(!visible)}>
          <i className="iconfont icon-icon_more text-[#373738]" style={{ fontSize: '26px' }}></i>
        </button>
      </div>

      {visible && (
        <div className="absolute border rounded-lg right-0 top-[36px] mt-1 dark:bg-[#19191E] dark:border-[#19191E] bg-white dark:text-[#E0E2F6] text-[#333] border-[#EBEBF4] font-medium text-xs rounded-[4px] z-50">
          {currentUid === uid && (
            <button
              onClick={() => {
                deleteDialogWrap.show({
                  data: mediaData,
                  title: 'Delete this post?',
                  value: mediaData.price > 0 ? `Users who unlocked it can still view it, but won't be able to engage with it.`: ''
                })
                setVisible(false)
              }}
              className="w-[83px] h-[40px] rounded-[4px] flex items-center justify-center gap-1 text-[#FF684A]"
            >
              <i className="iconfont icon-delete-bin-line text-base"></i>
              Delete
            </button>
          )}
          {currentUid !== uid && (
            <button
              className="w-[83px] h-[40px] rounded-[4px] flex items-center justify-center gap-1"
              onClick={() => {
                handleOptionClick('report')
                setVisible(false)
              }}
            >
              <img src={ReportIconLight} alt="report" className="mb-1" />
              Report
            </button>
          )}
        </div>
      )}
      {/* <Report isOpen={reportVisible} onClose={setReportVisible} /> */}
    </div>
  )
}

export default SecondaryMenu
