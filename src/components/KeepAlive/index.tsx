import React, { Suspense } from 'react'

const cache = new Map<
  string,
  {
    element: React.ReactNode
  }
>()

interface Props {
  id: string
  children: React.ReactNode
}

export const KeepAlive: React.FC<Props> = ({ id, children }) => {
  if (!cache.has(id)) {
    cache.set(id, {
      element: <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>,
    })
  }

  return <>{cache.get(id)?.element}</>
}

export const clearKeepAliveCache = (id?: string) => {
  if (id) {
    cache.delete(id)
  } else {
    cache.clear()
  }
}
