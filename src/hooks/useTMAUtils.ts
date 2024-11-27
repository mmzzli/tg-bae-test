// import { isTMA, openTelegramLink, retrieveLaunchParams } from '@telegram-apps/sdk'
import { retrieveLaunchParams, isTMA, initUtils } from '@tma.js/sdk'
import { useEffect, useState } from 'react'

export const useTMAUtils = () => {
  const [isInTMA, setIsInTMA] = useState(false)
  const utils = initUtils()

  const launchParams = retrieveLaunchParams()

  useEffect(() => {
    const getTMAEnv = async () => {
      const tmaRes = await isTMA()
      setIsInTMA(tmaRes)
    }
    getTMAEnv()
  }, [])

  const openLink = async (url: string) => {
    try {
      if (isInTMA) {
        utils.openTelegramLink(url)
      } else {
        window.open(url)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const shareLink = async (url: string) => {
    try {
      if (isInTMA) {
        utils.openTelegramLink(url)
      } else {
        window.open(url)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const getCurrentUid = () => {
    return launchParams.initData?.user?.id ?? 0
  }

  return {
    isInTMA,
    shareLink,
    getCurrentUid,
    launchParams,
    openLink
  }
}
