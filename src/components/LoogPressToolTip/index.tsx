import React, { ReactNode, useRef, useState, useEffect, useCallback } from 'react'
import { useLongPress } from '@/hooks/useLoogPress'
import { Message } from '../Chat/types'
import useCopy from '@/hooks/useCopy'
import { motion, AnimatePresence } from 'framer-motion'
import { TooltipConfig, defaultTooltipConfig } from '@/config/tooltip'
// import { postEvent } from '@telegram-apps/sdk'

// 静态变量，用于跟踪当前活动的tooltip
let activeTooltipId: string | null = null

const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

interface TooltipProps {
  content: Message
  children: ReactNode
  delay?: number
  config?: TooltipConfig
  id?: string
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
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
  const isIOSDevice = isIOS()
  const [isLeftSide, setIsLeftSide] = useState(false)

  const hideTooltip = useCallback(() => {
    if (activeTooltipId === id) {
      activeTooltipId = null
    }
    setVisible(false)
  }, [id])

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
      // 只有在iOS设备上且有URL，或者有文本内容时才显示tooltip
      if ((isIOSDevice && content.url) || content.text) {
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
        let top = rect.top - 90
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
          triangleLeft = '20%'
        } else {
          // 如果在右半边，tooltip右对齐目标元素
          tooltipRight = window.innerWidth - rect.right
          triangleLeft = '70%'
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
  }, [content.url, content.text, isIOSDevice, id])

  const longPressEvent = useLongPress({
    delay: delay,
    onLongPress: () => {
      if (visible) {
        hideTooltip()
      } else {
        showTooltip()
      }
    },
    onClick: hideTooltip,
  })

  const handleDownload = useCallback(async () => {
    try {
      if (content.url) {
        window.Telegram?.WebApp?.share(content.url)
        // Add haptic feedback
        // postEvent('web_app_trigger_haptic_feedback', {
        //   type: 'impact',
        //   impact_style: 'light',
        // })
      }
    } catch (error) {
      console.error('Failed to download:', error)
    } finally {
      hideTooltip()
    }
  }, [content.url, hideTooltip])

  const handleReply = useCallback(() => {
    console.log('handleReply')
    // postEvent('web_app_trigger_haptic_feedback', {
    //   type: 'impact',
    //   impact_style: 'light',
    // })
    hideTooltip()
  }, [hideTooltip])

  const handleCopy = useCallback(() => {
    try {
      if (content.text) {
        copy(content.text)
      }
    } catch (error) {
      console.error('Failed to copy:', error)
    } finally {
      hideTooltip()
    }
  }, [content.text, copy, hideTooltip])

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
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'center',
              position: 'absolute',
              top: position.top,
              left: isLeftSide ? position.left : 'unset',
              right: isLeftSide ? 'unset' : position.right,
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '16px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              zIndex: 10009999999999,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            {config.enableReply && (content.text || content.url) && (
              <motion.div
                className="flex flex-col items-center cursor-pointer"
                onClick={handleReply}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i
                  className="iconfont icon-reply-line"
                  style={{ color: '#fff', fontSize: '24px' }}
                />
                <span>Reply</span>
              </motion.div>
            )}
            {config.enableCopy && content.text && (
              <motion.div
                className="flex flex-col items-center cursor-pointer"
                onClick={handleCopy}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i
                  className="iconfont icon-file-copy-line"
                  style={{ color: '#fff', fontSize: '24px' }}
                />
                <span>Copy</span>
              </motion.div>
            )}
            {config.enableDownload && content.url && isIOSDevice && (
              <motion.div
                className="flex flex-col items-center cursor-pointer"
                onClick={handleDownload}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <i
                  className="iconfont icon-download-line"
                  style={{ color: '#fff', fontSize: '24px' }}
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
                borderTop: '8px solid rgba(0, 0, 0, 0.8)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Tooltip
