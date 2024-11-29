import React from 'react'
import { useNavigate } from 'react-router-dom'
import BaseButton from '../BaseButton/BaseButton'
import { AddIcon1 } from '@/assets/icons'
import { useStore } from '@/store'
import { CustomToast, typeOptions } from '../comm/Toast'
import { useToast } from '@chakra-ui/react'

const CreateButton = React.memo(
  () => {
    const navigate = useNavigate()
    const { uploadThreads } = useStore((state) => ({
      uploadThreads: state.uploadTask.uploadThreads,
    }))
    const disabled = uploadThreads.length > 0
    const toast = useToast()
    const handleDisabledClick = (event: React.MouseEvent<HTMLDivElement>) => {
      toast({
        render: () => {
          return (
            <CustomToast
              title="Your post is being published, please wait."
              type={typeOptions.warning}
              top={
                window
                  .getComputedStyle(document.documentElement)
                  .getPropertyValue('--tg-safe-area-inset-top') &&
                parseInt(
                  window
                    .getComputedStyle(document.documentElement)
                    .getPropertyValue('--tg-safe-area-inset-top'),
                  10
                ) !== 0
                  ? parseInt(
                      window
                        .getComputedStyle(document.documentElement)
                        .getPropertyValue('--tg-safe-area-inset-top'),
                      10
                    ) +
                    44 +
                    'px'
                  : ''
              }
            />
          )
        },
        position: 'top',
      })
    }

    return (
      <div className="relative">
        <BaseButton
          text="Create"
          icon={
            <img
              src={AddIcon1}
              style={{ width: '10px', height: '10px', marginRight: '-3px', marginTop: '-1px' }}
            />
          }
          disabled={disabled}
          width="87px"
          handler={() => navigate('/post')}
        />
        {disabled && (
          <div
            className="absolute top-0 left-0 right-0 bottom-0"
            onClick={handleDisabledClick}
          ></div>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => true
) // 除非 uploadTask 变化，否则不更新

export default CreateButton
