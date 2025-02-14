import React, { memo, useMemo } from 'react'
import useLoginInfo from 'hooks/useLoginInfo'
import { toSvg } from 'jdenticon'

interface Interface {
  size?: number
  address: string
}

const WalletAvatar: React.FC<Interface> = ({ size = 16, address }) => {
  const svgData = useMemo(() => {
    return toSvg(address, size)
  }, [size, address])

  return (
    <div className="overflow-hidden rounded-[16px] text-t1">
      <div dangerouslySetInnerHTML={{ __html: svgData }} />
    </div>
  )
}

export default WalletAvatar
