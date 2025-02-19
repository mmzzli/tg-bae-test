import { TokenImageProps } from './PropsType'
import { mergeProps } from '../utils/get-default-props'
import classNames from 'classnames'
import { addUnit } from '../utils/format/unit'
import { Image } from 'antd-mobile'
import { useEffect, useMemo, useState } from 'react'
import { defaultInitials, getRandomColor } from '../utils/avatar/avatar'

const defaultProps = {
  size: 36,
  chainSize: 16,
  lazy: false,
  symbol: '*'
}

export function TokenImage(p: TokenImageProps) {
  const props = mergeProps(p, defaultProps)
  const {
    image,
    size,
    chainImage,
    chainSize,
    chainClassName,
    className,
    symbol,
    lazy,
    ...restProps
  } = props

  const imageStyles = 'rounded-full text-base text-white'
  const chainStyles =
    'absolute -right-1 -bottom-[3px] rounded-full border border-bg1'

  const imgSize = addUnit(size)
  const imgStyles = {
    width: imgSize,
    height: imgSize
  }

  const chainImgSize = addUnit(chainSize)

  const [showImg, setShowImg] = useState(true)
  const [showChainImg, setShowChainImg] = useState(true)

  const text = useMemo(() => {
    return defaultInitials(symbol || '*', { maxInitials: 1 })
  }, [symbol])

  const bgColor = useMemo(() => {
    return getRandomColor(symbol || '*')
  }, [symbol])

  useEffect(() => {
    if (image) setShowImg(true)
  }, [image])

  return (
    <div
      className={classNames('relative rounded-full flex-none', className)}
      style={imgStyles}
      {...restProps}
    >
      {showImg ? (
        <Image
          src={image}
          onError={() => setShowImg(false)}
          width={imgSize}
          height={imgSize}
          lazy={lazy}
          className={classNames(imageStyles)}
        />
      ) : (
        <div
          className={classNames(
            'uppercase flex items-center justify-center',
            imageStyles
          )}
          style={{ ...imgStyles, backgroundColor: bgColor }}
        >
          {text}
        </div>
      )}

      {chainImage && showChainImg && (
        <Image
          src={chainImage}
          onError={() => setShowChainImg(false)}
          width={chainImgSize}
          height={chainImgSize}
          lazy={lazy}
          className={classNames(chainStyles, chainClassName)}
        />
      )}
    </div>
  )
}
