import { StateCreator } from 'zustand'
import { useStore } from '../store'
type MessageHandler = (data: any) => void
export interface WebSocketSlice {
  isConnected: boolean
  isConnecting: boolean
  messageHandlers: Set<MessageHandler>
  connect: () => Promise<void>
  disconnect: () => void
  send: (data: any) => void
  onMessage: (handler: MessageHandler) => () => void
}

export const createWebSocketSlice: StateCreator<WebSocketSlice> = (set, get) => {
  let ws: WebSocket | null = null
  let reconnectCount = 0
  let heartbeatTimer: NodeJS.Timeout | null = null
  const MAX_RECONNECT_ATTEMPTS = 5
  const HEARTBEAT_INTERVAL = 10000

  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send('ping')
      }
    }, HEARTBEAT_INTERVAL)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
  }

  const connect = async (): Promise<void> => {
    console.warn('ws connect')
    if (get().isConnecting || ws?.readyState === WebSocket.OPEN) {
      return
    }
    console.warn(get().isConnecting, ws?.readyState)

    set({ isConnecting: true })

    console.warn('ws connecting')

    return new Promise((resolve, reject) => {
      try {
        ws = new WebSocket(
          `wss://${import.meta.env.VITE_APP_ENV === 'production' ? 'ditto-dev.anyconn.org' : 'ditto-dev.anyconn.org'}/ws?auth=${useStore.getState().token}`
        )

        ws.onopen = () => {
          set({ isConnected: true, isConnecting: false })
          reconnectCount = 0
          startHeartbeat()
          resolve()
        }

        ws.onclose = () => {
          console.warn('ws close')
          set({ isConnected: false, isConnecting: false })
          stopHeartbeat()

          if (reconnectCount < MAX_RECONNECT_ATTEMPTS) {
            reconnectCount++
            setTimeout(() => {
              connect()
            }, 1000 * reconnectCount)
          }
        }

        ws.onerror = (error) => {
          console.warn('ws error', error)
          set({ isConnecting: false })
          reject(error)
        }

        ws.onmessage = (event) => {
          let data
          try {
            data = JSON.parse(event.data)
          } catch (e) {
            data = event.data
          }

          if (data.startsWith('fan') || data.startsWith('unread')) {
            const { messageHandlers } = get()
            messageHandlers.forEach((handler) => {
              try {
                handler(data)
              } catch (error) {
                console.error('Message handler error:', error)
              }
            })
          }
        }
      } catch (error) {
        set({ isConnecting: false })
        reject(error)
      }
    })
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
      ws = null
    }
    stopHeartbeat()
    set({ isConnected: false })
  }

  const send = (data: any) => {
    if (ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected')
    }
    ws.send(typeof data === 'string' ? data : JSON.stringify(data))
  }

  return {
    isConnected: false,
    isConnecting: false,
    messageHandlers: new Set<MessageHandler>(),
    connect,
    disconnect,
    send,
    onMessage: (handler: MessageHandler) => {
      const { messageHandlers } = get()
      messageHandlers.add(handler)
      return () => {
        messageHandlers.delete(handler)
      }
    },
  }
}
