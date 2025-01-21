import { useState, useEffect } from 'react'
import VideoFrameExtractor from '@/utils/chat/VideoFrameExtrator'
export function useVideoPreview(videoUrl: string) {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!videoUrl) {
      setPreviewUrl('')
      setError(null)
      return
    }

    const extractor = new VideoFrameExtractor()
    setLoading(true)
    setError(null)

    async function getPreview() {
      try {
        const blobUrl = await extractor.extractFrame(videoUrl, 0.7)
        setPreviewUrl(blobUrl)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    getPreview()

    return () => {
      if (previewUrl) {
        VideoFrameExtractor.revokeUrl(previewUrl)
      }
    }
  }, [videoUrl])

  return { previewUrl, loading, error }
}
