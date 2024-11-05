import { useState, useCallback } from 'react'

interface UseCopyReturn {
  copiedText: string | null
  isCopied: boolean
  copy: (text: string) => Promise<boolean>
  reset: () => void
}

const useCopy = (): UseCopyReturn => {
  const [isCopied, setIsCopied] = useState<boolean>(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!text || typeof text !== 'string') {
      console.warn('No text to copy')
      return false
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setIsCopied(true)
      setCopiedText(text)
      return true
    } catch (error) {
      console.error('Failed to copy text:', error)
      setIsCopied(false)
      setCopiedText(null)
      return false
    }
  }, [])

  const reset = useCallback(() => {
    setIsCopied(false)
    setCopiedText(null)
  }, [])

  return {
    isCopied,
    copiedText,
    copy,
    reset,
  }
}

export default useCopy
