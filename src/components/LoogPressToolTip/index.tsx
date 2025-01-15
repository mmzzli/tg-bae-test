import { saveAs } from 'file-saver'
import React, { ReactNode, useRef, useState, useEffect } from 'react'
import { useLongPress } from '@/hooks/useLoogPress'
import { Message } from '../Chat/types'
import useCopy from '@/hooks/useCopy'

interface TooltipProps {
  content: Message
  children: ReactNode
  delay?: number
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, delay = 500 }) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const targetRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { copy } = useCopy()

  console.log(content, 'content====>')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        visible &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        targetRef.current &&
        !targetRef.current.contains(event.target as Node)
      ) {
        hideTooltip()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [visible])

  const showTooltip = () => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top - 36, // 向上偏移多一点，为箭头留空间
        left: rect.left + rect.width / 2,
      })
      setVisible(true)
    }
  }

  const hideTooltip = () => setVisible(false)

  const longPressEvent = useLongPress({
    delay: delay,
    onLongPress: showTooltip,
    onClick: hideTooltip,
  })

  const handleDownload = async () => {
    if (content.url) {
      try {
        const response = await fetch(content.url)
        const blob = await response.blob()
        const filename = content.url.split('/').pop() || 'image.png'
        saveAs(blob, filename)
        console.log('Download success', filename, blob)
      } catch (error) {
        console.error('Download failed:', error)
      }
    }
    hideTooltip()
  }

  const handleCopy = () => {
    if (content.text) {
      copy(content.text)
    }
    hideTooltip()
  }

  return (
    <>
      <div ref={targetRef} {...longPressEvent} style={{ display: 'inline-block' }}>
        {children}
      </div>

      {visible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
          }}
        >
          {content.text && <div onClick={handleCopy}>Copy</div>}
          {/* {content.url && <div onClick={handleDownload}>Download</div>} */}
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '5px solid #333',
            }}
          />
        </div>
      )}
    </>
  )
}

export default Tooltip
