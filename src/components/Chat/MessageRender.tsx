import React, { useEffect, useRef, useState } from 'react'
import { MessageParser, ParsedContent } from '@/components/Chat/MessageParser'
import clsx from 'clsx'
import { MessageStatus, MessageType, WrappedMessage } from './types'
import Image from '../Image/Image'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'
import axios from 'axios'
import { useIM } from '@/store/hook/userIM'

interface MessageRenderProps {
  message: WrappedMessage
  className?: string
}

const parser = new MessageParser()

const scaleImage = (width: number, height: number): { width: number; height: number } => {
  if (width > 255 && height > 300) {
    const scale = Math.min(255 / width, 300 / height)
    return { width: width * scale, height: height * scale }
  } else if (width > 255) {
    return { width: 255, height: height * (255 / width) }
  } else if (height > 300) {
    return { width: width * (300 / height), height: 300 }
  }
  return { width, height }
}

const UploadProgress = React.memo(
  ({
    progress,
    isUploading,
    uploadError,
  }: {
    progress: number
    isUploading: boolean
    uploadError: string | null
  }) => {
    if (!isUploading || uploadError) return null

    return (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative">
          <svg className="animate-spin h-12 w-12 text-gray-700" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm dark:text-gray-700 text-white">{progress}%</span>
          </div>
        </div>
      </div>
    )
  }
)

const VideoPlayer = React.memo(({ file }: { file: File }) => {
  return (
    <video src={URL.createObjectURL(file)} controls className="w-full h-full">
      <source src={URL.createObjectURL(file)} type="video/mp4" />
    </video>
  )
})

const UploadError = React.memo(({ error }: { error: string }) => {
  if (!error) return null

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
      <div className="mb-2 text-red-500">x</div>
      <span className="text-xs">{error}</span>
    </div>
  )
})

const ImageRenderer = React.memo(
  ({
    file,
    url,
    width,
    height,
    className,
    isUploading,
    progress,
    uploadError,
  }: {
    file?: File
    url?: string
    width?: number
    height?: number
    className?: string
    isUploading?: boolean
    progress?: number
    uploadError?: string | null
  }) => {
    const setImageResource = useStore((state) => state.setImageResource)
    if (file) {
      return (
        <div
          className={clsx(
            'relative overflow-hidden rounded-lg',
            'flex items-center justify-center',
            className
          )}
          style={{
            width: width + 'px',
            height: height + 'px',
          }}
        >
          <img src={URL.createObjectURL(file)} alt="" />
          <UploadProgress
            progress={progress ?? 0}
            isUploading={isUploading ?? false}
            uploadError={uploadError ?? null}
          />
          <UploadError error={uploadError ?? ''} />
        </div>
      )
    }

    return (
      <div
        className={clsx(
          'relative overflow-hidden rounded-lg',
          'flex items-center justify-center',
          className
        )}
        style={{
          width: width + 'px',
          height: height + 'px',
        }}
      >
        <Image
          src={url}
          alt=""
          onClick={() => {
            if (url) setImageResource({ images: [url], currentIndex: 0 })
          }}
        />
      </div>
    )
  }
)

