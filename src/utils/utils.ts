import { WrappedMessage } from '@/components/Chat/types'
import { FormattedMessage, Message } from '@/components/SDK/BaeimSDK'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')
  return `${formattedMinutes}:${formattedSeconds}`
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

export const getTimeStringAutoShort = (timestamp: number, mustIncludeTime: boolean) => {
  let currentDate = new Date()
  let srcDate = new Date(timestamp)

  var currentYear = currentDate.getFullYear()
  let currentMonth = currentDate.getMonth() + 1
  let currentDateD = currentDate.getDate()

  let srcYear = srcDate.getFullYear()
  let srcMonth = srcDate.getMonth() + 1
  let srcDateD = srcDate.getDate()

  let ret = ''

  // Additional time minutes to display
  var timeExtraStr = mustIncludeTime ? ' ' + dateFormat(srcDate, 'hh:mm') : ''

  if (currentYear === srcYear) {
    let currentTimestamp = currentDate.getTime()
    let srcTimestamp = timestamp
    // Time difference (in milliseconds)
    let deltaTime = currentTimestamp - srcTimestamp

    // Same day (only if the month and date are the same)
    if (currentMonth === srcMonth && currentDateD === srcDateD) {
      // Time difference within 60 seconds
      if (deltaTime < 60 * 1000) ret = 'just now'
      // // Otherwise, display the "hh:mm" format
      // else ret = dateFormat(srcDate, 'hh:mm')
      // Within 1 hour, show minutes ago
      else if (deltaTime < 60 * 60 * 1000) {
        const minutes = Math.floor(deltaTime / (60 * 1000))
        ret = `${minutes}m ago`
      }
      // Within today, show hours ago
      else {
        const hours = Math.floor(deltaTime / (60 * 60 * 1000))
        ret = `${hours}h ago`
      }
    }
    // Same year and different day (i.e., yesterday and previous days)
    else {
      // Yesterday (1 day ago from "now")
      let yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      // Comparing the "month" and "day" of the target date with the "yesterday" calculated above is the most accurate (if using the time difference, it is inaccurate, e.g., the current time is 2019/02/22 01:00, and srcDate is 2019/02/21 23:00, the difference between the two is only 2 hours, and directly using "deltaTime/(3600 * 1000) > 24 hours" to determine if it is yesterday is completely ridiculous)
      if (srcMonth === yesterdayDate.getMonth() + 1 && srcDateD === yesterdayDate.getDate())
        ret = 'yesterday' + timeExtraStr // -1d
      else {
        let deltaHour = deltaTime / (3600 * 1000)

        if (deltaHour <= 7 * 24) {
          let weekday = new Array(7)
          weekday[0] = 'Sun'
          weekday[1] = 'Mon'
          weekday[2] = 'Tue'
          weekday[3] = 'Wed'
          weekday[4] = 'Thu'
          weekday[5] = 'Fri'
          weekday[6] = 'Sat'

          let weedayDesc = weekday[srcDate.getDay()]
          ret = weedayDesc + timeExtraStr
        } else ret = dateFormat(srcDate, 'yyyy/M/d') + timeExtraStr
      }
    }
  }
  // 往年
  else {
    ret = dateFormat(srcDate, 'yyyy/M/d') + timeExtraStr
  }

  return ret
}

const dateFormat = function (date: Date, fmt: string) {
  let o: any = {
    M: date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  }
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return fmt
}

export const formatImage = (url: string, grid = true) => {
  // regexp format
  const reg = /^https:\/\/([\w.-]+)\/(.+)$/gi
  if (grid) {
    return url.replace(
      reg,
      'https://$1/cdn-cgi/image/width=500,height=500,fit=crop,gravity=center,quality=75/$2'
    )
  } else {
    return url.replace(reg, 'https://$1/cdn-cgi/image/width=800,fit=contain,quality=75/$2')
  }
}
