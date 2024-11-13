import { WrappedMessage } from '@/components/Chat/types'
import { FormattedMessage, Message } from '@/components/SDK/BaeimSDK'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  const mobileRegex = /android|iphone|ipad|ipod|opera mini|iemobile|wpdesktop/i
  return mobileRegex.test(userAgent)
}

export const getChatId = (userIdA: number, userIdB: number): string => {
  return [userIdA, userIdB].sort().join('_')
}

export const getWrappedMessage = (message: FormattedMessage): WrappedMessage => {
  return {
    ...message.content.entity,
    sender: Number(message.fromUID),
    receiver: Number(message.toUID),
    messageSeq: message.messageSeq,
    timestamp: message.timestamp,
  }
}
