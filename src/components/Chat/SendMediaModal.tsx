import { useBoolean } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { AttachIcon } from '@/assets/icons'
import { useTouch } from '@/hooks/useTouch'
import { useEffect, useRef, useState } from 'react'
import { MessageType } from './types'
import { useFormatMessage } from '@/hooks/useFormatMessage'
import { useIM } from '@/store/hook/userIM'

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const sheetStyle: React.CSSProperties = {
  backgroundColor: '#1C1C1C',
  transition: `transform 400ms ease-in-out`,
  transform: 'translateZ(50px)',
}

type FileMetadata = {
  name: string
  size: number
  type: string
  file: File
  url: string
  width: number
  height: number
  duration: number
  thumbnail?: string
}

const SendMediaModal = ({
  tgid,
  beforeOpen,
  beforeSelect,
}: {
  tgid: number
  beforeOpen?: () => void
  beforeSelect?: () => void
}) => {
  const attachRef = useRef<HTMLInputElement>(null)
  const [isBaseModalOpen, { toggle, off }] = useBoolean(false)
  const [validFileList, setValidFileList] = useState<FileMetadata[]>([])
  const { formatMessage } = useFormatMessage()
  const { updateMessage } = useIM()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    console.log('files------------>', files)
    if (files.length > 0) {
      beforeOpen?.()
    }
    const fileList = files.map((file) => {
      return new Promise((resolve) => {
        console.log(file)
        const metadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          file,
          url: '',
          width: 0,
          height: 0,
          duration: 0,
          resolution: '',
          thumbnail: '',
        }

        if (file.type.startsWith('image/')) {
          const img = new Image()
          const reader = new FileReader()

          reader.onload = (event) => {
            img.src = event.target?.result as string
            img.onload = () => {
              metadata.width = img.width
              metadata.height = img.height
              resolve(metadata)
            }
          }
          reader.readAsDataURL(file)
        } else if (file.type.startsWith('video/')) {
          const video = document.createElement('video')
          const reader = new FileReader()

          reader.onload = (event) => {
            try {
              video.src = event.target?.result as string

              video.addEventListener('error', (e) => {
                console.log('video load error:', e)
                console.log('error code:', video.error?.code)
                console.log('error message:', video.error?.message)
              })

              video.addEventListener('loadedmetadata', () => {
                console.log('video loadedmetadata')
              })

              video.onloadeddata = () => {
                console.log('video loadeddata')
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth || 400 // 添加默认值
                canvas.height = video.videoHeight || 300 // 添加默认值

                try {
                  const ctx = canvas.getContext('2d')
                  if (!ctx) {
                    throw new Error('无法获取 canvas context')
                  }

                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                  canvas.toBlob(
                    (blob) => {
                      if (blob) {
                        const thumbnailUrl = URL.createObjectURL(blob)
                        console.log('thumbnail generated:', thumbnailUrl)
                        metadata.thumbnail = thumbnailUrl
                      }
                      metadata.width = video.videoWidth || 0
                      metadata.height = video.videoHeight || 0
                      metadata.duration = video.duration || 0
                      resolve(metadata)
                    },
                    'image/jpeg',
                    0.5
                  )
                } catch (err) {
                  console.error('generate thumbnail failed:', err)
                  resolve({
                    ...metadata,
                    width: video.videoWidth || 0,
                    height: video.videoHeight || 0,
                    duration: video.duration || 0,
                  })
                }
              }

              setTimeout(() => {
                if (!metadata.thumbnail) {
                  console.log('generate thumbnail timeout')
                  resolve(metadata)
                }
              }, 5000)
            } catch (err) {
              console.error('process video file error:', err)
              resolve(metadata)
            }
          }

          reader.onerror = (err) => {
            console.error('read file failed:', err)
            resolve(metadata)
          }

          try {
            reader.readAsDataURL(file)
          } catch (err) {
            console.error('read file error:', err)
            resolve(metadata)
          }
        } else {
          resolve(null)
        }
      })
    })
    Promise.all(fileList)
      .then((file) => {
        const validMetadataArray = file.filter(Boolean) as FileMetadata[]
        setValidFileList(validMetadataArray)
        console.log('筛选后的文件数量:', validMetadataArray.length)
        setTimeout(() => {
          toggle()
        }, 100)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  const { touchHandlers } = useTouch({
    onTap: () => {
      beforeSelect?.()
      attachRef.current?.click()
    },
  })

  const handleSubmit = () => {
    // window.TelegramWebviewProxy.postEvent('web_app_request_fullscreen')
    if (validFileList.length === 0) return off()
    validFileList.forEach((metadata) => {
      let newMessage
      if (metadata.type.startsWith('image/')) {
        newMessage = formatMessage({
          type: MessageType.IMAGE,
          url: '',
          to: tgid,
          metadata,
        })
      } else if (metadata.type.startsWith('video/')) {
        newMessage = formatMessage({
          type: MessageType.VIDEO,
          url: '',
          to: tgid,
          metadata,
        })
      }
      if (newMessage) {
        updateMessage(newMessage, tgid)
      }
      setValidFileList([])
      off()
    })
  }

  useEffect(() => {
    if (isBaseModalOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isBaseModalOpen])

  return (
    <>
      <input
        type="file"
        accept="image/*,video/mp4,video/x-m4v,video/ogg,video/webm,video/quicktime"
        onClick={(e) => {
          ;(e.target as HTMLInputElement).value = ''
        }}
        multiple
        onChange={handleFileChange}
        className="absolute bottom-12 left-2"
        style={{
          display: 'none',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        ref={attachRef}
      />

      <div
        {...touchHandlers}
        className="relative w-[29px] h-[29px] cursor-pointer mr-[8px] mt-[3px] no-tap"
      >
        <img src={AttachIcon} />
      </div>

      <div
        className={`fixed inset-0 z-50 ${
          isBaseModalOpen ? 'visible dark:bg-black/80 bg-black/70' : 'invisible'
        } transition-all duration-300`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isBaseModalOpen}
        style={{ transform: 'translateZ(50px)' }}
      >
        <div
          className={`fixed z-50 bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-gray-800 transition-transform ${
            isBaseModalOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={sheetStyle}
        >
          <div className="relative px-[14px] pb-[14px] overflow-y-auto dark:bg-[#1C1C1C] bg-white text-[#E0E2F6] rounded-t-2xl rounded-b-none border-[#1c1c1c] max-h-[70vh]">
            <div className="sticky top-0 flex items-center justify-end dark:bg-[#1C1C1C] bg-white z-10 h-[70px]">
              <button
                onClick={() => off()}
                className="dark:text-white text-black w-9 h-9 flex items-center justify-center bg-[#F5F5FA] rounded-full"
              >
                <i className="iconfont icon-icon_close text-[#12122A] dark:text-[#E0E2F6] text-[20px]"></i>
              </button>
            </div>
            <div className="text-[24px] h-8 font-bold text-[#333] mb-3">
              {validFileList.length} media selected
            </div>
            <div className="flex justify-center">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-3">
                  {validFileList.map((metadata, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center
                   h-[190px] rounded-lg overflow-hidden`}
                    >
                      {metadata.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(new Blob([metadata.file]))}
                          alt={metadata.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            className="w-full h-full object-cover"
                            poster={metadata.thumbnail}
                            src={URL.createObjectURL(metadata.file)}
                            controlsList="nodownload nofullscreen noremoteplayback"
                            disablePictureInPicture
                            webkit-playsinline
                          />
                          <div className="absolute top-0 left-0 bg-black bg-opacity-60 text-white text-xs p-1">
                            {formatDuration(metadata.duration)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <BaseButton
              text="Send"
              className="w-full mt-7 h-[48px] mb-4 text-[15px]"
              handler={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  )
}
export default SendMediaModal
