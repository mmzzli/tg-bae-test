import { useCallback, useEffect, useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useSafeState } from 'ahooks'
import { DeleteIcon, ReportIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import Report from './Report'
import { cn } from '@/utils/utils'
import { DeleteDialogWarp } from '../Chat/DeleteDialog'
import { useModal } from '@ebay/nice-modal-react'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'

type Props = {
  mediaData: FormatterListItem
  currentUid: number
  className?: string
}

const SecondaryMenu = ({ mediaData, currentUid, className }: Props) => {
  const { uid, id } = mediaData
  const [visible, setVisible] = useSafeState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [reportVisible, setReportVisible] = useSafeState(false)
  const toast = useToast();

  const deleteDialogWrap = useModal(DeleteDialogWarp)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setTimeout(()=>{
          setVisible(false)
        },0)
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
<<<<<<< HEAD
          // toast({
          //   render: () => {
          //     return <CustomToast title={`Report successfully`} type={typeOptions.success} />
          //   },
          //   status: 'success',
          //   position: 'top',
          // })
=======
          toast({
            render: () => {
              return <CustomToast title={`Report successfully`} type={typeOptions.success} />
            },
            position: 'top',
          })
>>>>>>> fix/toast
          setReportVisible(true)
          break
        default:
          break
      }
      setVisible(false)
    },
    [setVisible]
  )

  return (
    <div className={cn(className, 'relative')} ref={menuRef}>
      <button className="p-2 rounded-full" onClick={() => setVisible(!visible)}>
        <MoreHorizontal className="w-5 h-5 text-[#E0E2F6]" />
      </button>

      {visible && (
        <div className="absolute right-0 mt-1 bg-[#19191E] text-[#E0E2F6] font-medium text-xs rounded-[4px] z-50">
          {currentUid === uid && (
              <button
              onClick={()=>{
                deleteDialogWrap.show({data:mediaData});
                setVisible(false)
              }}
                className="w-[83px] h-[40px] hover:bg-gray-500 rounded-[4px] flex items-center justify-center gap-1 text-[#FF5330]"
              >
                <img src={DeleteIcon} alt="delete" />
                Delete
              </button>
          )}
          {currentUid !== uid && (
            <button
              className="w-[83px] h-[40px] hover:bg-gray-500 rounded-[4px] flex items-center justify-center gap-1"
              onClick={() => {
                handleOptionClick('report')
                setVisible(false)
              }}
            >
              <img src={ReportIcon} alt="report" />
              Report
            </button>
          )}
        </div>
      )}
      <Report isOpen={reportVisible} onClose={setReportVisible} />
    </div>
  )
}

export default SecondaryMenu
