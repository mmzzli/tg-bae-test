import React, { useMemo, useState } from 'react'

interface MoreTextProps {
  text: string
  maxLines?: number
}
const MoreText: React.FC<MoreTextProps> = ({ text, maxLines = 3 }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }
  if (text.trim().length === 0) {
    return <></>
  }
  if (text.trim().length < 80) {
    return <span>{text}</span>
  }
  return (
    <div
      style={{
        display: 'inline', // 让内容和 More 一起显示
      }}
    >
      {/* 文本容器 */}
      <span
        style={{
          position: 'relative',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          display: isExpanded ? 'block' : '-webkit-box',
          textOverflow: 'ellipsis',
          wordBreak: 'break-all',
          wordWrap: 'break-word',
        }}
      >
        {isExpanded ? text : `${text.slice(0, 80)}...`} {/* 显示内容 */}
        {!isExpanded && (
          <span
            onClick={toggleExpand}
            style={{
              color: 'blue',
              cursor: 'pointer',
              marginLeft: '4px',
              display: 'inline',
            }}
          >
            More
          </span>
        )}
        {isExpanded && (
          <span
            onClick={toggleExpand}
            style={{
              color: 'blue',
              cursor: 'pointer',
              marginLeft: '4px',
              display: 'inline',
            }}
          >
            Less
          </span>
        )}
      </span>

      {/* More/Less 按钮 */}
    </div>
  )
}

export default MoreText
