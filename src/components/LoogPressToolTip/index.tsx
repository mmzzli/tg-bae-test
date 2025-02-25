import React, { ReactNode, useRef, useState, useEffect, useCallback } from 'react'
import { useLongPress } from '@/hooks/useLoogPress'
import { WrappedMessage } from '../Chat/types'
import useCopy from '@/hooks/useCopy'
import { motion, AnimatePresence } from 'framer-motion'
import { TooltipConfig, defaultTooltipConfig } from '@/config/tooltip'
import { useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'
import { useStore } from '@/store'
import { IUserInfo, OthersUserInfo } from '@/types'
// import { postEvent } from '@telegram-apps/sdk'

// 静态变量，用于跟踪当前活动的tooltip
let activeTooltipId: string | null = null

const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

const isAndroid = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /android/.test(userAgent)
}

const REVOKE_TIME = 3 * 60 * 1000

interface TooltipProps {
  content: WrappedMessage
  user: OthersUserInfo | IUserInfo | null
  channelId: string
  children: ReactNode
  delay?: number
  config?: TooltipConfig
  id?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  user,
  channelId,
  children,
  delay = 500,
  config = defaultTooltipConfig,
  id = Math.random().toString(),
}) => {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, triangleLeft: '50%', right: 0 })
  const targetRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { copy } = useCopy()
  const toast = useToast()

  const isIOSDevice = isIOS()
  const isAndroidDevice = isAndroid()
  const [isLeftSide, setIsLeftSide] = useState(false)
  const setReplyMessage = useStore((state) => state.setReplyMessage)
  const setDeleteMessage = useStore((state) => state.setDeleteMessage)
  const hideTooltip = useCallback(() => {
    if (activeTooltipId === id) {
      activeTooltipId = null
    }
    setVisible(false)
  }, [id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // console.log('handleClickOutside', visible, tooltipRef.current, targetRef.current)
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

    const handleScroll = () => {
      if (visible) {
        hideTooltip()
      }
    }

    const handleHideTooltip = (event: CustomEvent) => {
      if (event.detail.id === id) {
        hideTooltip()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('hideTooltip', handleHideTooltip as EventListener)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('hideTooltip', handleHideTooltip as EventListener)
    }
  }, [visible, hideTooltip, id])

  const showTooltip = useCallback(() => {
    if (targetRef.current) {
      // 只有在以下情况才显示tooltip:
      // 1. 有文本内容
      // 2. 或者在iOS设备上且有URL且enableDownload为true
      if (content) {
        // 如果已经有其他tooltip在显示，发送事件通知它关闭
        if (activeTooltipId && activeTooltipId !== id) {
          const event = new CustomEvent('hideTooltip', { detail: { id: activeTooltipId } })
          window.dispatchEvent(event)
        }

        // 设置当前tooltip为活动状态
        activeTooltipId = id

        // 获取目标元素的位置和尺寸信息
        const rect = targetRef.current.getBoundingClientRect()
        const windowWidth = window.innerWidth

        // 计算tooltip的垂直位置（在目标元素上方80px）
        let top = rect.top - 82
        let tooltipLeft
        let triangleLeft
        let tooltipRight

        // 计算目标元素的中心点，用于决定tooltip显示在左侧还是右侧
        const targetCenter = rect.left + rect.width / 2
        const isLeftSide = targetCenter < windowWidth / 2
        setIsLeftSide(isLeftSide)

        // 根据显示位置设置tooltip和小三角形的位置
        if (isLeftSide) {
          // 如果在左半边，tooltip左对齐目标元素
          tooltipLeft = rect.left + window.scrollX
          triangleLeft = '32%'
        } else {
          // 如果在右半边，tooltip右对齐目标元素
          tooltipRight = window.innerWidth - rect.right
          triangleLeft = '68%'
        }

        // 更新tooltip的位置状态
        setPosition({
          top,
          left: tooltipLeft ?? 0,
          right: tooltipRight ?? 0,
          triangleLeft,
        })
        // 显示tooltip
        setVisible(true)
      }
    }
  }, [content.url, content.text, isIOSDevice, id, config.enableDownload])

  const forceFocus = () => {
    const activeElement = document.activeElement as HTMLInputElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      // 保存当前光标位置
      const cursorPosition = activeElement.selectionStart
      // 使用 requestAnimationFrame 确保在下一帧重新聚焦
      requestAnimationFrame(() => {
        activeElement.focus()
        // 恢复光标位置
        activeElement.setSelectionRange(cursorPosition, cursorPosition)
      })
    }
  }

  const longPressEvent = useLongPress({
    delay: delay,
    onLongPress: () => {
      forceFocus()
      if (visible) {
        hideTooltip()
      } else {
        showTooltip()
      }
    },
    onClick: hideTooltip,
  })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const activeElement = document.activeElement as HTMLInputElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      activeElement.focus()
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const activeElement = document.activeElement as HTMLInputElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      activeElement.focus()
    }
  }, [])

  const handleReply = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log('handleReply', content, content.text || content.url || '')
      let message = content.text || content.url || ''
      // 处理页面数组不更新问题
      if (!message) {
        const messageWindow = useStore
          .getState()
          .messageWindowList.filter((item) => item.channel.channelID === content.channelID)
        if (messageWindow.length > 0) {
          const _message = messageWindow[0].messages.filter((msg) => msg.id === content.id)
          if (_message.length > 0) {
            const res = _message[0]
            message = res.text || res.url || ''
          }
        }
      }
      setReplyMessage({
        channel: channelId,
        messageId: content.id,
        messageSeq: content.messageSeq,
        messageType: content.type,
        message: message,
        toUid: content.sender,
        toUsername: user?.username || '',
        revoke: false,
      })
      hideTooltip()
    },
    [hideTooltip]
  )

  const handleCopy = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        if (content.text) {
          copy(content.text)
          toast({
            render: () => {
              return <CustomToast title="Copied to clipboard!" type={typeOptions.success} />
            },
            position: 'top',
          })
        }
      } catch (error) {
        console.error('Failed to copy:', error)
      } finally {
        hideTooltip()
      }
    },
    [content.text, copy, hideTooltip]
  )

  const handleDownload = useCallback(
    async (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        if (content.url) {
          window.Telegram?.WebApp?.downloadFile({ url: content.url, file_name: `pic-${id}` })
        }
      } catch (error) {
        console.error('Failed to download:', error)
      } finally {
        hideTooltip()
      }
    },
    [content.url, hideTooltip]
  )

  const handleRevokeConfirm = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()
      console.log(content)
      setDeleteMessage(content)
      hideTooltip()
    },
    [hideTooltip]
  )

  useEffect(() => {
    const handleFocus = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.pointerEvents = 'none'
      }
    }

    const handleBlur = () => {
      if (tooltipRef.current) {
        tooltipRef.current.style.pointerEvents = 'auto'
      }
    }

    window.addEventListener('focus', handleFocus, true)
    window.addEventListener('blur', handleBlur, true)

    return () => {
      window.removeEventListener('focus', handleFocus, true)
      window.removeEventListener('blur', handleBlur, true)
    }
  }, [])

  return (
    <>
      <div ref={targetRef} {...longPressEvent} style={{ display: 'inline-block' }}>
        {children}
      </div>
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              position: 'absolute',
              top: position.top,
              left: isLeftSide ? position.left : 'unset',
              right: isLeftSide ? 'unset' : position.right,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(63, 61, 82)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              zIndex: 10009999999999,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
            }}
          >
            {config.enableReply && (
              <motion.div
                className="flex flex-col items-center cursor-pointer text-[12px]"
                onClick={handleReply}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                }}
              >
                <i
                  className="iconfont icon-reply-line"
                  style={{ color: '#fff', fontSize: '20px' }}
                />
                <span>Reply</span>
              </motion.div>
            )}

            {config.enableCopy && content.text && (
              <motion.div
                className="flex flex-col items-center cursor-pointer text-[12px]"
                onClick={handleCopy}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                }}
              >
                <i
                  className="iconfont icon-file-copy-line"
                  style={{ color: '#fff', fontSize: '20px' }}
                />
                <span>Copy</span>
              </motion.div>
            )}
            {config.enableRevoke && (
              <motion.div
                className="flex flex-col items-center cursor-pointer text-[12px]"
                onClick={handleRevokeConfirm}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                }}
              >
                <i
                  className="iconfont icon-delete-bin-line"
                  style={{ color: '#EB4B6D', fontSize: '20px' }}
                />
                <span className="text-[#EB4B6D]">Delete</span>
              </motion.div>
            )}
            {config.enableDownload && content.url && isIOSDevice && (
              <motion.div
                className="flex flex-col items-center cursor-pointer text-[12px]"
                onClick={handleDownload}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                }}
              >
                <i
                  className="iconfont icon-download-line"
                  style={{ color: '#fff', fontSize: '20px' }}
                />
                <span>Save</span>
              </motion.div>
            )}
            <motion.div
              style={{
                position: 'absolute',
                bottom: -8,
                left: position.triangleLeft,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid rgba(63, 61, 82)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Tooltip
