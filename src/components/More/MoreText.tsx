import React, { useEffect, useMemo, useState, useRef } from 'react'

interface MoreTextProps {
  text: string
  maxLines?: number
  scroll?: boolean
  moreColor?: string
  bgColor?: string
  moreLine?: boolean
}
const MoreText: React.FC<MoreTextProps> = ({
  text,
  maxLines = 3,
  scroll = false,
  moreColor = '#5D6BFF',
  bgColor = 'white',
  moreLine = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTextClipped, setIsTextClipped] = useState(false)
  const textRef = useRef<HTMLDivElement | null>(null)

  // text += "Do you have a Band-Aid? Because I just scraped my heart falling for youDo you have a Band-Aid? Because I just scraped my heart falling for you"

  useEffect(() => {
    const checkTextClipping = () => {
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.classList.remove('line-clamp-2')
          const fullHeight = textRef.current.getBoundingClientRect().height
          textRef.current.classList.add('line-clamp-2')
          const clampHeight = textRef.current.getBoundingClientRect().height
          setIsTextClipped(fullHeight > clampHeight)
        }
      }, 0)
    }
    checkTextClipping()
    // Resize 监听器，窗口大小变化时重新检查
    window.addEventListener('resize', checkTextClipping)
    // 清理函数
    return () => window.removeEventListener('resize', checkTextClipping)
  }, [text])

  return (
    <div className="relative mt-[8px]">
      {/* 内容部分 */}
      <p
        ref={textRef}
        className={`text-sm leading-relaxed overflow-hidden transition-all duration-300 dark:text-[#333333] font-weight-500 ${
          isExpanded ? 'line-clamp-none' : 'line-clamp-2'
        } ${bgColor === 'white' ? 'text-[#0F1419] dark:text-[#333333]' : ''}`}
        style={{
          color: moreColor,
        }}
      >
        {text}

        {/* 切换按钮 */}
        {isTextClipped && (
          <button
            className={`mt-1 text-blue-500 text-sm ${isExpanded ? 'relative inline-block' : 'absolute'} bottom-0 right-0 px-1 text-[#5D6BFF]`}
            style={{ background: bgColor, borderRadius: '5px' }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : '... More'}
          </button>
        )}
      </p>
    </div>
  )
}

export default MoreText
