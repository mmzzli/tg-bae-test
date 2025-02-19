import { useState, useEffect, useCallback } from 'react'

const useCountdown = (initialTime: number = 60) => {
  const key = '_countdown'

  const diffTimeLeft = () => {
    const now = Date.now()
    try {
      const savedData = sessionStorage.getItem(key)
      if (savedData) {
        const { startTime, duration } = JSON.parse(savedData)
        const elapsed = Math.floor((now - startTime) / 1000)
        const remainingTime = Math.max(duration - elapsed, 0)
        return remainingTime
      }
    } catch (e) {
      // e
    }

    return 0
  }

  const [timeLeft, setTimeLeft] = useState(() => diffTimeLeft())
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      sessionStorage.removeItem(key)
      setIsActive(false)
      return
    }

    if (isActive) {
      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          if (newTime <= 0) {
            clearInterval(interval)
          }
          return newTime
        })
      }, 1000)

      const now = Date.now()
      sessionStorage.setItem(
        key,
        JSON.stringify({
          startTime: now - (initialTime - timeLeft) * 1000,
          duration: initialTime,
        })
      )

      return () => clearInterval(interval)
    }
  }, [timeLeft, isActive, initialTime])

  const startCountdown = useCallback(() => {
    if (!isActive) {
      setIsActive(true)
    }
  }, [isActive])

  const stopCountdown = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetCountdown = useCallback(() => {
    const now = Date.now()
    setTimeLeft(initialTime)
    sessionStorage.setItem(
      key,
      JSON.stringify({
        startTime: now,
        duration: initialTime,
      })
    )
    setIsActive(true)
  }, [initialTime])

  const clearCountdown = useCallback(() => {
    sessionStorage.removeItem(key)
  }, [])

  return {
    timeLeft,
    startCountdown,
    stopCountdown,
    resetCountdown,
    diffTimeLeft,
    clearCountdown,
  }
}

export default useCountdown
