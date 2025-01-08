import { useState, useRef, useImperativeHandle, forwardRef } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'

export interface SlideButtonHandle {
  reset: () => void
}

interface SlideButtonProps {
  onConfirm: () => void
  width?: number
  height?: number
  disabled?: boolean
}

export const SlideButton = forwardRef<SlideButtonHandle, SlideButtonProps>(
  ({ onConfirm, width = 335, height = 52, disabled = false }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const controls = useAnimation()

    useImperativeHandle(ref, () => ({
      reset: () => {
        setIsLoading(false)
        controls.start({ x: 0 })
      },
    }))

    const x = useMotionValue(0)

    const handleDragStart = () => {
      if (disabled) return
      setIsDragging(true)
    }

    const handleDragEnd = () => {
      if (disabled) return
      const currentX = x.get()
      const threshold = width - height - 10

      if (currentX >= threshold) {
        setIsLoading(true)
        controls.start({ x: width - height })
        onConfirm()
      } else {
        controls.start({ x: 0 })
      }
      setIsDragging(false)
    }

    return (
      <div
        ref={containerRef}
        style={{
          width,
          height,
          borderRadius: height / 2,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#F5F5FA',
        }}
        className="flex items-center justify-center"
      >
        {isLoading ? (
          <LoadingSpinner className="z-10" />
        ) : (
          <span
            style={{
              color: '#D1D0DE',
              fontSize: '16px',
              fontWeight: 500,
              userSelect: 'none',
              position: 'relative',
            }}
          >
            Continue
          </span>
        )}

        {/* BG */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            backgroundColor: '#6254FF',
            width: useTransform(x, (value) => `${value + height}px`),
            borderRadius: height / 2,
          }}
        />

        {/* Slide Btn */}
        <motion.div
          drag={disabled ? false : 'x'}
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={controls}
          style={{
            x,
            width: height,
            height: height,
            position: 'absolute',
            left: 0,
            borderRadius: '50%',
            backgroundColor: disabled ? '#D1D0DE' : '#6254FF',
            cursor: disabled ? 'not-allowed' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <ArrowIcon />
        </motion.div>
      </div>
    )
  }
)

const LoadingSpinner = ({ className }: { className: string }) => (
  <span className={`${className} animate-spin`}>
    <i className="iconfont icon-loading" style={{ color: '#fff', fontSize: '24px' }} />
  </span>
)

const ArrowIcon = () => (
  <i className="iconfont icon-Frame2" style={{ color: '#fff', fontSize: '24px' }} />
)
