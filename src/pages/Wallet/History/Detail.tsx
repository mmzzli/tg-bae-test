import HistoryDetail from './BaseHistory/HistoryDetail'
// import { Loading } from '@/components/Loading'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Detail = () => {
  const [search] = useSearchParams()
  const hashParam = search.get('hash')
  const hash = (hashParam ? hashParam : undefined) as string | undefined
  const navigate = useNavigate()
  if (!hash || hash === 'null' || hash === 'undefined' || hash === '0') {
    return (
      <div className="size-full flex bg-bg1 px-[20px] pb-[16px] pt-[4px]">
        <BackButton onClick={() => navigate(-1)} />
        <div className="flex size-full items-center justify-center">
          <span>...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="size-full flex bg-bg1 px-[20px] pb-[16px] pt-[4px]">
      <BackButton onClick={() => navigate(-1)} />
      <HistoryDetail hash={decodeURIComponent(hash)} />
    </div>
  )
}

export default Detail
