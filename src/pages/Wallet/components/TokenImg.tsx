import { useMemo } from 'react'
import {
  getChainByChainId,
  nativeTokenFilter,
  NativeTokenSymbol,
} from '@/store/wallet/util/tokenHelper'

import { TTokenImage } from '@/components/tmd'

interface TokenUIImgType {
  symbol: string
  image: string | undefined
  chainId: number
  isNative: boolean | undefined
  symbolSize?: number
  chainSize?: number
  chainImg?: boolean
  hideChainImg?: boolean
}

const TokenImg = ({
  symbol,
  image,
  chainId,
  isNative = false,
  symbolSize = 36,
  chainSize = 16,
  hideChainImg,
}: TokenUIImgType) => {
  const filterSymbol = nativeTokenFilter({
    isNative,
    symbol,
    chainId,
  })

  const chainImage = useMemo(() => {
    if (hideChainImg) {
      return undefined
    }
    if (typeof chainId !== 'number') {
      return undefined
    }
    if (filterSymbol) {
      return getChainByChainId(chainId ?? -1)?.icon
    }
    if (isNative) {
      return undefined
    }
    return getChainByChainId(chainId ?? -1)?.icon
  }, [isNative, filterSymbol, chainId])

  return (
    <TTokenImage
      image={image || ''}
      size={symbolSize}
      chainImage={chainImage}
      chainSize={chainSize}
      symbol={symbol}
      lazy
    />
  )
}

export default TokenImg
