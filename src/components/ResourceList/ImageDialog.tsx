import { memo, Suspense, useMemo } from 'react'
import ImagePreview from '@/components/Image/ImagePreview'
import { useStore } from '@/store'

const ImagePreviewDialog = memo(() => {
  const imageResource = useStore((state) => state.imageResource)
  const setImageResource = useStore((state) => state.setImageResource)
  const setImageSourceIndex = useStore((state) => state.setImageResourceIndex)
  const isOpen = useMemo(() => {
    return imageResource !== null && imageResource.images.length > 0
  }, [imageResource])

  const onClose = () => {
    setImageResource(null)
  }
  return (
    <Suspense fallback={null}>
      <ImagePreview
        isOpen={isOpen}
        onClose={onClose}
        images={imageResource?.images || []}
        currentIndex={imageResource?.currentIndex || 0}
        onIndexChange={setImageSourceIndex}
      />
    </Suspense>
  )
})

export default ImagePreviewDialog
