import { WrappedMessage } from '@/components/Chat/types'
import { FormattedMessage } from '@/components/SDK/BaeimSDK'
import BigNumber from 'bignumber.js'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.ceil(seconds % 60)
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
    channelID: message.channel.channelID,
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
      // if (deltaTime < 60 * 1000) ret = 'just now'
      // // Otherwise, display the "hh:mm" format
      // else ret = dateFormat(srcDate, 'hh:mm')
      // Within 1 hour, show minutes ago
      // else if (deltaTime < 60 * 60 * 1000) {
      //   const minutes = Math.floor(deltaTime / (60 * 1000))
      //   ret = `${minutes}m ago`
      // }
      // Within today, show hours ago
      // else {
      //   const hours = Math.floor(deltaTime / (60 * 60 * 1000))
      //   ret = `${hours}h ago`
      // }
      ret = dateFormat(srcDate, 'hh:mm')
    }
    // Same year and different day (i.e., yesterday and previous days)
    else {
      // Yesterday (1 day ago from "now")
      let yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      // Comparing the "month" and "day" of the target date with the "yesterday" calculated above is the most accurate (if using the time difference, it is inaccurate, e.g., the current time is 2019/02/22 01:00, and srcDate is 2019/02/21 23:00, the difference between the two is only 2 hours, and directly using "deltaTime/(3600 * 1000) > 24 hours" to determine if it is yesterday is completely ridiculous)
      if (srcMonth === yesterdayDate.getMonth() + 1 && srcDateD === yesterdayDate.getDate())
        ret = 'Yesterday' // + timeExtraStr // -1d
      else {
        // let deltaHour = deltaTime / (3600 * 1000)

        // if (deltaHour <= 7 * 24) {
        //   let weekday = new Array(7)
        //   weekday[0] = 'Sun'
        //   weekday[1] = 'Mon'
        //   weekday[2] = 'Tue'
        //   weekday[3] = 'Wed'
        //   weekday[4] = 'Thu'
        //   weekday[5] = 'Fri'
        //   weekday[6] = 'Sat'

        //   let weedayDesc = weekday[srcDate.getDay()]
        //   ret = weedayDesc + timeExtraStr
        // } else ret = dateFormat(srcDate, 'yyyy/M/d') + timeExtraStr

        // ret = dateFormat(srcDate, 'M/d')
        ret = `${monthNames[srcDate.getMonth()]} ${srcDate.getDate()}`
      }
    }
  }
  // 往年
  else {
    ret = dateFormat(srcDate, 'M/d/yyyy') // + timeExtraStr
  }

  return ret
}

export const getMessageTimeDivider = (timestamp: number, mustIncludeTime: boolean) => {
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
    // Same day (only if the month and date are the same)
    if (currentMonth === srcMonth && currentDateD === srcDateD) {
      ret = dateFormat(srcDate, 'hh:mm')
    }
    // Same year and different day (i.e., yesterday and previous days)
    else {
      // Yesterday (1 day ago from "now")
      let yesterdayDate = new Date()
      yesterdayDate.setDate(yesterdayDate.getDate() - 1)

      // Comparing the "month" and "day" of the target date with the "yesterday" calculated above is the most accurate (if using the time difference, it is inaccurate, e.g., the current time is 2019/02/22 01:00, and srcDate is 2019/02/21 23:00, the difference between the two is only 2 hours, and directly using "deltaTime/(3600 * 1000) > 24 hours" to determine if it is yesterday is completely ridiculous)
      if (srcMonth === yesterdayDate.getMonth() + 1 && srcDateD === yesterdayDate.getDate())
        ret = 'Yesterday' + timeExtraStr // -1d
      else {
        // let deltaHour = deltaTime / (3600 * 1000)

        // if (deltaHour <= 7 * 24) {
        //   let weekday = new Array(7)
        //   weekday[0] = 'Sun'
        //   weekday[1] = 'Mon'
        //   weekday[2] = 'Tue'
        //   weekday[3] = 'Wed'
        //   weekday[4] = 'Thu'
        //   weekday[5] = 'Fri'
        //   weekday[6] = 'Sat'

        //   let weedayDesc = weekday[srcDate.getDay()]
        //   ret = weedayDesc + timeExtraStr
        // } else ret = dateFormat(srcDate, 'yyyy/M/d') + timeExtraStr

        ret = dateFormat(srcDate, 'M/d') + timeExtraStr
      }
    }
  }
  // 往年
  else {
    ret = dateFormat(srcDate, 'M/d/yyyy') + timeExtraStr
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
      'https://$1/cdn-cgi/image/width=500,height=500,fit=crop,gravity=center,quality=85/$2'
    )
  } else {
    return url.replace(reg, 'https://$1/cdn-cgi/image/width=600,fit=contain,quality=85/$2')
  }
}

