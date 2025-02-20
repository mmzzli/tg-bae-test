import { TCopy } from '@/components/tmd'
import classNames from 'classnames'

const DetailInfoItem = ({
  title,
  content,
  isCopy,
  isLine,
  copyContent
}: {
  title: string | JSX.Element
  content: string | JSX.Element | undefined
  isCopy?: boolean
  isLine?: boolean
  copyContent?: string
}) => {
  return (
    <div className="flex min-h-[48px] w-full items-center justify-between gap-6 py-[14px]">
      <div className="flex h-full items-center whitespace-nowrap text-sm font-normal text-b1">
        {title}
      </div>
      <div className="flex max-w-[220px] grow justify-end gap-[6px] overflow-hidden text-b1">
        <div
          className={classNames('whitespace-normal break-all text-right', {
            ' underline': isLine
          })}
        >
          {content ? content : '--'}
        </div>
        {isCopy && typeof content === 'string' && (
          <TCopy text={copyContent || content || ''} />
        )}
      </div>
    </div>
  )
}

export default DetailInfoItem
