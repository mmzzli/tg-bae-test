import React, { useState, useRef, ChangeEvent, useEffect } from 'react'
import { Textarea } from '@chakra-ui/react'

import { getFansFollowers } from '@/api'
import { generateUUID, isMobileDevice } from '@/utils/utils'
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
  isFocused: boolean
  featureRefBoll: any
}

const MentionFeature: React.FC<MentionFeatureProps> = ({ title, setTitle, setIsFocused, isFocused, featureRefBoll }) => {
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [showMentionList, setShowMentionList] = useState<boolean>(false)
  const [filteredCandidates, setFilteredCandidates] = useState<MentionCandidate[]>([])
  const [cursorPosition, setCursorPosition] = useState<number>(0)
  const [mentionTop, setMentionTop] = useState<number>(0)
  const [mentionQuery, setMentionQuery] = useState<string>('')
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [featureBoll, setFeatureBoll] = useState<boolean>(false)

  const token = useStore((state) => state.token)
  const { getCurrentUid } = useTMAUtils()
  const current_uid = getCurrentUid()

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value
    const selectionStart = e.target.selectionStart || 0
    setTitle(value)
    setCursorPosition(selectionStart)

    if (textAreaRef.current) {
      const rect = textAreaRef.current.getBoundingClientRect()
      setMentionTop(rect.height + 40 - 14)
    }

    const queryMatch = value.slice(0, selectionStart).match(/(^|\s)@([a-zA-Z0-9\u4e00-\u9fa5]*)$/)

    if (queryMatch) {
      const query = queryMatch[2] || ''
      setMentionQuery(query)
      setFilteredCandidates(
        mentionCandidates.filter((candidate) =>
          candidate.tgname.toLowerCase().includes(query.toLowerCase())
        )
      )
      setShowMentionList(true)
    } else {
      setShowMentionList(false)
    }
  }

  const handleMentionClick = (mention: string): void => {
    const beforeCursor = title.slice(0, cursorPosition).replace(/(^|\s)@([a-zA-Z0-9]*)$/, '$1')
    const afterCursor = title.slice(cursorPosition)

    const newText = `${beforeCursor}@${mention} ${afterCursor}`
    setTitle(newText)
    setShowMentionList(false)

    setTimeout(() => {
      const newPosition = beforeCursor.length + mention.length + 2
      if (textAreaRef.current) {
        textAreaRef.current.setSelectionRange(newPosition, newPosition)
        textAreaRef.current.focus()
      }
    }, 0)
  }

  const loadCandidates = async () => {
    try {
      const res: any = await getFansFollowers(current_uid)
      setMentionCandidates(res)
    } catch (error) {
      console.error('Failed to fetch mention candidates:', error)
    }
  }
  const mentionEve = (boll: boolean) => {
    setTimeout(() => {
      isMobileDevice() && setIsFocused(boll)
      setFeatureBoll(boll)
    }, 0)
  }

  useEffect(() => {
    if (token && current_uid) {
      loadCandidates()
      if (!isMobileDevice()) {
        setFeatureBoll(true)
      }
    }
  }, [current_uid, token])
  const [initialHeight, setInitialHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      // alert(isFocused)
      const currentHeight = window.innerHeight;
      if(!featureRefBoll.current){
        if (currentHeight < initialHeight) {
          // 视口高度变小，键盘弹出
          setIsFocused(true);
        } else {
          // 视口高度恢复，键盘收起
          setIsFocused(false);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [initialHeight]);

  return (
    <div className="relative h-[280px]">
      <Textarea
        ref={textAreaRef}
        className="placeholder-[#999] mt-6"
        value={title}
        onFocus={() => mentionEve(true)}
        onBlur={() => mentionEve(false)}
        onChange={handleInputChange}
        mt="10px"
        color="#333"
        fontWeight="400"
        lineHeight="6"
        p="0"
        fontSize="14px"
        border="none"
        placeholder="Say something ..."
        // h="280px"
      />
      {featureBoll && showMentionList && filteredCandidates.length > 0 && (
        <ul
          className="absolute left-0 z-[111] w-[100%] border-t border-gray-300 bg-white h-[200px] overflow-auto"
          style={{ top: `${mentionTop}px` }}
          onClick={() => {
            if (textAreaRef.current) {
              textAreaRef.current.focus()
            }
          }}
        >
          {filteredCandidates.map((candidate) => (
            <li
              key={candidate.tgname}
              onClick={() => handleMentionClick(candidate.tgname)}
              className="p-2 cursor-pointer flex items-center"
            >
              <img
                src={candidate.avatar}
                alt={candidate.tgname}
                className="w-9 h-9 rounded-full mr-3 object-cover"
              />
              <p className="text-4 text-[#333]">{candidate.tgname}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MentionFeature
