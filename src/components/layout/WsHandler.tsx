import { useStore } from '@/store'
import { memo, useEffect } from 'react'

const WsHandler = () => {
  const { send, onMessage } = useStore((state) => {
    return {
      send: state.send,
      onMessage: state.onMessage,
    }
  })

  const handleMessage = (data: any) => {
    console.log(data)
  }

  useEffect(() => {
    const cleanup = onMessage(handleMessage)
    return () => {
      cleanup()
    }
  }, [])

  return <></>
}

export default memo(WsHandler)
