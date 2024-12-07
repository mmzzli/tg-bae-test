import React, { FC, useState, useEffect, useRef } from 'react'
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

import { StarsIcon, BottomIcon, Remove1Icon, Right1Icon } from '@/assets/icons'
import { isMobileDevice } from '@/utils/utils'

type StarsProps = {
  price: StarValue
  setPrice: (index: StarValue) => void // Function type to update index
}
type StarValue = number

const starList: StarValue[] = [0, 100, 250, 500, 1000, 2500]

const Stars: FC<StarsProps> = ({ price, setPrice }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [boll, setBoll] = useState<boolean>(false)
  const [isFocused, setIsFocused] = useState<boolean>(false);


  const handleStarSelect = (item: StarValue) => {
    setPrice(item)
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue)) {
      const numericValue = Number(newValue);
      if (numericValue <= 100000) {
        setPrice(numericValue);
      }
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setBoll(isOpen);
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    console.log(1)
    if (!isOpen) {
      window.scrollTo(0, 0);
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyboardHide = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener('focusout', handleKeyboardHide);

    return () => {
      window.removeEventListener('focusout', handleKeyboardHide);
    };
  }, []);


  return (
    <>
      <Box position="fixed" bottom="0px" w="100%" left="0" p="0px 16px" bg="#fff">
      <Box pb="56px">
        <HStack
          border="0.5px solid #CDCDD4"
          h="52px"
          lineHeight="52px"
          p="0 16px"
          justifyContent="space-between"
          borderRadius="40px"
          onClick={onOpen}
        >
          <HStack gap="12px" w="100%" justifyContent="space-between">
            <Text color="#333" w="100%" fontSize="14px">Stars to unlock this post</Text>
            <HStack justifyContent="flex-end">
              <Image src={StarsIcon} />
              <Text color="#333" fontSize="14px">{price}</Text>
            </HStack>
          </HStack>
          <Image src={Right1Icon} />
        </HStack>
      </Box>
      </Box>

      <Drawer placement="bottom" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="no-repeat">
          <DrawerBody bg="#FFF" border="none" borderTopRadius="16px">
            {/* <Box overflow="hidden">
              <Image
                bg="#F5F5FA"
                padding="8px"
                borderRadius="50px"
               onClick={onClose} float="right" mt="16px" mb="24px" src={Remove1Icon} alt="Remove Icon" />
            </Box> */}
            <div className='overflow-hidden mt-[6px]' onClick={onClose}>
              {<div className="w-[36px] h-[36px] p-[8px] float-right bg-[#F5F5FA] rounded-[50px] flex items-center justify-center cursor-pointer"
              >
                <i className="iconfont icon-icon_close text-[#12122A] text-[24px]"></i>
              </div>}
            </div>

            <Heading as="h3" fontSize="24px" color="#333" mt="12px">
              Choose the stars to unlock <br/>this post
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
                      border={`0.5px solid ${price === item? "#6254FF" : "#CDCDD4"}`}
                      justifyContent="center"
                      gap="4px"
                      bg={price === item ? '#6254FF' : ''}
                      onClick={() => handleStarSelect(item)}
                    >
                      <Text color={price === item ? '#fff' : '#333'} fontSize="14px">{item}</Text>
                      <Image src={StarsIcon} alt="Stars Icon" />
                    </HStack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
            <HStack
              h="48px"
              border="0.5px solid #CDCDD4"
              mt="17px"
              p="0 20px"
              borderRadius="8px"
            >
              {boll && <Input
                color="#333"
                border="none"
                className="placeholder-[#999]"
                p="0"
                inputMode="numeric"
                placeholder="customize"
                onChange={handleChange}
                value={price || ''}
                h="100%"
                onFocus={() => { isMobileDevice() && setIsFocused(true) }}
                onBlur={() => { isMobileDevice() && setIsFocused(false) }}
              />}
              <Image src={StarsIcon} alt="Stars Icon" />
            </HStack>

            <Box p="0px 18px" h={`${isFocused ? "400px" : ""}`}>
              {boll && <Button
                size="xl"
                fontSize="14px"
                variant="primary-outline"
                w="100%"
                mt="30px"
                mb="42px"
                onClick={onClose}
                border="1px solid #6254FF"
                bg="#6254FF"
              >
                Done
              </Button>}
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Stars
