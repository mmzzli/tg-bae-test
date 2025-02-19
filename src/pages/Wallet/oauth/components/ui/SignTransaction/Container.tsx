import classNames from 'classnames'
import { ReactNode } from 'react'

function Container({
  title,
  children,
  footer,
  className = '',
  bodyClassName
}: {
  title: string | ReactNode
  children: React.ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <>
      <div
        className={classNames(
          className,
          `flex h-full flex-1 flex-col justify-between px-[16px] pb-[16px] pt-[20px]`
        )}
      >
        <h2 className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
          {title}
        </h2>

        <div className="mt-[20px] w-full flex-1 overflow-auto rounded-[12px]">
          <div
            className={`${bodyClassName} rounded-[12px] bg-[#F9F9F9] px-[16px] py-[8px]`}
          >
            {children}
          </div>
        </div>

        {footer}
      </div>
    </>
  )
}

export default Container
