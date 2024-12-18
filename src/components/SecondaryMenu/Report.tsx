import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { useState } from 'react'
import { Checkbox, CheckboxGroup, useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '../comm/Toast'

interface ReportProps {
  isOpen: boolean
  onClose: (flag: boolean) => void
}

const options = [
  'I don’t like this post',
  'Violates terms of service',
  'Contains copyrighted material(DMCA)',
  'Child sexual abuse material(CSAM)',
  'Report spam',
  'Report Abuse',
]

const Report: React.FC<ReportProps> = ({ isOpen, onClose }) => {
  const toast = useToast()

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose(false)
      }}
      height="467px"
      animation={{
        duration: 400,
        timingFunction: 'ease-in-out',
      }}
      theme={{
        lightBackgroundColor: '#ffffff',
        handleColor: '#d1d5db',
      }}
      closeOnBackdropClick={true}
      showHandle={false}
    >
      <div className="mt-[10px] w-full no-tap">
        <h3 className="font-bold text-2xl mb-[26px] text-[#333] dark:text-[#fff]">
          Report the post
        </h3>
        <div className="flex flex-col gap-[15px]">
          <CheckboxGroup>
            {options.map((option, index) => (
              // <label key={option} className="flex items-center gap-2 not-tap">
              //   <input
              //     type="checkbox"
              //     className="relative w-[15px] h-[15px] border-2 dark:border-[#62636F] border-[#ccc] bg-transparent
              //             dark:checked:bg-white dark:checked:border-[#fff] checked:bg-[#6254FF] checked:border-[#6254FF] appearance-none no-tap
              //               after:content-[''] after:hidden checked:after:block after:border-solid
              //               after:absolute after:w-[4px] after:h-[7px]
              //               after:border-r-[2px] after:border-b-[2px]
              //               after:border-l-0 after:border-t-0
              //             dark:after:border-black
              //             after:border-white
              //               after:rotate-45 after:top-[0px] after:left-[2.5px]"
              //     checked={checked.includes(option)}
              //     onChange={() => handleCheck(option)}
              //   />
              //   <span className="dark:text-white text-[#666] no-tap">{option}</span>
              // </label>

              <Checkbox value={option} key={index}>
                <span className="dark:text-white text-[#666] text-sm pl-[2px] mb-[2px]">
                  {option}
                </span>
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
        <div className="mt-[34px] mx-[20px]">
          <BaseButton
            text="Report"
            className="h-12"
            handler={() => {
              onClose(false)
              toast({
                render: () => {
                  return <CustomToast title={`Report submitted.`} type={typeOptions.success} />
                },
                position: 'bottom',
              })
            }}
          />
        </div>
      </div>
    </BaseModal>
  )
}

export default Report
