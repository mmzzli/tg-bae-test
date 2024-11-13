import React, { FC, useState, useEffect, useRef } from 'react'
import {
  HStack,
  Heading,
  Image,
  Button,
  Text,
  Box,
  Textarea,
  Input,
  createStandaloneToast,
  Grid,
  GridItem,
  Toast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import { postResources, postReq } from '@/api'
import StarsPage from '@/components/NewPost/Stars'
import { PostIcon, PostAddIcon, RemoveIcon, VideoSwitchIcon } from '@/assets/icons'
import { useStore } from '@/store'
import VideoFrameSelector from '@/components/NewPost/VideoFrameSelector'
import VideoPlayer from '@/components/comm/VideoPlayer'

export const NewPost: FC = () => {
  const navigate = useNavigate()
  const { toast } = createStandaloneToast()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [firstFileType, setFirstFileType] = useState<string>('image')
  const [imgAttr, setImgAttr] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const token = useStore((state) => state.token)
  const [frameSelectorBoll, setFrameSelectorBoll] = useState<boolean>(false)
  // start
  const [price, setPrice] = useState<number>(0)
  // cover
  const [cover, setCover] = useState<string | null>(null)

  async function checkVideoURL(url: string): Promise<AxiosResponse<any> | undefined> {
    let isNotFound = true

    while (isNotFound) {
      try {
        const response: AxiosResponse<any> = await axios.get(url)
        isNotFound = false
        return response
      } catch (error: any) {
        await new Promise((resolve) => setTimeout(resolve, 3000))
      }
    }
  }
  async function imgUpload(files: File[]): Promise<void> {
    const imgList = []
    for (const file of files) {
      const url = `https://picupload.mobus.workers.dev/upload/${file.name}`
      console.log(file)
      const formData = new FormData()
      formData.append('file', file)
      try {
        const response = await axios.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        })
        imgList.push(response.data)
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
    await postResources({
      media: imgList.join(','),
      ...(title ? { title } : {}),
      type: 1,
      currency: 0,
      price,
    })
    navigate('/profile')
  }
  const handleUpload = async () => {
    // if (!title) {
    //   return
    // }
    if (firstFileType === 'image') {
      setIsLoading(true)
      imgUpload(files)
      return
    }
    if (!videoFile) {
      return
    }
    setIsLoading(true)
    const postreqUrl: any = await postReq()
    const id = postreqUrl.split('/').pop()
    const formData = new FormData()
    formData.append('file', videoFile)
    formData.append('name', videoFile.name)
    formData.append('type', 'bae')

    formData.append(
      'meta',
      JSON.stringify({
        name: videoFile.name,
        type: 'bae',
      })
    )
    const response = await axios.post(postreqUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    if (response.status === 200) {
      const url = `https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`
      await checkVideoURL(url)
      const medias = [url]
      cover && medias.unshift(cover)
      await postResources({
        duration: Math.floor(videoRef?.current?.duration || 0),
        media: medias.join(','),
        ...(title ? { title } : {}),
        type: 0,
        currency: 0,
        price,
      })
      navigate('/profile')
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    Toast({
      title: '1',
      status: 'info',
      position: 'top',
    })
    const newFiles = event.target.files
    if (!newFiles || newFiles.length === 0) return
    const fileArray = Array.from(newFiles)
    const firstFileType = fileArray[0].type.startsWith('image/') ? 'image' : 'video'
    const allSameType = fileArray.every(
      (file) =>
        (file.type.startsWith('image/') && firstFileType === 'image') ||
        (file.type.startsWith('video/') && firstFileType === 'video')
    )
    if (!allSameType) {
      toast({
        title: 'Please select only images or only videos',
        status: 'warning',
        position: "top",
        containerStyle: {
          marginTop: "50vh",
          transform: "translateY(-50%)",
        },
      })
      return
    }
    setFirstFileType(firstFileType)
    if (firstFileType === 'video') {
      if (fileArray.length > 1) {
        toast({
          title: 'Please select only one video.',
          position: "top",
          containerStyle: {
            marginTop: "50vh",
            transform: "translateY(-50%)",
          },
          status: 'warning',
        })
        return
      }
      setVideoFile(fileArray[0])
      const videoUrl = URL.createObjectURL(fileArray[0])
      setVideoSrc(videoUrl)
    } else {
      const totalImages = files.length + fileArray.length
      if (totalImages > 9) {
        toast({
          title: 'Maximum 9 images allowed',
          status: 'warning',
          position: "top",
          containerStyle: {
            marginTop: "50vh",
            transform: "translateY(-50%)",
          },
        })
        return
      }
      const updatedFiles = [...files, ...fileArray]
      setFiles(updatedFiles)
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file))
      setImgAttr((prev) => [...prev, ...newPreviews])
    }
    if (event.target.value) {
      event.target.value = ''
    }
  }

  const handleChooseFile = () => {
    Toast({
      title: '1',
      status: 'info',
      position: 'top',
    })
    console.log(inputRef.current)
    inputRef.current?.click()
  }

  const removeImg = (key: number) => {
    setImgAttr((prevItems) => prevItems.filter((_, index) => index !== key))
    setFiles((prevItems) => prevItems.filter((_, index) => index !== key))
  }

  useEffect(() => {
    return () => {
      imgAttr.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imgAttr])

  return (
    <Box h="100vh" overflow="hidden">
      <Box p="0 16px">
        <HStack justifyContent="space-between" pt="16px">
          <Heading as="h3" fontSize="20px" color="#E0E2F6">
            New Post
          </Heading>
          <Button
            size="xl"
            fontSize="14px"
            variant="primary-dark"
            w="82px"
            h="35px"
            onClick={handleUpload}
            isLoading={isLoading}
            isDisabled={firstFileType === 'image' ? files.length === 0 : videoFile == null}
          >
            <Image src={PostIcon} mr="5px" /> Post
          </Button>
        </HStack>
        <Box pt="16px">
          <Input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={inputRef}
          />

          <Box>
            {firstFileType === 'video' && (
              <>
                {videoSrc ? (
                  <Box maxW="600px" m="auto" position="relative">
                    <VideoPlayer videoRef={videoRef} src={videoSrc} style={{ borderRadius: '4px', maxHeight: '380px' }}/>
                    <VideoFrameSelector videoRef={videoRef} setCover={setCover}/>
                    <Image
                      onClick={() => setVideoSrc('')}
                      w="24px"
                      h="24px"
                      position="absolute"
                      top="8px"
                      right="8px"
                      src={RemoveIcon}
                      alt="img"
                    />
                  </Box>
                ) : (
                  <Image
                    w="88px"
                    h="88px"
                    cursor="pointer"
                    src={PostAddIcon}
                    onClick={handleChooseFile}
                  />
                )}
              </>
            )}
            {firstFileType === 'image' && (
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {imgAttr.map((url: string, key: number) => (
                  <GridItem aspectRatio={1} key={url} position="relative">
                    <Image objectFit="cover" w="100%" h="100%" borderRadius="2px" src={url} alt="img" />
                    <Image
                      onClick={() => removeImg(key)}
                      w="24px"
                      h="24px"
                      position="absolute"
                      top="8px"
                      right="8px"
                      src={RemoveIcon}
                      alt="img"
                    />
                  </GridItem>
                ))}
                {imgAttr.length < 9 && <GridItem aspectRatio={1}>
                  <Image
                    w="100%"
                    h="100%"
                    cursor="pointer"
                    src={PostAddIcon}
                    onClick={handleChooseFile}
                  />
                </GridItem>}
              </Grid>
            )}
          </Box>
          <Textarea
            className='placeholder-[#424048]'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            mt="10px"
            color="#E0E2F6"
            fontWeight="400"
            p="0"
            fontSize="14px"
            border="none"
            placeholder="Say something ..."
            h="80px"
          />
        </Box>
        <StarsPage setPrice={setPrice} price={price} />
      </Box>
    </Box>
  )
}
