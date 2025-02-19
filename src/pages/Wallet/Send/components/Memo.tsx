import { TextArea } from 'antd-mobile'
import { useState, useEffect } from 'react'

interface MemoType {
  memoChange: (val: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

const ConsmosMemo = (props: MemoType) => {
  const [input, setInput] = useState('')

  const handleTxtChange = (val: string) => {
    setInput(val)
    props.memoChange && props.memoChange(val)
  }

  useEffect(() => {
    return () => {
      setInput('')
    }
  }, [])

  return (
    <div className="mb-[4px] flex flex-col items-center justify-between space-y-2 py-[14px]">
      <div className="w-full">
        <span className="text-sm text-t3">Memo</span>
      </div>
      <div className="w-full rounded-[6px] border-[0.5px] border-b-l1">
        <TextArea
          placeholder="If the receiving platform requires you to provide a memo, please enter it here to avoid any potential loss of funds."
          autoSize={{ minRows: 3, maxRows: 5 }}
          value={input}
          style={{
            '--font-size': '14px',
            '--color': 'var(--text-t1)',
            padding: '8px',
          }}
          onChange={handleTxtChange}
          onClick={() => props.onFocus?.()}
          onFocus={() => props.onFocus?.()}
          onBlur={() => {
            setTimeout(() => {
              props.onBlur?.()
            }, 200)
          }}
        />
      </div>
    </div>
  )
}

export default ConsmosMemo