export const MessageRender: React.FC<MessageRenderProps> = ({
  message: messageFromStore,
  className,
}) => {
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([])
  const [previewContent, setPreviewContent] = useState<ParsedContent | null>(null)
  const token = useStore((state) => state.token)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [message, setMessage] = useState<WrappedMessage | null>(null)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const { sendMessage, updateMessageByID, getMessageByID } = useIM()

  const updateProgress = (value: number) => {
    progressRef.current = value
    setProgress(value)
  }

  // 在页面退出或者上传结束时 才真正更新store
  const uploadFile = async (file: File) => {
    const url = `${import.meta.env.VITE_APP_UPLOAD_URL}upload/${file.name}`
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.put(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          const percentCompleted = Math.round((current * 100) / total)
          updateProgress(percentCompleted === 100 ? 99 : percentCompleted)
          console.log(`上传进度: ${percentCompleted}%`)
        },
      })
      updateProgress(100)
      setIsUploading(false)
      const newMessage = {
        ...message,
        url: response.data,
        status: MessageStatus.UPLOADED,
        metadata: { ...message?.metadata, file: undefined },
      } as WrappedMessage
      sendMessage(newMessage, false)
      setMessage(newMessage)
      updateMessageByID(newMessage)
      return response.data
    } catch (error) {
      setUploadError('Upload failed')
      console.error(`上传文件时出错: ${error}`)
    }
  }

  useEffect(() => {
    if (messageFromStore.type === MessageType.TEXT) {
      parser.parseText(messageFromStore.text || '').then((content) => {
        setParsedContent(content)
        parser.loadFirstLinkMetadata(content).then((updatedContent) => {
          setParsedContent([...updatedContent])
          const firstPreview = updatedContent.find(
            (part) => part.type === 'link' || part.type === 'telegram'
          )
          if (
            firstPreview &&
            (firstPreview.metadata?.title ||
              firstPreview.metadata?.desc ||
              firstPreview.metadata?.image)
          ) {
            setPreviewContent(firstPreview)
          }
        })
      })
    }
    setMessage({ ...messageFromStore })
  }, [messageFromStore])

  useEffect(() => {
    return () => {
      if (isUploading && message) {
        let newMessage = getMessageByID(message)
        console.log('unmount ------------------>', isUploading, message, newMessage)
        // 暂时解决多次退出的问题
        if (
          messageFromStore.status !== message.status &&
          newMessage?.status !== MessageStatus.UPLOADED
        ) {
          updateMessageByID({ ...message } as WrappedMessage)
        }
      }
    }
  }, [isUploading])

  if (!message) return null

  if (message.type === MessageType.IMAGE) {
    const { width, height } = scaleImage(
      message.metadata?.width || 0,
      message.metadata?.height || 0
    )
    if (message?.metadata?.file && progressRef.current < 100 && !isUploading) {
      setIsUploading(true)
      if (message.status !== MessageStatus.UPLOADING) {
        const newMessage = {
          ...message,
          status: MessageStatus.UPLOADING,
        } as WrappedMessage
        uploadFile(message.metadata.file)
        setMessage(newMessage)
      }
    }

    return (
      <ImageRenderer
        file={message.metadata?.file}
        url={message.url}
        width={width}
        height={height}
        className={className}
        isUploading={isUploading && message.status !== MessageStatus.UPLOADED}
        progress={progress}
        uploadError={uploadError || ''}
      />
    )
  }

  if (message.type === MessageType.VIDEO) {
    const { width, height } = scaleImage(
      message.metadata?.width || 0,
      message.metadata?.height || 0
    )
    // TODO: upload file and show progress bar. when upload is done, show video and send message
    if (message?.metadata?.file) {
      const file = message.metadata.file
      console.log('upload file ------------------>', isUploading)
      if (progressRef.current < 100 && !isUploading) {
        setIsUploading(true)
        if (message.status !== MessageStatus.UPLOADING) {
          const newMessage = {
            ...message,
            status: MessageStatus.UPLOADING,
          } as WrappedMessage
          uploadFile(message.metadata.file)
          setMessage(newMessage)
        }
      }
      return (
        <div
          className={clsx(
            'relative overflow-hidden rounded-lg',
            'flex items-center justify-center',
            className
          )}
          style={{
            width: width + 'px',
            height: height + 'px',
          }}
        >
          <VideoPlayer file={file || ''} />
          <UploadProgress
            progress={progress}
            isUploading={isUploading && message.status !== MessageStatus.UPLOADED}
            uploadError={uploadError || ''}
          />
          <UploadError error={uploadError || ''} />
        </div>
      )
    }
    return (
      <div
        className={clsx(
          'relative overflow-hidden rounded-lg',
          'flex items-center justify-center',
          className
        )}
        style={{
          width: width + 'px',
          height: height + 'px',
        }}
      >
        <video src={message.url} controls controlsList="nodownload">
          <source src={message.url} type="video/mp4" />
        </video>
      </div>
    )
  }

  return (
    <div>
      <div className={clsx('whitespace-pre-wrap break-words', className)}>
        {parsedContent.map((part, index) => (
          <MessagePart key={index} part={part} />
        ))}
      </div>

      {previewContent && (
        <div className="mt-2 border rounded-lg p-2 bg-gray-50 overflow-hidden border-l-4 border-l-yellow-500 text-base">
          {previewContent.type === 'link' && previewContent.metadata && (
            <LinkPreviewCard preview={previewContent} />
          )}
          {previewContent.type === 'telegram' && previewContent.metadata && (
            <TelegramPreviewCard preview={previewContent} />
          )}
        </div>
      )}
    </div>
  )
}

const LinkPreviewCard: React.FC<{ preview: ParsedContent }> = ({ preview }) => {
  return (
    <a
      href={preview.content}
      target="_blank"
      rel="noopener noreferrer"
      className="block hover:bg-gray-100 transition-colors duration-200 text-black"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-bold">{preview.metadata?.title}</h3>
        <p className="text-sm text-gray-600">{preview.metadata?.desc}</p>
        {preview.metadata?.image && (
          <img
            src={preview.metadata.image}
            alt={preview.metadata.title}
            className="w-full max-h-40 object-cover rounded"
          />
        )}
      </div>
    </a>
  )
}

const TelegramPreviewCard: React.FC<{ preview: ParsedContent }> = ({ preview }) => {
  const { shareLink } = useTMAUtils()
  return (
    <div className="block hover:bg-gray-100 transition-colors duration-200 text-black">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-blue-500">Telegram</h3>
        <div className="flex gap-2 items-center font-light">
          <div className="flex flex-col gap-1">
            {preview?.metadata?.title && <p>@{preview.metadata.title}</p>}
            {preview?.metadata?.desc && <p>Start: {preview.metadata.desc}</p>}
          </div>
          <div className="w-[60px] flex-shrink-0">
            {preview?.metadata?.image && (
              <img
                src={preview.metadata.image}
                alt={preview.metadata.title}
                className="w-full max-h-40"
              />
            )}
          </div>
        </div>
        <div
          className="bg-blue-500 text-white px-2 py-1 rounded-md flex justify-center items-center cursor-pointer"
          onClick={() => shareLink(preview.content)}
        >
          Launch
        </div>
      </div>
    </div>
  )
}

const MessagePart: React.FC<{ part: ParsedContent }> = ({ part }) => {
  if (part.type === 'text') {
    return <span>{part.content}</span>
  }
  if (part.type === 'link') {
    return (
      <a href={part.content} target="_blank" className="underline">
        {part.content}
      </a>
    )
  }

  if (part.type === 'telegram') {
    return (
      <a href={part.content} target="_blank" className="underline">
        {part.content}
      </a>
    )
  }
  return null
}
