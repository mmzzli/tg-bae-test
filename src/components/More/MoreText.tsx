import React, { useEffect, useState, useRef } from 'react'
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

const MoreText: React.FC<MoreTextProps> = ({
  text,
  maxLines = 2,
  moreColor = '#5D6BFF',
  bgColor = '#fff',
  textColor = '#666',
  className = '',
  type,
  onTextClick,
}) => {
  const navigate = useNavigate()
  const quillRef = useRef<any>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTextClipped, setIsTextClipped] = useState(false)
  const [shouldShowButton, setShouldShowButton] = useState(false)

  useEffect(() => {
    // 添加点击事件处理
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'SPAN' && target.textContent?.startsWith('@')) {
        const username = target.textContent.slice(1) // 移除@符号
        navigate(`/profile/${username}`)
      }
      // 调用外部传入的回调函数
      onTextClick?.(e)
    }

    if (quillRef.current) {
      const editor = quillRef.current.getEditor()
      editor.root.addEventListener('click', handleClick)
    }

    const checkTextClipping = () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor()

        // 确保内容已经渲染完成
        setTimeout(() => {
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
          if (!isExpanded) {
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
        }, 50) // 给予足够的时间让样式完全应用
      }
    }

    // 组件挂载后的初始检查
    setTimeout(checkTextClipping, 100)

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
    }
  }, [text, isExpanded, shouldShowButton, maxLines, navigate, onTextClick])

  // 处理@提及的函数
  const processText = (text: string) => {
    // 将文本中的换行符替换为空格并去除首尾空格
    const trimmedText = text.replace(/\n/g, ' ').trim()

    // 替换已有的颜色样式
    const replacedText = trimmedText.replace(
      /<span style="color: rgb\(0, 0, 0\);">(.*?)<\/span>/g,
      '$1'
    )

    // 使用正则表达式匹配@用户名
    const parts = replacedText.split(/(@\w+)/)
    let processedText = ''

    parts.forEach((part) => {
      if (part.startsWith('@')) {
        // 如果是@用户名，添加带样式的span标签
        processedText += `<span style="color: #6761FF; cursor: pointer;">${part}</span>`
      } else {
        // 普通文本不添加颜色样式包装
        processedText += part
      }
    })

    return processedText
  }

  const processedText = processText(text)

  return (
    <div className="relative mt-[8px]">
      <div className={`text-sm leading-relaxed ${className}`}>
        <div className="relative">
          <ReactQuill
            ref={quillRef}
            className="w-[100%] quill-editor"
            theme="snow"
            value={processedText}
            readOnly
            modules={{
              toolbar: false,
            }}
            style={{ color: textColor }}
          />
          {isTextClipped && (
            <p
              className="absolute bottom-0 text-[12px] right-0 px-1 cursor-pointer z-10"
              style={{
                color: moreColor,
                background: `linear-gradient(to right, transparent, ${bgColor} 15%, ${bgColor})`,
                paddingLeft: '20px',
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MoreText
