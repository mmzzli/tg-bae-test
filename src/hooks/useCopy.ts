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
        try {
          await navigator.clipboard.writeText(text)
        } catch (clipboardError) {
          // if clipboard API failed, fall back to traditional method
          console.warn('Clipboard API failed, falling back to execCommand:', clipboardError)
          throw clipboardError // force fallback to traditional method
        }
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        textArea.remove()

        if (!successful) {
          throw new Error('execCommand copy failed')
        }
      }

      setIsCopied(true)
      setCopiedText(text)
      return true
    } catch (error) {
      console.error('Failed to copy text:', error)
      // try fallback method
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const successful = document.execCommand('copy')
        textArea.remove()

        if (successful) {
          setIsCopied(true)
          setCopiedText(text)
          return true
        }
      } catch (fallbackError) {
        console.error('Fallback copy method failed:', fallbackError)
      }

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
