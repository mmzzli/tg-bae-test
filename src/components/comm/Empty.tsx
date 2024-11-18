import { Text } from '@chakra-ui/react'

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
        <Text color="#62636F" fontSize="14px" lineHeight="16px" marginBottom="4px">
          {title}
        </Text>
      )}
      {description && (
        <div className="description text-center chakra-text text-sm font-normal font-poppins">
          {description}
        </div>
      )}
      {children}
    </div>
  )
}

export default Empty