type FitType = 'contain' | 'cover' | 'fill'
interface ImageParams {
  url: string
  width?: number
  fit?: FitType
  quality?: number
}

export const formatImageNew = ({
  url,
  width = 230,
  fit = 'contain',
  quality = 40,
}: ImageParams): string => {
  try {
    const urlObj = new URL(url)

    const params: string[] = []
    if (width) params.push(`width=${width}`)
    if (fit) params.push(`fit=${fit}`)
    if (quality) params.push(`quality=${quality}`)

    const newPath = `/cdn-cgi/image/${params.join(',')}${urlObj.pathname}`

    return `${urlObj.protocol}//${urlObj.host}${newPath}`
  } catch (error) {
    console.error('Invalid URL:', error)
    return url
  }
}

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle(func: (...args: any[]) => void, wait: number) {
  let lastTime = 0

  return (...args: any[]) => {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      // @ts-ignore
      func.apply(this, args)
    }
  }
}

export const genShareLinkFn = async (
  title: string,
  pid: number,
  uid: number,
  getLinkHandlerAsync: any
) => {
  const shareText = encodeURIComponent(title)
  const { host, ref } = await getLinkHandlerAsync({ pid, uid })
  console.log(host, ref, 'getLinkResult')

  const copyLink = encodeURIComponent(`${import.meta.env.VITE_API_URL}link/${ref}`)
  console.log('copyLink', decodeURIComponent(copyLink))

  const shareLink = `https://t.me/share/url?url=${copyLink}&text=${shareText}`
  return {
    copyLink,
    shareLink,
  }
}

export const formatNumber = (num: number): string => {
  if (num < 10_000) {
    return num.toLocaleString()
  }

  const units = [
    { value: 1_000_000_000, symbol: 'B' },
    { value: 1_000_000, symbol: 'M' },
    { value: 1_000, symbol: 'K' },
  ]

  for (const unit of units) {
    if (num >= unit.value) {
      // 不四舍五入，保留 2 位小数
      const formatted = Math.floor((num / unit.value) * 100) / 100
      const formattedStr = formatted.toString()

      return formattedStr.endsWith('.0')
        ? `${formattedStr.slice(0, -2)}${unit.symbol}`
        : `${formattedStr}${unit.symbol}`
    }
  }

  return num.toString()
}

export const splitNumberParts = (num: number) => {
  const bigNum = new BigNumber(num)
  const numStr = bigNum.toFixed() // 保持原始数字格式，不转科学计数法

  // 检查是否小于最小值 0.00000001
  if (bigNum.isGreaterThan(0) && bigNum.isLessThan('0.00000001')) {
    return {
      integerPart: '≈0',
      dot: '.',
      zeros: null,
      decimalPart: '00',
    }
  }

  // 如果是整数，直接返回
  if (!numStr.includes('.')) {
    return {
      integerPart: numStr,
      dot: null,
      zeros: null,
      decimalPart: null,
    }
  }

  const [integerPart, decimalPart] = numStr.split('.')

  // 处理小数部分，可以指定最大位数
  const truncateAndTrimZeros = (decimal: string, maxDigits: number) => {
    const truncated = decimal.slice(0, maxDigits)
    const trimmed = truncated.replace(/0+$/, '')
    return trimmed || null
  }

  // 匹配小数点后连续的 0
  const zeroMatch = decimalPart.match(/^(0+)/)

  if (zeroMatch) {
    const zerosCount = zeroMatch[1].length
    // 如果连续0的数量大于3，记录zerosCount，最多保留8位
    if (zerosCount > 3) {
      const remainingPart = decimalPart.slice(zerosCount)
      // 计算剩余可用的位数 = 8 - zerosCount
      const remainingDigits = Math.max(8 - zerosCount, 0)
      const processedDecimal = remainingPart ? truncateAndTrimZeros(remainingPart, remainingDigits) : null
      return {
        integerPart,
        dot: '.0',
        zeros: zerosCount,
        decimalPart: processedDecimal,
      }
    } else {
      // 如果连续0的数量不大于3，保留6位小数
      const processedDecimal = truncateAndTrimZeros(decimalPart, 6)
      return {
        integerPart,
        dot: '.',
        zeros: null,
        decimalPart: processedDecimal,
      }
    }
  }

  // 如果没有前导0，保留6位小数
  const processedDecimal = truncateAndTrimZeros(decimalPart, 6)
  return {
    integerPart,
    dot: '.',
    zeros: null,
    decimalPart: processedDecimal,
  }
}

