import { FC, useState, CSSProperties, useRef, useEffect } from 'react'
import { Box, Text, Link } from '@chakra-ui/react'
const More: FC<{
  bio: string
}> = ({ bio }) => {

  // const [isBioExpanded, setIsBioExpanded] = useState(false);
  // const toggleBioExpand = () => setIsBioExpanded((prev) => !prev);
  const textRef = useRef<HTMLDivElement>(null);

  const [isClamped, setIsClamped] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lines = 2

  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * lines;

      if (element.scrollHeight > maxHeight) {
        setIsClamped(true);
      }
    }
  }, [lines]);

  return (
    <Box paddingTop="6px" position="relative">
      <Text color="#666" fontSize="14px" lineHeight="16px" pr="42px" marginBottom="4px"
      style={{
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: expanded ? "unset" : lines,
        overflow: expanded ? "visible" : "hidden",
        textOverflow: "ellipsis",
      }}
      ref={textRef}>
        {bio}
      </Text>
      <Link color="#5D6BFF" fontSize="14px" position={`absolute`} right="0px" bottom="-2px" onClick={() => setExpanded((prev) => !prev)}>
        {(isClamped && !expanded) && 'More'}
        {expanded && 'Less'}
      </Link>
    </Box>
  )
}
export default More
