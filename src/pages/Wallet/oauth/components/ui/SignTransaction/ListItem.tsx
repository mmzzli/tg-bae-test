import { ReactNode } from 'react'

function ListItem({
  title,
  children,
  className = '',
  np
}: {
  title: string | ReactNode
  children: React.ReactNode
  className?: string
  np?: boolean
}) {
  return (
    <div
      className={`${className} flex items-center justify-between gap-[8px] py-[8px]`}
    >
      <div className={`text-sm text-title/60`}>{title}</div>
      <div className={`text-sm text-black`}>{children}</div>
    </div>
  )
}

export default ListItem
