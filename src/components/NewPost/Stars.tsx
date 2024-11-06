import React, { FC, useState, useEffect } from 'react'
import {
  HStack,
  Text,
  Image,
  Box,
  Input,
  Button,
  Heading,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Grid,
  GridItem,
} from '@chakra-ui/react'

import { StarsIcon, BottomIcon, Remove1Icon, RightIcon } from '@/assets/icons'

type StarsProps = {
  price: StarValue
  setPrice: (index: StarValue) => void // Function type to update index
}
type StarValue = number

const starList: StarValue[] = [0, 100, 250, 500, 1000, 2500]

const Stars: FC<StarsProps> = ({ price, setPrice }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [boll,setBoll] = useState<boolean>(false)

  const handleStarSelect = (item: StarValue) => {
    setPrice(item)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(Number(e.target.value))
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      setBoll(isOpen);
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <>
      <Box position="fixed" bottom="56px" w="100%" left="0" p="0px 16px">
        <HStack
          border="1px solid #FFFFFF1A"
          h="52px"
          lineHeight="52px"
          p="0 16px"
          justifyContent="space-between"
          onClick={onOpen}
        >
          <HStack gap="12px" w="100%" justifyContent="space-between">
            <Text color="#E0E2F6" w="100%">Stars to unlock this post</Text>
            <HStack w="100%" justifyContent="flex-end">
              <Image src={StarsIcon} />
              <Text color="#E0E2F6" fontSize="14px">{price}</Text>
            </HStack>
          </HStack>
          <Image src={RightIcon} />
        </HStack>
      </Box>

      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="no-repeat">
          <DrawerBody bg="rgba(28, 28, 28, 1)" border="none" borderRadius="16px">
            <Image onClick={onClose} mt="16px" mb="24px" src={Remove1Icon} alt="Remove Icon" />
            <Heading as="h3" color="rgba(224, 226, 246, 1)">
              Choose the stars to unlock this post
            </Heading>
            <Grid pt="28px" templateColumns="repeat(3, 1fr)" gap={3}>
              {starList.map((item) => (
                <GridItem key={item}>
                  <Box>
                    <HStack
                      w="100%"
                      h="40px"
                      lineHeight="40px"
                      borderRadius="8px"
                      border="1px solid rgba(255, 255, 255, 0.1)"
                      justifyContent="center"
                      gap="4px"
                      bg={price === item ? 'rgba(74, 58, 255, 1)' : ''}
                      onClick={() => handleStarSelect(item)}
                    >
                      <Text color="rgba(224, 226, 246, 1)">{item}</Text>
                      <Image src={StarsIcon} alt="Stars Icon" />
                    </HStack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
            <HStack
              h="48px"
              border="1px solid rgba(255, 255, 255, 0.1)"
              mt="17px"
              p="0 20px"
              borderRadius="8px"
            >
              {boll && <Input
                color="#E0E2F6"
                border="none"
                p="0"
                placeholder="Add a custom amount"
                onChange={handleChange}
                value={price}
              />}
              <Image src={StarsIcon} alt="Stars Icon" />
            </HStack>

            <Box p="0px 18px">
              <Button
                size="xl"
                fontSize="14px"
                variant="primary-outline"
                w="100%"
                mt="30px"
                mb="42px"
                onClick={onClose}
              >
                Done
              </Button>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Stars
