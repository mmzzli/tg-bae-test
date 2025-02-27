import { Dialog, DialogContent } from '@/components/BaseDialog/BaseDialog'
import { useToast } from '@chakra-ui/react'

import { useDialog } from '@/hooks/useDialog'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { useRequest, useSafeState } from 'ahooks'
import { deletePost, getNotifications } from '@/api'
import { useStore } from '@/store'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { CustomToast, typeOptions } from '../comm/Toast'

export function DeleteDialog({
  onDelete,
  onCancel,
  title = 'Delete this chat?',
}: {
  onDelete: () => void
  onCancel?: () => void
  title?: string
}) {
  const { isOpen, onOpen, onClose } = useDialog()

  const handleDelete = () => {
    onDelete()
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleCancel = () => {
    onCancel?.()
    setTimeout(() => {
      onClose()
    })
  }

  return (
    <>
      <div
        className="cursor-pointer absolute right-0 top-[1px] bottom-[1px] w-[64px] dark:bg-[#FF5330] bg-[#EB4B6D] flex items-center justify-center -z-1"
        onClick={onOpen}
      >
        <i className="iconfont icon-delete-bin-line text-white text-[20px]"></i>
      </div>

      <Dialog open={isOpen} onOpenChange={handleCancel}>
        <DialogContent>
          <div className="w-[312px] pb-[24px] pt-[30px] dark:bg-[#1C1C1C] text-base font-medium bg-white dark:text-white text-[#333] text-center rounded-[16px]">
            <div className="font-[500] text-[18px]">{title}</div>
            <div className="flex justify-center gap-4 mt-[30px]">
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border dark:border-white border-[#ccc] rounded-[20px] text-sm"
                onClick={handleCancel}
              >
                Cancel
              </div>
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] dark:bg-[#FF5330] bg-[#EB4B6D] text-white dark:text-[] rounded-[20px] text-sm"
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
  ({
    title = 'Delete this chat?',
    data,
    value,
  }: {
    title?: string
    data: FormatterListItem
    value?: string
  }) => {
    const { visible, hide, remove } = useModal()
    const [loading, setLoading] = useSafeState(false)
    const { id } = data
    const { runAsync: deleteHandlerAsync } = useRequest(deletePost, { manual: true })
    const deleteViewList = useStore((state) => state.deleteViewList)
    const toast = useToast()
    const unreadNotificationCount = useStore((state) => state.unreadNotificationCount)
    const setNotificationList = useStore((state) => state.setNotificationList)

    const getInitialNotificationList = async () => {
      const res = await getNotifications({
        page_num: 1,
        records: unreadNotificationCount + 6,
      })
      setNotificationList(res.posts)
    }

    const handleDelete = async () => {
      if (loading) return
      try {
        setLoading(true)
        await deleteHandlerAsync(id)
        deleteViewList(data)
        // update notification list when delete a post
        getInitialNotificationList()
        toast({
          render: () => {
            return <CustomToast title="Delete post success" type={typeOptions.success} />
          },
          position: 'bottom',
        })
      } catch (e: any) {
        let message = ''
        if (e.status === 400) {
          message = 'Paid content cannot be deleted'
        } else {
          message = e.message
        }
        toast({
          render: () => {
            return <CustomToast title={`${message}`} type={typeOptions.error} />
          },
          position: 'bottom',
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
          <div className="w-[312px] pb-[24px] pt-[30px] bg-[#fff] text-white text-center rounded-[16px]">
            <div className="text-[#333] font-[500] text-[18px] ">{title}</div>
            {value && <div className="text-[#666] mt-2 px-6 text-[14px]">{value}</div>}
            <div className="flex justify-center gap-4 mt-[30px]">
              <div
                className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border-[#CCC] border rounded-[20px] text-[#333] text-[14px] font-[500]"
                onClick={hide}
              >
                Cancel
              </div>
              <div
                className={`cursor-pointer flex items-center justify-center w-[120px] h-[40px] bg-[#EB4B6D] rounded-[20px] text-[14px] font-[500] ${loading ? 'opacity-50' : ''}`}
                onClick={handleDelete}
              >
                {loading ? <i className="iconfont icon-loading ml-1 text-[14px]"></i> : 'Delete'}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
)
