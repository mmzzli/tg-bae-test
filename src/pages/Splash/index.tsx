import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store'

const Splash: FC = () => {
  const navigate = useNavigate()
  const userInfo = useStore((state) => state.userInfo)
  const token = useStore((state) => state.token)

  useEffect(() => {
    if (userInfo.user_id && token) {
      navigate('/home')
    }
  }, [userInfo])

  return (
    <div className="w-full h-screen bg-[#0D0D0D] flex justify-center items-center">
      <div className="relative w-12 h-12">
        <div className="absolute w-full h-full border-4 border-white rounded-full animate-[ripple_1s_ease-out_infinite]" />
        <div className="absolute w-full h-full border-4 border-white rounded-full animate-[ripple_1s_ease-out_0.5s_infinite]" />
      </div>
    </div>
  )
}

export default Splash