export const formatDecimal = (num: number, decimalPlaces = 2) => {
  const bigNum = new BigNumber(num)

  // 使用 toFixed 截取小数位，但默认会四舍五入
  const factor = new BigNumber(10).pow(decimalPlaces)

  // 通过乘法、取整、再除法实现截取（不会四舍五入）
  const truncated = bigNum.multipliedBy(factor).integerValue(BigNumber.ROUND_DOWN).dividedBy(factor)

  return truncated.toFixed(decimalPlaces)
}

/**
 * 将数字格式化为美元字符串表示，可选择是否使用单位格式化（K/M/B）
 *
 * @param {number | string | null | undefined} input - 需要格式化的数字
 * @param {boolean} [useUnit=false] - 是否对大数使用 K/M/B 单位格式化
 * @returns {string} 格式化后的美元字符串
 *
 * @example
 * // 基本用法
 * formatUSD(1234.56)        // '$1234.56'
 * formatUSD(1234.56123123)        // '$1234.56'
 * formatUSD(0.003)          // '<$0.01'
 * formatUSD(0)              // '$0'
 *
 * // 使用单位格式化
 * formatUSD(1234567, true)  // '$1.2M'
 * formatUSD(1500, true)     // '$1.5K'
 *
 * // 整数值
 * formatUSD(100)            // '$100'
 *
 * // 小数处理
 * formatUSD(0.3)            // '$0.3'
 * formatUSD(0.30)           // '$0.3'  // 自动移除末尾的0
 *
 * // 无效输入处理
 * formatUSD(null)           // '-'
 * formatUSD(undefined)      // '-'
 * formatUSD('')             // '-'
 */
export const formatUSD = (
  input: number | string | null | undefined,
  useUnit: boolean = false
): string => {
  if (input === null || input === undefined || input === '' || isNaN(Number(input))) {
    return '-'
  }

  const num = new BigNumber(input)

  if (num.isEqualTo(0)) {
    return '$0'
  }

  if (num.isLessThan(0.01) && num.isGreaterThan(0)) {
    return '<$0.01'
  }

  const units = [
    { value: 1_000_000_000, symbol: 'B' },
    { value: 1_000_000, symbol: 'M' },
    { value: 1_000, symbol: 'K' },
  ]

  if (useUnit) {
    for (const unit of units) {
      if (num.isGreaterThanOrEqualTo(unit.value)) {
        const formatted = num.dividedBy(unit.value).toFixed(1, BigNumber.ROUND_DOWN)
        return formatted.endsWith('.0')
          ? `$${formatted.slice(0, -2)}${unit.symbol}`
          : `$${formatted}${unit.symbol}`
      }
    }
  }

  if (num.isGreaterThanOrEqualTo(1) && num.isInteger()) {
    return `$${num.toFixed(0)}`
  }

  if (num.isGreaterThanOrEqualTo(1)) {
    return `$${num.toFixed(2, BigNumber.ROUND_DOWN)}`
  }

  // 修改：去掉多余的 0（如 0.30 => 0.3）
  return `$${num
    .toFixed(2, BigNumber.ROUND_DOWN)
    .replace(/\.0+$/, '')
    .replace(/(\.[1-9]*)0+$/, '$1')}`
}
