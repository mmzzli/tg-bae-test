'use client'

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import HomeList from '@/components/TT/HomeList'
import ChristmasList from '@/components/TT/ChristmasList'
import ProfileList from '@/components/TT/ProfileList'
import './index.css'

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

  const renderList = () => {
    switch (true) {
      case state.sourcePath === '/home':
        return <HomeList />
      case state.sourcePath === '/christmas':
        return <ChristmasList />
      case state.sourcePath.startsWith('/profile'):
        return <ProfileList type={state.sourceType} />
      default:
        return null
    }
  }

  return renderList()
}

export default TTPlayer
