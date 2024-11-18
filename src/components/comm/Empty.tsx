const Empty: React.FC<{
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  icon?: React.ReactNode
  children?: React.ReactNode | React.ReactNode[]
}> = ({ title, description, icon, children }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 mt-[115px]">
      {icon && <div className="icon w-[164px] h-[164px]">{icon}</div>}
      {title && (
        <div className="title text-center text-[var(--Dark-T3, #424048)] text-sm font-normal font-poppins">
          {title}
        </div>
      )}
      {description && (
        <div className="description text-center text-[var(--Dark-T3, #424048)] text-sm font-normal font-poppins">
          {description}
        </div>
      )}
      {children}
    </div>
  )
}

export default Empty
