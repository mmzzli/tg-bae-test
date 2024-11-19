import { BaseModal } from '@/components/Modal/BaseModal'
import BaseButton from '@/components/BaseButton/BaseButton'
import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
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
  const [checked, setChecked] = useState<string[]>([])
  const toast = useToast()

  const handleCheck = (option: string) => {
    setChecked((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    )
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        onClose(false)
      }}
      height="460px"
      animation={{
        duration: 400,
        timingFunction: 'ease-in-out',
      }}
      theme={{
        darkBackgroundColor: '#1a1a1a',
        lightBackgroundColor: '#ffffff',
        handleColor: '#d1d5db',
      }}
      closeOnBackdropClick={true}
      showHandle={false}
    >
      <div className="mt-4 w-full">
        <h3 className="font-bold text-2xl mb-[20px]">Report the post</h3>
        <div className="flex flex-col gap-4">
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2">
              <input
                type="checkbox"
                className="relative w-[15px] h-[15px] border-2 border-[#62636F] bg-transparent checked:bg-white checked:border-[#fff] appearance-none
                          after:content-[''] after:hidden checked:after:block after:border-solid
                          after:absolute after:w-[4px] after:h-[7px]
                          after:border-r-[2px] after:border-b-[2px]
                          after:border-l-0 after:border-t-0
                        after:border-black
                          after:rotate-45 after:top-[0px] after:left-[2.5px]"
                checked={checked.includes(option)}
                onChange={() => handleCheck(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        <div className="mt-10 mx-4">
          <BaseButton
            text="Report"
            handler={() => {
              onClose(false)
              toast({
                render: () => {
                  return <CustomToast title="Delete post success" type={typeOptions.success} />
                },
                status: 'success',
                position: 'top',
              })
            }}
          />
        </div>
      </div>
    </BaseModal>
  )
}

export default Report
