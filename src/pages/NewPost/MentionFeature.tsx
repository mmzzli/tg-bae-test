import React, { useState, useRef, useEffect } from 'react'
import ReactQuill from 'react-quill'

import 'quill/dist/quill.snow.css'
import './mention.css'

import { getFansFollowers } from '@/api'
import { isMobileDevice } from '@/utils/utils'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useStore } from '@/store'

interface MentionCandidate {
  tgname: string
  avatar: string
  tg_id: number
  fans_id: number
  if_follow: boolean
}

interface MentionFeatureProps {
  title: string
  setTitle: (str: string) => void
  setIsFocused: (bool: boolean) => void
  featureRefBoll: any
  height?: string
  focusedTop?: (top: number) => void
}

const MentionFeature: React.FC<MentionFeatureProps> = ({
  title,
  setTitle,
  setIsFocused,
  featureRefBoll,
  height = '200px',
  focusedTop,
}) => {
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [showMentionList, setShowMentionList] = useState<boolean>(false)
  const [filteredCandidates, setFilteredCandidates] = useState<MentionCandidate[]>([])
  const [mentionTop, setMentionTop] = useState<number>(0)
  const [mentionLeft, setMentionLeft] = useState<number>(0)
  const [richTextValue, setRichTextValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const quillRef = useRef<any>(null)

  const token = useStore((state) => state.token)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const loadCandidates = async () => {
    try {
      const res: any = await getFansFollowers(current_uid)
      setMentionCandidates(res)
    } catch (error) {
      console.error('Failed to fetch mention candidates:', error)
    }
  }

  useEffect(() => {
    if (token && current_uid) {
      loadCandidates()
    }
  }, [current_uid, token])

  const handleMentionClick = (candidate: MentionCandidate) => {
    const quill = quillRef.current?.getEditor()
    if (!quill) return

    // Get the current selection
    const range = quill.getSelection(true)
    const mentionStartIndex = range.index - (searchTerm.length + 1)

    // Delete the search term including @
    quill.deleteText(mentionStartIndex, searchTerm.length + 1)

    // Insert the mention with special color
    quill.insertText(mentionStartIndex, `@${candidate.tgname}`, {
      color: '#6761FF',
      mention: true,
    })

    // Insert a space with default formatting
    quill.insertText(mentionStartIndex + candidate.tgname.length + 1, ' ', {
      color: '#333',
      mention: false,
    })

    // Move cursor to the end of the mention
    quill.setSelection(mentionStartIndex + candidate.tgname.length + 2, 0)

    setShowMentionList(false)
    setSearchTerm('')
  }

  const onChangeRichText = (value: string, delta: any, source: string, editor: any) => {
    setRichTextValue(value)
    setTitle(value)
    console.log(value, 'value')

    if (source !== 'user') return

    const selection = editor.getSelection()
    if (!selection) return
    const text = editor.getText() || ''

    // Find the position of @ before cursor
    const cursorPosition = selection.index
    const textBeforeCursor = text.slice(0, cursorPosition)

    const atIndex = textBeforeCursor.lastIndexOf('@')

    if (atIndex !== -1) {
      const searchText = textBeforeCursor.slice(atIndex + 1)

      // Only show mention list if @ is followed by valid search text
      if (!searchText.includes(' ')) {
        setSearchTerm(searchText)
        const filtered = mentionCandidates.filter((candidate) => {
          return candidate.tgname.toLowerCase().includes(searchText.toLowerCase())
        })
        setFilteredCandidates(filtered)

        // Get cursor position for mention list
        const bounds = quillRef.current?.getEditor().getBounds(cursorPosition)
        setMentionTop(bounds.top + bounds.height)
        setMentionLeft(bounds.left)

        setShowMentionList(true)
      } else {
        setShowMentionList(false)
      }
    } else {
      setShowMentionList(false)
    }
  }

  return (
    <div className="relative mt-4" style={{ height: height }}>
      <div style={{ width: '100%', minHeight: '200px' }}>
        <ReactQuill
          ref={quillRef}
          className="w-[100%] h-[100%] font-switzer"
          theme="snow"
          value={richTextValue}
          onChange={onChangeRichText}
          modules={{
            toolbar: false,
          }}
          placeholder="Say something..."
        />
      </div>

      {showMentionList && filteredCandidates.length > 0 && (
        <ul
          className="absolute left-0 z-[111] w-[100%] border-t border-gray-300 bg-white h-[200px] overflow-auto"
          style={{
            top: `${mentionTop + 10}px`,
            left: `${mentionLeft}px`,
          }}
        >
          {filteredCandidates.map((candidate) => (
            <li
              key={candidate.tgname}
              onClick={() => handleMentionClick(candidate)}
              className="p-2 cursor-pointer flex items-center hover:bg-gray-100"
            >
              <img
                src={candidate.avatar}
                alt={candidate.tgname}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <p className="text-sm text-[#333]">{candidate.tgname}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MentionFeature
