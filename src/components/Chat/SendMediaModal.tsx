import { useBoolean } from '@chakra-ui/react'

import BaseButton from '@/components/BaseButton/BaseButton'
import { AttachIcon } from '@/assets/icons'
import { useEffect, useRef, useState } from 'react'
import { MessageMetadata, MessageType } from './types'
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
            video.src = event.target?.result as string
            video.onloadedmetadata = () => {
              metadata.resolution = `${video.videoWidth}x${video.videoHeight}`
              metadata.width = video.videoWidth
              metadata.height = video.videoHeight
              metadata.duration = video.duration
              resolve(metadata)
            }
            video.onerror = (e) => {
              console.log(e)
              resolve(null)
            }
          }
          reader.readAsDataURL(file)
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

  const handleSubmit = () => {
    if (validFileList.length === 0) return off()
    validFileList.forEach((metadata) => {
      let newMessage
      if (metadata.type.startsWith('image/')) {
        newMessage = formatMessage({
          type: MessageType.IMAGE,
          url: '',
          to: tgid,
          metadata: metadata as MessageMetadata,
        })
      } else if (metadata.type.startsWith('video/')) {
        newMessage = formatMessage({
          type: MessageType.VIDEO,
          url: '',
          to: tgid,
          metadata: metadata as MessageMetadata,
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
        accept="image/*,video/mp4,video/x-m4v,video/ogg,video/webm"
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
        className="relative w-[29px] h-[29px] cursor-pointer mr-[8px] mt-[3px] no-tap"
        onTouchEnd={(e) => {
          e.preventDefault()
          e.stopPropagation()
          beforeSelect?.()
          attachRef.current?.click()
        }}
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
                            poster={URL.createObjectURL(metadata.file)}
                            src={URL.createObjectURL(metadata.file)}
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
