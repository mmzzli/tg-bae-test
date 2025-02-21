import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'quill/dist/quill.snow.css'

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
  onTextClick?: (e: MouseEvent) => void
}

// 将文本处理函数移到组件外部
const processText = (text: string) => {
  const trimmedText = text.replace(/\n/g, ' ').trim()
  const replacedText = trimmedText.replace(
    /<span style="color: rgb\(0, 0, 0\);">(.*?)<\/span>/g,
    '$1'
  )
  const parts = replacedText.split(/(@\w+)/)
  let processedText = ''

  parts.forEach((part) => {
    if (part.startsWith('@')) {
      processedText += `<span style="color: #6761FF; cursor: pointer;">${part}</span>`
    } else {
      processedText += part
    }
  })

  return processedText
}

const MoreText: React.FC<MoreTextProps> = ({
  text,
  maxLines = 2,
  moreColor = '#5D6BFF',
  bgColor = '#fff',
  textColor = '#333',
  className = '',
  type,
  onTextClick,
}) => {
  const navigate = useNavigate()
  const quillRef = useRef<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTextClipped, setIsTextClipped] = useState(false)
  const [shouldShowButton, setShouldShowButton] = useState(false)
  const rafRef = useRef<number>()

  // 使用 useMemo 优化文本处理
  const processedTextValue = useMemo(() => processText(text), [text])

  // 使用 useCallback 优化点击处理函数
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'SPAN' && target.textContent?.startsWith('@')) {
      const username = target.textContent.slice(1)
      navigate(`/profile/${username}`)
    }
    onTextClick?.(e)
  }, [navigate, onTextClick])

  // 使用 useCallback 优化文本裁剪检查函数
  const checkTextClipping = useCallback(() => {
    if (!quillRef.current) return

    // 取消之前的 requestAnimationFrame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    const performCheck = () => {
      const editor = quillRef.current?.getEditor()
      if (!editor) return

      const editorRoot = editor.root
      // 强制重新计算布局
      editorRoot.style.display = 'block'
      const editorHeight = editorRoot.clientHeight
      const lineHeight = parseInt(window.getComputedStyle(editorRoot).lineHeight)
      const numberOfLines = Math.floor(editorHeight / lineHeight)
      // 检查文本是否超过最大行数并存储状态
      setShouldShowButton(numberOfLines > maxLines)
      setIsTextClipped(numberOfLines > maxLines)

      // 直接应用样式到编辑器
      if (!isExpanded && numberOfLines > maxLines) {
        editorRoot.style.display = '-webkit-box'
        editorRoot.style.webkitBoxOrient = 'vertical'
        editorRoot.style.webkitLineClamp = maxLines
        editorRoot.style.overflow = 'hidden'
        editorRoot.style.textOverflow = 'ellipsis'

        // 为最后一个段落添加样式
        const style = document.createElement('style')
        const randomId = `quill-container-${Math.random().toString(36).substr(2, 9)}`
        editorRoot.id = randomId
        style.textContent = `
          #${randomId} p:last-child {
            padding-right: 40px;
          }
        `
        document.head.appendChild(style)
        editor.root._lastStyle = style
      } else {
        editorRoot.style.display = 'block'
        editorRoot.style.webkitLineClamp = 'unset'
        editorRoot.style.overflow = 'visible'
        editorRoot.style.textOverflow = 'clip'

        // 移除最后一个段落的样式
        if (editor.root._lastStyle) {
          editor.root._lastStyle.remove()
          editor.root._lastStyle = null
        }
      }
      editorRoot.style.padding = '0'
    }

    // 使用 requestAnimationFrame 进行检查
    rafRef.current = requestAnimationFrame(performCheck)
  }, [isExpanded, maxLines])

  useEffect(() => {
    if (!quillRef.current) return

    const editor = quillRef.current.getEditor()
    editor.root.addEventListener('click', handleClick)

    // 组件挂载后的初始检查
    checkTextClipping()

    // 监听窗口大小变化
    window.addEventListener('resize', checkTextClipping)
    return () => {
      window.removeEventListener('resize', checkTextClipping)
      // 移除点击事件监听
      if (quillRef.current) {
        quillRef.current.getEditor().root.removeEventListener('click', handleClick)
      }
      // 清理样式元素（如果存在）
      if (quillRef.current?.getEditor().root._lastStyle) {
        quillRef.current.getEditor().root._lastStyle.remove()
      }
      // 取消未完成的 requestAnimationFrame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [handleClick, checkTextClipping])

  // 使用 useMemo 优化渐变背景样式
  const gradientStyle = useMemo(() => ({
    color: moreColor,
    background: `linear-gradient(to right, transparent, ${bgColor} 15%, ${bgColor})`,
    paddingLeft: '20px',
  }), [moreColor, bgColor])

  return (
    <div className="relative mt-[8px]">
      <div className={`text-sm leading-relaxed ${className}`}>
        <div className="relative">
          <ReactQuill
            ref={quillRef}
            className="w-[100%] quill-editor"
            theme="snow"
            value={processedTextValue}
            readOnly
            modules={{
              toolbar: false,
            }}
            style={{ color: textColor }}
          />
          {isTextClipped && (
            <p
              className="absolute bottom-0 text-[12px] right-0 px-1 cursor-pointer z-10"
              style={gradientStyle}
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? 'Less' : 'More'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(MoreText)
