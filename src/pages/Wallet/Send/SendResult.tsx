import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { IWeb3Type, Web3Type } from '@/store/wallet/chainType'
import { TContainer } from '@/components/tmd'
import BaseButton from '@/components/BaseButton/BaseButton'
import clsx from 'clsx'
import sentSubmitted from '@/components/tmd/svgs/send-submitted.png'
import Icon from '@/components/comm/Icon'
// @ts-ignore
const AveragingProcessTime: Record<IWeb3Type, string> = {
  EVM: `1 minutes`,
  BTC: `60 minutes`,
  SOL: `30 seconds`,
  // TRON: `1 minutes`,
  TON: `30 seconds`,
  // SUI: `30 seconds`,
  ALL: `1 minutes`,
}

export default function SendResult() {
  const params = useParams()
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const chainType = search.get('chain_type') as Web3Type
  const hash = search.get('hash')
  // const { theme } = useTheme()
  const toTransactionDetail = () => {
    if (hash) navigate(`/wallet/history/detail?hash=${encodeURIComponent(hash)}`)
  }
  const lightTheme = true //theme === 'light'
  return (
    <>
      {/* <BackButton onClick={() => navigate('/')} /> */}
      <TContainer className="px-5 size-full overflow-y-auto">
        <div className="flex h-full flex-1 flex-col justify-between py-[16px]">
          <div>
            <div className="mb-[20px] mt-[160px] flex w-full justify-center">
              <Icon name="icon-submitted" style={{ width: '164px', height: '164px' }}></Icon>
            </div>

            <div className="mb-[16px] w-full text-center text-xl font-semibold  text-t1">
              Transaction submitted
            </div>
            <div className="mx-4 text-center  text-xs text-t2">
              The transaction is being processed on block chain, averaging{' '}
              <span className="text-red">{`${AveragingProcessTime?.[chainType] ?? `1 minutes`}`}</span>
              .
            </div>
          </div>

          <div className="mb-2 space-y-2">
            {/* {params.from === 'send' && ( */}
            <BaseButton
              text="View transaction details"
              handler={toTransactionDetail}
              height="52px"
            />
            {/* )} */}

            <button
              className="rounded-[42px] bg-bg3 flex items-center justify-center w-full text-sm font-semibold"
              style={{ height: '52px' }}
              onClick={() => navigate('/wallet')}
            >
              Got it
            </button>
          </div>
        </div>
      </TContainer>
    </>
  )
}
