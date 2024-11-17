import { Dialog, DialogContent } from '@/components/BaseDialog/BaseDialog'
import { useDialog } from '@/hooks/useDialog'
import deleteIcon from '@/assets/image/chat/delete.png'

export function DeleteDialog({
  onDelete,
  title = 'Delete this chat?',
  children,
}: {
  onDelete: () => void
  title?: string
  children?: React.ReactNode
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
      {children ? (
        <div onClick={onOpen}>{children}</div>
      ) : (
        <div
          className="cursor-pointer absolute right-0 top-[1px] bottom-[1px] w-[64px] bg-[#FF5330] flex items-center justify-center -z-1"
          onClick={onOpen}
        >
          <span className="text-white">
            <img style={{ width: '20px', height: '20px' }} src={deleteIcon} alt="delete" />
          </span>
        </div>
      )}

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
