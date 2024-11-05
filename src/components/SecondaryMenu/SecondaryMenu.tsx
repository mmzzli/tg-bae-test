import { useCallback, useEffect, useRef } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { useRequest, useSafeState } from 'ahooks'
import { DeleteIcon, ReportIcon } from '@/assets/icons'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { deletePost } from '@/api'
import { useStore } from '@/store'

type Props = {
  mediaData: FormatterListItem
  currentUid: number
}

const SecondaryMenu = ({ mediaData, currentUid }: Props) => {
  const { uid, id } = mediaData
  const [visible, setVisible] = useSafeState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { runAsync: deleteHandlerAsync } = useRequest(deletePost, { manual: true })
  const deleteViewList = useStore((state) => state.deleteViewList)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setVisible(false)
      }
    }

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible])
  const handleDelete = async () => {
    await deleteHandlerAsync(id)
    deleteViewList(mediaData)
  }
  const handleOptionClick = useCallback(
    async (option: 'delete' | 'report') => {
      switch (option) {
        case 'delete':
          await handleDelete()
          break
        case 'report':
          break
        default:
          break
      }
      setVisible(false)
    },
    [setVisible]
  )

  return (
    <div className="relative" ref={menuRef}>
      <button className="p-2 rounded-full" onClick={() => setVisible(!visible)}>
        <MoreHorizontal className="w-5 h-5 text-[#E0E2F6]" />
      </button>

      {visible && (
        <div className="absolute right-0 mt-1 bg-[#19191E] text-[#E0E2F6] font-medium text-xs rounded-[4px] z-50">
          {currentUid === uid && (
            <button
              className="w-[83px] h-[40px] hover:bg-gray-500 rounded-[4px] flex items-center justify-center gap-1 text-[#FF5330]"
              onClick={() => {
                handleOptionClick('delete')
                setVisible(false)
              }}
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
    </div>
  )
}

export default SecondaryMenu
