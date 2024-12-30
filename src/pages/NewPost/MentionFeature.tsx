import React, { useState, useRef, ChangeEvent } from "react";
import { Textarea } from "@chakra-ui/react";

interface MentionFeatureProps {
  mentionCandidates: string[];
}

const MentionFeature: React.FC = () => {
  const [mentionCandidates, setMentionCandidates] = useState([])

  const [text, setText] = useState<string>(""); // 输入的文本
  const [showMentionList, setShowMentionList] = useState<boolean>(false); // 是否显示艾特列表
  const [cursorPosition, setCursorPosition] = useState<number>(0); // 光标位置
  const [mentionTop, setMentionTop] = useState<number>(0); // 艾特弹窗的动态定位
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    setText(value);
    setCursorPosition(selectionStart);

    // 计算弹窗位置
    if (textAreaRef.current) {
      const rect = textAreaRef.current.getBoundingClientRect();
      setMentionTop(rect.height+40); // 根据内容变化动态设置弹窗的高度
    }

    // 获取当前输入的字符和前一个字符
    const charBefore = value[selectionStart - 2] || ""; // @ 前的字符
    const currentChar = value[selectionStart - 1]; // 当前输入的字符

    // 检查是否需要触发艾特
    if (currentChar === "@" && (charBefore === " " || charBefore === "")) {
      setShowMentionList(true);
    } else {
      setShowMentionList(false);
    }
  };

  const handleMentionClick = (mention: string): void => {
    const beforeCursor = text.slice(0, cursorPosition);
    const afterCursor = text.slice(cursorPosition);

    // 插入选中的艾特用户
    const newText = `${beforeCursor}${mention} ${afterCursor}`;
    setText(newText);
    setShowMentionList(false);

    // 恢复光标位置
    setTimeout(() => {
      const newPosition = beforeCursor.length + mention.length + 1;
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
        value={text}
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
      {showMentionList && (
        <ul
          className="absolute left-0 z-[111] w-[100%] border-t border-gray-300 bg-white"
          style={{ top: `${mentionTop}px` }}
        >
          {mentionCandidates.map((candidate) => (
            <li
              key={candidate}
              onClick={() => handleMentionClick(candidate)}
              className="p-2 cursor-pointer flex"
            >
              <span className=""></span>
              <p className="text-4 text-[#333]">
                {candidate}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MentionFeature;
