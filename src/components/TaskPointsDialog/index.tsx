import { Box, Button, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { TaskCloseCircleIcon } from '@/assets/icons'

interface BottomCloseModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

const BottomCloseModal: React.FC<BottomCloseModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.6)" />
      <ModalContent
        mx={4}
        bg="white"
        _dark={{ bg: '#1A1A1A' }}
        borderRadius="16px"
      >
        <ModalBody p="24px">
          {children}
        </ModalBody>
        <div onClick={onClose} className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2 z-[999] flex items-center justify-center w-[28px] h-[28px]">
          <img src={TaskCloseCircleIcon} alt="close" />
        </div>
      </ModalContent>
    </Modal>
  )
}

export default BottomCloseModal
