import { Dialog, DialogContent } from '@/components/BaseDialog/BaseDialog'
import { useToast } from '@chakra-ui/react'

import { useDialog } from '@/hooks/useDialog'
import deleteIcon from '@/assets/image/chat/delete.png'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useRequest, useSafeState } from 'ahooks'
import { deletePost } from '@/api'
import { useStore } from '@/store'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { CustomToast, typeOptions } from '../comm/Toast'

export function DeleteDialog({
  onDelete,
  title = 'Delete this chat?',
}: {
  onDelete: () => void
  title?: string
}) {
  const { isOpen, onOpen, onClose } = useDialog()

  const handleDelete = () => {
    onDelete()
    setTimeout(() => {
      onClose()
    }, 200)
  }

  return (
    <>
      <div
        className="cursor-pointer absolute right-0 top-[1px] bottom-[1px] w-[64px] bg-[#FF5330] flex items-center justify-center -z-1"
        onClick={onOpen}
      >
        <span className="text-white">
          <img style={{ width: '20px', height: '20px' }} src={deleteIcon} alt="delete" />
        </span>
      </div>

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="w-[312px] h-[172px] bg-[#1C1C1C] text-white text-center rounded-[16px]">
            <div className="mt-[40px] text-default ">{title}</div>
            <div className="flex justify-center gap-4 mt-[44px]">
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border-white border rounded-[20px] text-sm"
                onClick={onClose}
              >
                Cancel
              </div>
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] bg-[#FF5330] rounded-[20px] text-sm"
                onClick={handleDelete}
              >
                Delete
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const DeleteDialogWarp = NiceModal.create(
  ({ title = 'Delete this chat?', data }: { title?: string; data: FormatterListItem; }) => {
    const { visible, hide, remove } = useModal()
    const [loading, setLoading] = useSafeState(false)
    const { id } = data
    const { runAsync: deleteHandlerAsync } = useRequest(deletePost, { manual: true })
    const deleteViewList = useStore((state) => state.deleteViewList)
    const toast = useToast()

    const handleDelete = async () => {
      if (loading) return
      try {
        setLoading(true)
        await deleteHandlerAsync(id)
        deleteViewList(data)
        toast({
          render: () => {
            return <CustomToast title="Delete post success" type={typeOptions.success} />
          },
          status: 'success',
          position: 'top',
        })
      } catch (e: any) {
        toast({
          render: () => {
            return <CustomToast title={`Error ${e.message}`} type={typeOptions.error} />
          },
          status: 'error',
          position: 'top',
        })
      } finally {
        setLoading(false)
        setTimeout(() => {
          remove()
        })
      }
    }

    return (
      <Dialog open={visible}>
        <DialogContent>
          <div className="w-[312px] h-[172px] bg-[#1C1C1C] text-white text-center rounded-[16px]">
            <div className="mt-[40px] text-default ">{title}</div>
            <div className="flex justify-center gap-4 mt-[44px]">
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border-white border rounded-[20px] text-sm"
                onClick={hide}
              >
                Cancel
              </div>
              <div
                className={`cursor-pointer flex items-center justify-center w-[120px] h-[40px] bg-[#FF5330] rounded-[20px] text-sm ${loading ? 'opacity-50' : ''}`}
                onClick={handleDelete}
              >
                Delete
                {loading && <i className="iconfont icon-loading ml-1 text-[14px]"></i>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
