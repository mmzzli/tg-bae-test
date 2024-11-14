import { FC, useState } from 'react'
import { Box, Text, Link } from '@chakra-ui/react'
const More: FC<{
  bio: string
}> = ({ bio }) => {

  const [isBioExpanded, setIsBioExpanded] = useState(false);

  const toggleBioExpand = () => setIsBioExpanded((prev) => !prev);

  return (
    <Box paddingTop="16px" paddingBottom="24px" borderBottom="1px solid #212121">
      <Text color="#62636F" fontSize="14px" lineHeight="16px" marginBottom="4px">
        {(isBioExpanded || bio.length < 100) ? bio : `${bio.slice(0, 100)}...`}
      </Text>
      {bio.length >= 100 && <Link color="#4452FF" fontSize="14px" onClick={toggleBioExpand}>
        {isBioExpanded ? 'Less' : 'More'}
      </Link>}
    </Box>
  )
}
export default More
