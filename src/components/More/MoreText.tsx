import React, { useEffect, useMemo, useState, useRef } from 'react'

interface MoreTextProps {
  text: string
  maxLines?: number
  scroll?: boolean
  moreColor?: string
  bgColor?: string
  moreLine?: boolean
  textColor?: string
  className?: string
}
const MoreText: React.FC<MoreTextProps> = ({
  text,
  moreColor = '#5D6BFF',
  bgColor = '#fff',
  textColor = '#666',
  className = '',
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
      }, 100)
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
      <div
        ref={textRef}
        className={`text-sm leading-relaxed overflow-hidden transition-all duration-300 dark:text-[#333333] font-weight-500 ${
          isExpanded ? 'line-clamp-none' : 'line-clamp-2'
        }  text-[${textColor}] dark:text-[${textColor}] ${className}`}
        style={{
          color: moreColor,
        }}
      >
        {text}

        {/* 切换按钮 */}
        {isTextClipped && (
          <div
            className={`mt-1 text-[${moreColor}] text-sm ${isExpanded ? 'relative inline-block' : 'absolute'} bottom-0 right-0 px-1 text-[#5D6BFF] bg-[${bgColor}]`}
            style={{ borderRadius: '5px', background: bgColor }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less' : 'More'}
          </div>
        )}
      </div>
    </div>
  )
}

export default MoreText
