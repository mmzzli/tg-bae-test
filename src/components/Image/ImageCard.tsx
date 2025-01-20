
import { Swiper } from 'antd-mobile'
import React, { useEffect, useMemo, useState } from 'react'
import { FormatterListItem } from '@/store/slices/resourceListSlice'
import { formatImage, formatTime, generateUUID } from '@/utils/utils'
import { Swiper as SwiperType } from 'swiper'
import Image from '@/components/Image/Image'
import FrostedGlass from '@/components/ResourceList/FrostedGlass'
import { calc, HStack, Text } from '@chakra-ui/react'
import { useStore } from '@/store'
import { useTMAUtils } from '@/hooks/useTMAUtils'
interface ImageCardProps {
  data: FormatterListItem
  handleImageClick: (images: string[], index: number) => void
  resourcesEve: (post_id: number, url: string, is_pay?: boolean) => void
}
const ImageCard: React.FC<ImageCardProps> = ({ data, handleImageClick, resourcesEve }) => {
  const { getCurrentUid } = useTMAUtils()

  const [currentIndex, SetCurrentIndex] = useState(0)
  const firImageWidth = useMemo(() => {
    return document.body.getBoundingClientRect().width
  }, [])

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
      <div className="border-t-[0.5px] border-[rgba(0,0,0,0.1)] relative z-[1]">
        <Swiper
          className={'z-[1]'}
          indicator={(total, current) =>{
            SetCurrentIndex(current)
            return null
          }}
        >
          {data.media.map((image, index) => {
            return (
              <Swiper.Item
                key={`${data.id}-${image}-${index}`}
                style={{
                  height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                  maxHeight:
                    'calc(100vh - var(--tg-safe-area-inset-top) - var(--tg-content-safe-area-inset-top) - 85px - 64px - 50px - 26px)',
                }}
                className={'flex items-center  overflow-hidden justify-center'}
              >
                <Image
                  src={[1, 2].includes(data?.act_type || 0) ? image : formatImage(image, false)}
                  alt={data.title}
                  // style={{ maxWidth: '100%', maxHeight: '100%' }}
                  style={{
                    ...(index === 0
                      ? {
                          width: '100%',
                          height: 'auto',
                          objectFit: 'cover'
                        }
                      : {
                          width: '100%',
                          height: firImageHeight ? firImageHeight + 'px' : 'calc(1.5*100vw)',
                          objectFit: 'contain'
                        })
                  }}
                  onClick={() => {
                    if (data.uid !== getCurrentUid() && !data.is_pay && data.price > 0) {
                      return
                    }
                    handleImageClick(data.media, index)
                  }}
                />
              </Swiper.Item>
            )
          })}
        </Swiper>
        {data.uid !== getCurrentUid() && !data.is_pay && data.price > 0 && (
          <FrostedGlass price={data.price} post_id={data.id} resourcesEve={resourcesEve} />
        )}
        {data && data.type === 1 ? (
          <div className={'absolute z-10 top-0 right-0'}>
            <HStack
              borderRadius="4px"
              bg="rgba(0, 0, 0, 0.40)"
              zIndex={4}
              position="absolute"
              top="12px"
              right="12px"
              p="4px 10px"
              gap="4px"
              height="29px"
              rounded="20px"
            >
              <Text color="white" fontSize="14px">
                {data.uid !== getCurrentUid() && !data.is_pay && data.price > 0 ? (
                  <>
                    <div className="flex items-center gap-1">
                      <i className="iconfont icon-image"></i> {data.pic_num}
                    </div>
                  </>
                ) : (
                  <>
                    {currentIndex + 1}&nbsp;/&nbsp;{data.pic_num}
                  </>
                )}
              </Text>
            </HStack>
          </div>
        ) : (
          ''
        )}
      </div>
    </>
  )
}

export default ImageCard
