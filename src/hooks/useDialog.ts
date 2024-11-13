import { useState, useCallback } from 'react'

export function useDialog(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const onOpen = useCallback(() => {
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    onOpen,
    onClose,
  }
}
