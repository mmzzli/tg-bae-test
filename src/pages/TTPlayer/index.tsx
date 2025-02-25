'use client'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './index.css'
import HomeList from '@/components/TT/HomeList'
import ChristmasList from '@/components/TT/ChristmasList'
import { destroyVideo } from '@/utils/utils'
import { useStore } from '@/store'

export interface TVideo {
  url: string
  poster?: string
}

const TTPlayer: React.FC = () => {
  const { state } = useLocation()
  const setTtVideoMuted = useStore((state) => state.setTtVideoMuted)
  useEffect(() => {
    return () => {
      setTtVideoMuted(true)
      destroyVideo()
    }
  }, [])
  return (
      <>
        {state.sourcePath === '/home' ? <HomeList /> : <ChristmasList />}
      </>
  )
}

export default TTPlayer
