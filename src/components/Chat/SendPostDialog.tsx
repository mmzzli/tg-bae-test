import { FC } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/BaseDialog/BaseDialog'
import { WrappedMessage } from '@/components/Chat/types'
import { OthersUserInfo } from '@/types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSend: () => void
  chatPeople: OthersUserInfo | null
}

const SendPostDialog: FC<Props> = ({ isOpen, onClose, onSend, chatPeople }) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      className="bg-[transparent] dark:bg-gray-800 z-[2000000] flex items-center justify-center items-center justify-center"
    >
      <DialogContent className="">
        <div className="w-[312px] pt-[40px] pb-[24px] dark:bg-[#1C1C1C] text-base font-medium bg-white dark:text-white text-[#333] text-center rounded-[16px]">
          <DialogHeader>
            <div className="font-[500] text-[18px]">Send to {chatPeople?.username}</div>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-[30px]">
            <div
              className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] border dark:border-white border-[#ccc] rounded-[20px] text-sm"
              onClick={onClose}
            >
              Cancel
            </div>
            <div
              className="cursor-pointer flex items-center justify-center w-[120px] h-[40px] dark:bg-[#FF5330] bg-[#6254FF] text-white dark:text-[] rounded-[20px] text-sm"
              onClick={onSend}
            >
              Send
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendPostDialog
