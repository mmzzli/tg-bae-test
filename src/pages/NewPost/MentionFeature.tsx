import React, { useState, useRef, useEffect } from 'react'

import { getFansFollowers } from '@/api'
import { isMobileDevice } from '@/utils/utils'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'

interface MentionCandidate {
  tgname: string
  avatar: string
  tg_id: number
  fans_id: number
  if_follow: boolean
}

interface MentionFeatureProps {
  title: string
  setTitle: (str: string) => void
  setIsFocused: (bool: boolean) => void
  featureRefBoll: any
  height?: string
  focusedTop?: (top: number) => void
}

const MentionFeature: React.FC<MentionFeatureProps> = ({
  title,
  setTitle,
  setIsFocused,
  featureRefBoll,
  height = '200px',
  focusedTop,
}) => {
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [showMentionList, setShowMentionList] = useState<boolean>(false)
  const [filteredCandidates, setFilteredCandidates] = useState<MentionCandidate[]>([])
  const [mentionTop, setMentionTop] = useState<number>(0)
  const editorRef = useRef<HTMLDivElement>(null)
  const [featureBoll, setFeatureBoll] = useState<boolean>(false)

  const token = useStore((state) => state.token)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  // 提取所有文本内容，包括提及标签中的文本
  const extractTextContent = (html: string): string => {
    // 创建临时 div 来解析 HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // 递归处理节点的函数
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || ''
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        // 如果是提及标签，提取其文本
        if (element.classList.contains('mention-tag')) {
          return element.textContent || ''
        }
        // 处理其他元素的子节点
        return Array.from(node.childNodes)
          .map((child) => processNode(child))
          .join('')
      }

      return ''
    }

    return processNode(tempDiv)
  }

  useEffect(() => {
    if (editorRef.current) {
      if (!title) {
        editorRef.current.innerHTML = '<span class="text-[#999]">Say something ...</span>'
      } else {
        editorRef.current.innerHTML = title
      }
    }
  }, [])

  const handleInput = () => {
    const div = editorRef.current
    if (!div) return

    if (div.innerHTML === '<br>') {
      div.innerHTML = '<span class="text-[#999]">Say something ...</span>'
    }

    // 获取当前选择范围
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)

    // 处理占位符文本
    const placeholderSpan = div.querySelector('span.text-\\[\\#999\\]')
    if (placeholderSpan && div.textContent !== 'Say something ...') {
      placeholderSpan.remove()
    }

    const text = div.innerHTML
    if (text !== title) {
      setTitle(text)
    }

    if (div) {
      const rect = div.getBoundingClientRect()
      setMentionTop(rect.height + 40 - 14)
    }

    // 获取光标前的文本用于检测 @ 符号
    const textBeforeCursor = range.startContainer.textContent?.slice(0, range.startOffset) || ''

    // 检查 @ 符号 - 现在可以处理紧跟在其他文本后面的 @
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    if (lastAtIndex !== -1) {
      // 获取从 @ 到光标的文本
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
      // 仅在实际输入 @ 后触发
      if (lastAtIndex === textBeforeCursor.length - 1 || !textAfterAt.includes(' ')) {
        const query = textAfterAt
        setFilteredCandidates(
          mentionCandidates.filter((candidate) =>
            candidate.tgname.toLowerCase().includes(query.toLowerCase())
          )
        )
        setShowMentionList(true)
      } else {
        setShowMentionList(false)
      }
    } else {
      setShowMentionList(false)
    }
  }

  const handleMentionClick = (candidate: MentionCandidate): void => {
    const div = editorRef.current
    if (!div) return

    // 在任何操作前存储当前选择范围
    const currentSelection = window.getSelection()
    let savedRange =
      currentSelection && currentSelection.rangeCount > 0
        ? currentSelection.getRangeAt(0).cloneRange()
        : null

    // 如果失去选择范围（在移动设备上常见），恢复焦点并查找 @ 位置
    if (!savedRange) {
      div.focus()
      // 查找最后一个 @ 符号
      const content = div.textContent || ''
      const lastAtIndex = content.lastIndexOf('@')

      if (lastAtIndex >= 0) {
        // 查找包含 @ 符号的文本节点
        const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT)
        let currentNode = walker.nextNode()
        let foundNode: Text | null = null
        let accumulatedLength = 0

        while (currentNode && !foundNode) {
          const nodeText = currentNode.textContent || ''
          const newLength = accumulatedLength + nodeText.length

          if (accumulatedLength <= lastAtIndex && lastAtIndex < newLength) {
            foundNode = currentNode as Text
            const localOffset = lastAtIndex - accumulatedLength
            savedRange = document.createRange()
            savedRange.setStart(foundNode, localOffset)
            savedRange.setEnd(foundNode, localOffset + 1)
          }

          accumulatedLength = newLength
          currentNode = walker.nextNode()
        }
      }

      // 如果仍然没有范围，创建一个在末尾的范围
      if (!savedRange) {
        savedRange = document.createRange()
        savedRange.selectNodeContents(div)
        savedRange.collapse(false)
      }

      // 应用范围
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(savedRange)
    }

    // 移除占位符（如果存在）
    const placeholderSpan = div.querySelector('span.text-\\[\\#999\\]')
    if (placeholderSpan) {
      placeholderSpan.remove()
    }

    // 创建带样式的提及标签
    const span = document.createElement('span')
    span.textContent = `@${candidate.tgname} `
    span.style.color = '#6761FF'
    span.contentEditable = 'false'
    span.className = 'mention-tag'

    // 现在应该有一个有效的范围
    const range = savedRange
    const container = range.startContainer
    const offset = range.startOffset

    if (container.nodeType === Node.TEXT_NODE) {
      const text = container.textContent || ''
      const atIndex = text.lastIndexOf('@')

      if (atIndex >= 0) {
        // 移除 @ 符号和光标之前的任何文本
        const beforeAt = text.substring(0, atIndex)
        // 获取光标后的文本，跳过 @ 和光标之间的文本
        const afterCursor = text.substring(Math.max(offset, atIndex + 1))

        // 只保留 @ 之前的文本
        container.textContent = beforeAt

        // 为光标后的内容创建文本节点
        let afterTextNode: Text | null = null
        if (afterCursor.trim()) {
          afterTextNode = document.createTextNode(afterCursor)
        }

        // 插入提及标签和后续文本（如果存在）
        if (container.nextSibling) {
          container.parentNode?.insertBefore(span, container.nextSibling)
          if (afterTextNode) {
            container.parentNode?.insertBefore(afterTextNode, container.nextSibling)
          }
        } else {
          container.parentNode?.appendChild(span)
          if (afterTextNode) {
            container.parentNode?.appendChild(afterTextNode)
          }
        }
      } else {
        // 如果没有找到 @ 符号，就在光标位置插入
        const beforeCursor = text.substring(0, offset)
        const afterCursor = text.substring(offset)

        container.textContent = beforeCursor

        // 为光标后的内容创建文本节点
        let afterTextNode: Text | null = null
        if (afterCursor.trim()) {
          afterTextNode = document.createTextNode(afterCursor)
        }

        // 插入提及标签和后续文本（如果存在）
        if (container.nextSibling) {
          container.parentNode?.insertBefore(span, container.nextSibling)
          if (afterTextNode) {
            container.parentNode?.insertBefore(afterTextNode, container.nextSibling)
          }
        } else {
          container.parentNode?.appendChild(span)
          if (afterTextNode) {
            container.parentNode?.appendChild(afterTextNode)
          }
        }
      }
    } else {
      range.insertNode(span)
    }

    // 提取纯文本内容
    const plainText = extractTextContent(div.innerHTML)
    // 更新内容
    setTitle(plainText)
    setShowMentionList(false)

    // 在提及标签后创建一个空的文本节点
    const emptyTextNode = document.createTextNode('')
    span.parentNode?.insertBefore(emptyTextNode, span.nextSibling)

    // 将光标设置到空文本节点
    const newRange = document.createRange()
    newRange.setStart(emptyTextNode, 0)
    newRange.collapse(true)

    // 应用新的选择范围
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(newRange)

    // 聚焦编辑器
    div.focus()

    // 对于移动设备，需要确保光标位置保持不变
    if (isMobileDevice()) {
      setTimeout(() => {
        const finalRange = document.createRange()
        finalRange.setStart(emptyTextNode, 0)
        finalRange.collapse(true)
        const finalSelection = window.getSelection()
        finalSelection?.removeAllRanges()
        finalSelection?.addRange(finalRange)
        div.focus()
      }, 0)
    }
  }

  const loadCandidates = async () => {
    try {
      const res: any = await getFansFollowers(current_uid)
      setMentionCandidates(res)
    } catch (error) {
      console.error('Failed to fetch mention candidates:', error)
    }
  }

  const mentionEve = (boll: boolean) => {
    setTimeout(() => {
      if (isMobileDevice()) {
        setIsFocused(boll)
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          const scrollY = window.scrollY || window.pageYOffset
          const cursorTopDistance = rect.top + scrollY
          focusedTop && focusedTop(cursorTopDistance)
        }
      }
      setFeatureBoll(boll)

      if (boll && editorRef.current) {
        const placeholderSpan = editorRef.current.querySelector('span.text-\\[\\#999\\]')

        if (placeholderSpan && placeholderSpan.textContent === 'Say something ...') {
          editorRef.current.innerHTML = ''
        }
      }
    }, 0)
  }

  useEffect(() => {
    if (token && current_uid) {
      loadCandidates()
      if (!isMobileDevice()) {
        setFeatureBoll(true)
      }
    }
  }, [current_uid, token])

  const [initialHeight, setInitialHeight] = useState(window.innerHeight)

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight
      if (!featureRefBoll.current) {
        if (currentHeight < initialHeight) {
          setIsFocused(true)
        } else {
          setIsFocused(false)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initialHeight])

  return (
    <div className="relative" style={{ height: height }}>
      <div
        ref={editorRef}
        contentEditable
        className="mt-6 outline-none min-h-[80px] text-[14px] text-[#333] font-normal placeholder-[#999]"
        onInput={handleInput}
        onFocus={() => mentionEve(true)}
        onBlur={() => mentionEve(false)}
      />
      {featureBoll && showMentionList && filteredCandidates.length > 0 && (
        <ul
          className="absolute left-0 z-[111] w-[100%] border-t border-gray-300 bg-white h-[200px] overflow-auto"
          style={{ top: `${mentionTop}px` }}
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.focus()
            }
          }}
        >
          {filteredCandidates.map((candidate) => (
            <li
              key={candidate.tgname}
              onClick={() => handleMentionClick(candidate)}
              className="p-2 cursor-pointer flex items-center"
            >
              <img
                src={candidate.avatar}
                alt={candidate.tgname}
                className="w-9 h-9 rounded-full mr-3 object-cover"
              />
              <p className="text-4 text-[#333]">{candidate.tgname}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MentionFeature
