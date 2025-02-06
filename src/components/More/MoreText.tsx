import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

interface MoreTextProps {
  text: string
  maxLines?: number
  scroll?: boolean
  moreColor?: string
  bgColor?: string
  moreLine?: boolean
  textColor?: string
  className?: string
  type?: string
}

const MoreText: React.FC<MoreTextProps> = ({
  text,
  moreColor = '#5D6BFF',
  bgColor = '#fff',
  textColor = '#666',
  className = '',
  type,
}) => {
  const navigate = useNavigate()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isTextClipped, setIsTextClipped] = useState(false)
  const processedText = text.replace(/\n/g, ' ').trim()
  const [displayText, setDisplayText] = useState(processedText)
  const textRef = useRef<HTMLDivElement | null>(null)

  const highlightMentions = (text: string): string => {
    const mentionRegex = /@\w+/g
    const mentionedText = text.split(mentionRegex).reduce<string>((acc, part, index, array) => {
      if (index < array.length - 1) {
        const mentions = text.match(mentionRegex) || []
        const name = mentions[index].replace(/@/g, '')
        return `${acc}${part}<a href="/profile/${name}" class="text-[#6254FF]">${mentions[index]}</a>`
      }
      return acc + part
    }, '')

    return `${mentionedText}${isTextClipped ? `<span style="color: ${moreColor}" class="pl-2" onclick="this.parentElement.dispatchEvent(new CustomEvent('toggleExpand'))">${isExpanded ? 'Less' : 'More'}</span>` : ''}`
  }

  useEffect(() => {
    let frameId: number
    let timeoutId: NodeJS.Timeout

    const checkTextClipping = () => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context || !textRef.current) return

      const width = textRef.current.clientWidth
      // 如果宽度为0，继续等待
      if (width === 0) {
        timeoutId = setTimeout(() => {
          frameId = requestAnimationFrame(checkTextClipping)
        }, 50)
        return
      }

      const style = window.getComputedStyle(textRef.current)
      context.font = `${style.fontSize} ${style.fontFamily}`

      const moreText = '...More'
      const moreWidth = context.measureText(moreText).width

      if (!isExpanded) {
        const chars = Array.from(processedText)
        let lines: string[] = ['']
        let currentLine = 0

        for (let char of chars) {
          const testLine = lines[currentLine] + char
          const metrics = context.measureText(testLine)

          if (currentLine === 1 && metrics.width > width - moreWidth) {
            setIsTextClipped(true)
            const finalText = lines[0] + '\n' + lines[1]
            setDisplayText(finalText + '...')
            return
          }

          if (metrics.width > width) {
            if (currentLine === 1) {
              setIsTextClipped(true)
              const finalText = lines[0] + '\n' + lines[1]
              setDisplayText(finalText)
              return
            }
            currentLine++
            lines[currentLine] = char
          } else {
            lines[currentLine] = testLine
          }
        }

        setIsTextClipped(currentLine >= 2)
        setDisplayText(lines.join('\n'))
      } else {
        setDisplayText(processedText)
      }
    }

    // 初始延迟执行，等待弹框动画
    timeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(checkTextClipping)
    }, 300)

    const resizeObserver = new ResizeObserver(() => {
      frameId = requestAnimationFrame(checkTextClipping)
    })

    if (textRef.current) {
      resizeObserver.observe(textRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(frameId)
      clearTimeout(timeoutId)
    }
  }, [text, isExpanded, processedText])

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    const handleToggleExpand = () => {
      setIsExpanded(!isExpanded)
    }

    element.addEventListener('toggleExpand', handleToggleExpand)
    return () => {
      element.removeEventListener('toggleExpand', handleToggleExpand)
    }
  }, [isExpanded])

  const _displayText = type === 'post' ? highlightMentions(displayText) : displayText + (isTextClipped ? `<span style="color: ${moreColor}" class="pl-2" onclick="this.parentElement.dispatchEvent(new CustomEvent('toggleExpand'))">${isExpanded ? 'Less' : 'More'}</span>` : '')

  return (
    <div className="relative mt-[8px]">
      <div
        ref={textRef}
        className={`text-sm leading-relaxed whitespace-pre-wrap ${className}`}
        style={{
          color: textColor,
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          hyphens: 'auto',
        }}
        dangerouslySetInnerHTML={{ __html: _displayText }}
      />
    </div>
  )
}

export default MoreText
