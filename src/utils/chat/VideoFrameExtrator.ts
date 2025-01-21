class VideoFrameExtractor {
  private video: HTMLVideoElement
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null

  constructor() {
    this.video = document.createElement('video')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.video.playsInline = true
    this.video.muted = true
    this.video.crossOrigin = 'anonymous'
    this.video.autoplay = true // 自动播放
  }

  /**
   * 从视频中提取帧作为预览图
   * @param videoUrl 视频URL
   * @param quality 图片质量 0-1 之间
   * @param seekTime 可选，指定提取视频的时间点（秒），默认为0.1秒
   * @returns Promise<string> 返回 blob URL
   */
  async extractFrame(
    videoUrl: string,
    quality: number = 0.5,
    seekTime: number = 0.1
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      const handleVideoFrame = async () => {
        try {
          if (!this.ctx) {
            throw new Error('Canvas context is null')
          }

          // iOS 可能需要播放才能获取帧
          if (isIOS) {
            await this.video.play()
          }

          // 在画布上绘制视频帧
          this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height)

          // iOS 播放后暂停
          if (isIOS) {
            this.video.pause()
          }

          // 将画布内容转换为 blob URL
          this.canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob)
                resolve(url)
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            'image/jpeg',
            quality
          )

          // 清理视频元素
          this.video.removeAttribute('src')
          this.video.load()
        } catch (error) {
          reject(error)
        }
      }

      // 视频加载完成后的处理
      this.video.onloadedmetadata = () => {
        // 设置画布尺寸为视频尺寸
        this.canvas.width = this.video.videoWidth
        this.canvas.height = this.video.videoHeight

        // 处理视频时长小于指定时间的情况
        const actualSeekTime = Math.min(seekTime, this.video.duration / 2)

        // 设置视频播放位置
        this.video.currentTime = actualSeekTime
      }

      // 当视频跳转到指定时间后的处理
      this.video.onseeked = handleVideoFrame

      // 错误处理
      this.video.onerror = () => {
        reject(new Error(`Video loading failed: ${this.video.error?.message}`))
      }

      // 设置视频源
      this.video.src = videoUrl

      // 设置超时处理
      const timeout = setTimeout(() => {
        reject(new Error('Video loading timeout'))
      }, 30000) // 30秒超时

      // 清理超时
      this.video.onloadeddata = () => {
        clearTimeout(timeout)
      }
    })
  }

  /**
   * 释放之前创建的 blob URL
   * @param blobUrl blob URL
   */
  static revokeUrl(blobUrl: string) {
    if (blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl)
    }
  }
}

export default VideoFrameExtractor
