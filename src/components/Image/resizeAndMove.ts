import { Swiper as SwiperType } from 'swiper'

// Smoothing factor for zoom (you can adjust this value)//
const SMOOTH_FACTOR = 0.1

export const handleZoomAndPan = (imageElement: HTMLImageElement, swiper: SwiperType) => {
  let currentScale = 1
  let initialDistance = 0
  let isZoomed = false

  // dragging related variables
  let isDragging = false
  let startX = 0
  let startY = 0
  let translateX = 0
  let translateY = 0

  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // limit the range of dragging
  const clampTranslate = (value: number, scale: number, dimension: 'width' | 'height') => {
    const imageSize = dimension === 'width' ? imageElement.offsetWidth : imageElement.offsetHeight
    const scaledSize =
      dimension === 'width' ? getScaledImageSize().width : getScaledImageSize().height
    const maxTranslate = (scaledSize - imageSize) / 2

    return Math.min(Math.max(value, -maxTranslate), maxTranslate)
  }

  const updateTransform = () => {
    imageElement.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      initialDistance = getTouchDistance(e.touches[0], e.touches[1])
    } else if (e.touches.length === 1 && currentScale > 1) {
      isDragging = true
      startX = e.touches[0].clientX - translateX
      startY = e.touches[0].clientY - translateY
      if (swiper) swiper.allowTouchMove = false
    }
  }

  // Get the image's size after scaling
  const getScaledImageSize = () => {
    return {
      width: imageElement.offsetWidth * currentScale,
      height: imageElement.offsetHeight * currentScale,
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1])

      let scale = (currentDistance / initialDistance) * currentScale
      // Smoothly adjust the scale
      scale = currentScale + (scale - currentScale) * SMOOTH_FACTOR

      // Restrict scale to be between 0.5 and 3
      scale = Math.min(Math.max(scale, 0.5), 3)

      currentScale = scale

      // reset dragging position when the scale is 1
      if (currentScale <= 1) {
        translateX = 0
        translateY = 0
      }

      updateTransform()
      if (swiper) swiper.allowTouchMove = currentScale <= 1
    } else if (isDragging && e.touches.length === 1) {
      e.preventDefault()
      const newTranslateX = e.touches[0].clientX - startX
      const newTranslateY = e.touches[0].clientY - startY

      translateX = clampTranslate(newTranslateX, currentScale, 'width')
      translateY = clampTranslate(newTranslateY, currentScale, 'height')

      updateTransform()
    }
  }

  const handleTouchEnd = () => {
    isDragging = false
    if (currentScale <= 1) {
      translateX = 0
      translateY = 0
      updateTransform()
      if (swiper) swiper.allowTouchMove = true
    }
  }

  // PC mouse dragging support
  const handleMouseDown = (e: MouseEvent) => {
    if (currentScale > 1) {
      e.preventDefault()
      isDragging = true
      startX = e.clientX - translateX
      startY = e.clientY - translateY
      if (swiper) swiper.allowTouchMove = false
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      const newTranslateX = e.clientX - startX
      const newTranslateY = e.clientY - startY

      translateX = clampTranslate(newTranslateX, currentScale, 'width')
      translateY = clampTranslate(newTranslateY, currentScale, 'height')

      updateTransform()
    }
  }

  const handleMouseUp = () => {
    isDragging = false
    if (currentScale <= 1) {
      translateX = 0
      translateY = 0
      updateTransform()
      if (swiper) swiper.allowTouchMove = true
    }
  }

  let lastClick = 0
  const handleDoubleClick = (e: MouseEvent) => {
    const currentTime = new Date().getTime()
    if (currentTime - lastClick < 300) {
      e.preventDefault()
      if (!isZoomed) {
        currentScale = 2
        isZoomed = true
      } else {
        currentScale = 1
        isZoomed = false
        translateX = 0
        translateY = 0
      }
      updateTransform()
      if (swiper) swiper.allowTouchMove = !isZoomed
    }
    lastClick = currentTime
  }

  imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  imageElement.addEventListener('touchend', handleTouchEnd)

  imageElement.addEventListener('mousedown', handleMouseDown)
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  imageElement.addEventListener('click', handleDoubleClick)

  return () => {
    imageElement.removeEventListener('touchstart', handleTouchStart)
    imageElement.removeEventListener('touchmove', handleTouchMove)
    imageElement.removeEventListener('touchend', handleTouchEnd)

    imageElement.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    imageElement.removeEventListener('click', handleDoubleClick)
  }
}
