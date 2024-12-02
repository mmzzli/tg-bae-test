import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { Box } from '@chakra-ui/react'
import { formatImage } from '@/utils/utils'
import React from 'react'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import Image from '../Image/Image'

interface ImageGridProps {
  data: FormatterListItem
  handleImageClick: (images: string[], index: number) => void
  resourcesEve: (post_id: number, url: string) => void
}
const ImageGrid: React.FC<ImageGridProps> = ({ data, handleImageClick, resourcesEve }) => {
  if (data.media.length === 1) {
    return (
      <Box position="relative" minH={data.media?.[0] === '' ? '200px' : 'auto'}>
        <Image
          src={formatImage(data.media?.[0] ?? data?.media ?? '', false)}
          alt={data.title}
          errorClassName="rounded-[4px] h-[150px]"
          width={data.pic_width}
          height={data.pic_height}
          className={`w-[230px] rounded-[4px]`}
          style={{
            height: (230 * Number(data.pic_height)) / Number(data.pic_width) + 'px',
          }}
          onClick={() => handleImageClick([data.media?.[0] ?? data?.media ?? ''], 0)}
        />
        {data.media?.[0] === '' && (
          <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
        )}
      </Box>
    )
  }
  if (data.media.length === 4) {
    return (
      <div className="relative px-4" style={{ minHeight: data.media?.[0] === '' ? '200px' : '' }}>
        <div className="grid grid-cols-3 gap-2">
          <div className="grid grid-cols-2 gap-2 col-span-2">
            {data.media.map((i, ind) => (
              <Image
                src={formatImage(i, false)}
                alt={data.title}
                width="100%"
                height="100%"
                key={i}
                onClick={() => handleImageClick(data.media, ind)}
                rect
              />
            ))}
          </div>
          <div className=""></div>
        </div>
        {data.media?.[0] == '' && (
          <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
        )}
      </div>
    )
  }
  return (
    <div className="relative px-4" style={{ minHeight: data.media?.[0] === '' ? '200px' : '' }}>
      <div className="grid grid-cols-3 gap-2">
        {data.media.map((i, ind) => (
          <Image
            src={formatImage(i, false)}
            alt={data.title}
            width="100%"
            height="100%"
            key={i}
            onClick={() => handleImageClick(data.media, ind)}
            rect
          />
        ))}
      </div>
      {data.media?.[0] == '' && (
        <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
      )}
    </div>
  )
}
export default ImageGrid
