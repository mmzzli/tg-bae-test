'use client'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './index.css'
import HomeList from '@/components/TT/HomeList'
import ChristmasList from '@/components/TT/ChristmasList'

export interface TVideo {
  url: string
  poster?: string
}

const TTPlayer: React.FC = () => {
  const { state } = useLocation()
  useEffect(() => {
    return () => {
      if(window.videoElement){
        window.videoElement.pause()
      }
    }
  }, [])
  return (
      <>
        {state.sourcePath === '/home' ? <HomeList /> : <ChristmasList />}
      </>
  )
}

export default TTPlayer
