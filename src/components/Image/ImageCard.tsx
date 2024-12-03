import { Swiper, SwiperSlide } from 'swiper/react'
import React, { useMemo, useState } from 'react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { formatImage } from '@/utils/utils'
import { Swiper as SwiperType } from 'swiper'
import Image from '@/components/Image/Image'
interface ImageCardProps {
  data: FormatterListItem
  handleImageClick: (images: string[], index: number) => void
  resourcesEve: (post_id: number, url: string) => void
}
const ImageCard: React.FC<ImageCardProps> = ({ data, handleImageClick }) => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)

  const imagesPreview = useMemo(() => {
    return data.media.map((item) => formatImage(item, false))
  }, [data])

  const [currentIndex, SetCurrentIndex] = useState(0)

  const firImageHeight = useMemo(() => {
    if (data.pic_height && data.pic_width) {
      const { width } = document.body.getBoundingClientRect()
      const pic_width = Number(data.pic_width.split(':')[0])
      const pic_height = Number(data.pic_height.split(':')[0])
      return (pic_height * width) / pic_width
    }
    return 0
  }, [data])
  return (
    <>
      <div className="border-t-[0.5px] border-[rgba(0,0,0,0.1)] relative">
        {imagesPreview.length > 1 && (
          <div className="absolute z-[2] right-3 top-3 px-3.5 py-1.5 bg-[#494950] rounded-full text-white text-3.5 font-Roboto">
            {currentIndex + 1}/{imagesPreview.length}
          </div>
        )}
        <Swiper
          onSwiper={setSwiper}
          onSlideChange={(swiper: SwiperType) => {
            SetCurrentIndex(swiper.activeIndex)
          }}
        >
          {data.media.map((image, index) => {
            return (
              <SwiperSlide
                key={`${data.id}-${image}`}
                style={{ height: firImageHeight + 'px' }}
                className={'flex items-center overflow-hidden'}
              >
                <Image
                  src={formatImage(image, false)}
                  alt={data.title}
                  width="100%"
                  height="100%"
                  onClick={() => handleImageClick(data.media, index)}
                />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>
    </>
  )
}

export default ImageCard
