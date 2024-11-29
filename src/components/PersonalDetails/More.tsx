import { FC, useState } from 'react'
import { Box, Text, Link } from '@chakra-ui/react'
const More: FC<{
  bio: string
}> = ({ bio }) => {

  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const toggleBioExpand = () => setIsBioExpanded((prev) => !prev);

  return (
    <Box paddingTop="6px">
      <Text color="#666" fontSize="14px" lineHeight="16px" marginBottom="4px">
        {(isBioExpanded || bio.length < 100) ? bio : `${bio.slice(0, 100)}...`}
      </Text>
      {bio.length >= 100 && <Link color="#5D6BFF" fontSize="14px" onClick={toggleBioExpand}>
        {isBioExpanded ? 'Less' : 'More'}
      </Link>}
    </Box>
  )
}
export default More
