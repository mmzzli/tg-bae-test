import { createSignal } from '@/utils/chat/signals'
import { useRef } from 'react'

export function useSignal<T>(initial?: T) {
  const signalRef = useRef<ReturnType<typeof createSignal<T>>>()
  signalRef.current ??= createSignal<T>(initial)
  return signalRef.current
}
