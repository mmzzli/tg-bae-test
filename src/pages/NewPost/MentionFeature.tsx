import React, { useState, useRef, ChangeEvent } from "react";
import { Textarea } from "@chakra-ui/react";

import { generateUUID, isMobileDevice } from '@/utils/utils'

interface MentionFeatureProps {
  mentionCandidates: { tgname: string; avatar: string, tg_id: number, fans_id: number, if_follow: boolean }[];
  title: string
  setTitle: (str: string) => void
  setIsFocused: (boll: boolean) => void
}

const MentionFeature: React.FC<MentionFeatureProps> = ({ mentionCandidates, title, setTitle, setIsFocused }) => {

  const [showMentionList, setShowMentionList] = useState<boolean>(false); // 是否显示艾特列表
  const [filteredCandidates, setFilteredCandidates] = useState<
    { tgname: string; avatar: string }[]
  >([]); // 筛选后的候选人
  const [cursorPosition, setCursorPosition] = useState<number>(0); // 光标位置
  const [mentionTop, setMentionTop] = useState<number>(0); // 艾特弹窗的动态定位
  const [mentionQuery, setMentionQuery] = useState<string>(""); // 当前艾特查询
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    setTitle(value);
    setCursorPosition(selectionStart);

    // 计算弹窗位置
    if (textAreaRef.current) {
      const rect = textAreaRef.current.getBoundingClientRect();
      setMentionTop(rect.height + 40); // 根据内容变化动态设置弹窗的高度
    }

    // 获取当前输入内容并匹配规则
    const queryMatch = value.slice(0, selectionStart).match(/(^|\s)@([a-zA-Z0-9]*)$/);

    if (queryMatch) {
      const query = queryMatch[2]; // 提取 `@` 后的查询内容
      setMentionQuery(query);
      setFilteredCandidates(
        mentionCandidates.filter((candidate) =>
          candidate.tgname.toLowerCase().includes(query.toLowerCase())
        )
      );
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const handleMentionClick = (mention: string): void => {
    const beforeCursor = title.slice(0, cursorPosition).replace(/(^|\s)@([a-zA-Z0-9]*)$/, "$1"); // 替换 `@` 及后续内容，保留前面的空格
    const afterCursor = title.slice(cursorPosition);

    // 插入选中的艾特用户
    const newText = `${beforeCursor}@${mention} ${afterCursor}`;
    setTitle(newText);
    setShowMentionList(false);

    // 恢复光标位置
    setTimeout(() => {
      const newPosition = beforeCursor.length + mention.length + 2;
      if (textAreaRef.current) {
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
        textAreaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textAreaRef}
        className="placeholder-[#999] mt-6"
        value={title}
        onFocus={() => {
          isMobileDevice() && setIsFocused(true)
        }}
        onBlur={() => {
          isMobileDevice() && setIsFocused(false)
        }}
        onChange={handleInputChange}
        mt="10px"
        color="#333"
        fontWeight="400"
        p="0"
        fontSize="14px"
        border="none"
        placeholder="Say something ..."
        h="80px"
      />
      {showMentionList && filteredCandidates.length > 0 && (
        <ul
          className="absolute left-0 z-[111] w-[100%] border-t border-gray-300 bg-white h-[200px] overflow-auto"
          style={{ top: `${mentionTop}px` }}
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
                className="w-9 h-9 rounded-full mr-3"
              />
              <p className="text-4 text-[#333]">{candidate.tgname}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionFeature;
