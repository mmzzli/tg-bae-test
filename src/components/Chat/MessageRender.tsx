import React, { useEffect, useState } from 'react'
import { MessageParser, ParsedContent } from '@/components/Chat/MessageParser'
import clsx from 'clsx'
import { Message, MessageType } from './types'
import Image from '../Image/Image'
import { useTMAUtils } from '@/hooks/useTMAUtils'

interface MessageRenderProps {
  message: Message
  className?: string
}

const parser = new MessageParser()

export const MessageRender: React.FC<MessageRenderProps> = ({ message, className }) => {
  const [parsedContent, setParsedContent] = useState<ParsedContent[]>([])
  const [previewContent, setPreviewContent] = useState<ParsedContent | null>(null)

  useEffect(() => {
    if (message.type === MessageType.TEXT) {
      parser.parseText(message.text || '').then((content) => {
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
  }, [message])

  if (message.type === MessageType.IMAGE) {
    return (
      <div className={clsx('relative overflow-hidden rounded-lg', 'max-w-[80%] w-fit', className)}>
        <Image src={message.url} alt="" className="max-w-full" />
      </div>
    )
  }

  if (message.type === MessageType.VIDEO) {
    return (
      <div className={clsx('relative overflow-hidden rounded-lg', 'max-w-[80%] w-fit', className)}>
        <video src={message.url} controls className="w-full max-h-[30vh]">
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
        <div className="mt-2 border rounded-lg p-2 bg-gray-50 overflow-hidden border-l-4 border-l-yellow-500">
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
      <a href={part.content} target="_blank" className="text-[#3fa9ff]">
        {part.content}
      </a>
    )
  }

  if (part.type === 'telegram') {
    return (
      <a href={part.content} target="_blank" className="text-[#3fa9ff]">
        {part.content}
      </a>
    )
  }
  return null
}
