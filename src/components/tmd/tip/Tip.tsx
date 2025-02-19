import { TIcon } from '@/components/tmd'
import { TipProps } from './PropsType'
import clsx from 'clsx'
import { IconArrowRight } from '../icons/arrowRight'

const Tip = ({ content, title = 'Attention', arrow = false, className }: TipProps) => {
  return (
    <div
      className={clsx(
        'mb-4 flex  items-start gap-2 rounded-[8px] border border-l1 p-3 text-xs text-t3',
        className
      )}
    >
      <TIcon name="tg_wallet_present-facetiousness" className="text-orange" fontSize="20" />
      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-t1">{title}</span>
          {content ? <span>{content}</span> : null}
        </div>
        {arrow ? <IconArrowRight className="text-t1" fontSize="20" /> : null}
      </div>
    </div>
  )
}

export default Tip
