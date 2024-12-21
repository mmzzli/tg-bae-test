import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import {
  HStack,
  Heading,
  Image,
  Button,
  Box,
  Textarea,
  Input,
  createStandaloneToast,
  useToast,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import axios, { AxiosResponse } from 'axios'
import { postResources, postReq } from '@/api'
import StarsPage from '@/components/NewPost/Stars'
import { PostIcon, PostAddIcon, RemoveIcon, VideoSwitchIcon } from '@/assets/icons'
import { useStore } from '@/store'
import VideoFrameSelector from '@/components/NewPost/VideoFrameSelector'
import VideoPlayer from '@/components/comm/VideoPlayer'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { TaskStatus, UploadThread } from '@/store/slices/taskSlice'
import { generateUUID, isMobileDevice } from '@/utils/utils'
import { error } from 'console'
import { useGetDailyTask } from '@/hooks/useDailyTask'
import { useViewList } from '@/store/hook/useResourceList'

export const NewPost: FC = () => {
  const navigate = useNavigate()
  // const { toast } = createStandaloneToast()
  const toast = useToast()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoRefCover = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [firstFileType, setFirstFileType] = useState<string>('image')
  const [imgAttr, setImgAttr] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const token = useStore((state) => state.token)

  // const [frameSelectorBoll, setFrameSelectorBoll] = useState<boolean>(false)
  // start
  const [price, setPrice] = useState<number | null>(null)
  // cover
  const [cover, setCover] = useState<string | null>(null)

  const [widths, setWidths] = useState<number[]>([])
  const [heights, setHeights] = useState<number[]>([])
  const [isFocused, setIsFocused] = useState<boolean>(false)

  const { runGetDailyTask } = useGetDailyTask()
  const { refresh } = useViewList()

  useEffect(() => {
    imgAttr.forEach((imgitem) => {
      const image = new window.Image()
      image.src = imgitem
      image.onload = () => {
        setWidths((prevWidths) => [...prevWidths, image.width])
        setHeights((prevHeights) => [...prevHeights, image.height])
      }

      image.onerror = () => {
        console.error(`Failed to load: ${imgitem}`)
      }
    })
  }, [imgAttr])

  // upload states
  const { addUploadThread, updateUploadThread, addUploadTask, resetUploadTask } = useStore(
    (state) => ({
      addUploadThread: state.addUploadThread,
      updateUploadThread: state.updateUploadThread,
      addUploadTask: state.addUploadTask,
      resetUploadTask: state.resetUploadTask,
    })
  )

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
  async function imgUpload(files: File[], title: string): Promise<void> {
    const errorHandler = (error: any) => {
      toast({
        render: () => {
          return <CustomToast title="Your post failed to send." type={typeOptions.error} />
        },
        position: 'bottom',
      })
      resetUploadTask()
    }
    const allSuccessHandler = async (result: UploadThread[]) => {
      const fileLinks = result[0].result.urls.join(',')
      try {
        await postResources({
          media: fileLinks,
          ...(title ? { title } : {}),
          type: 1,
          currency: 0,
          price: price || 0,
          width: widths.join(':'),
          height: heights.join(':'),
        })
        // when sent page will back to task page,so we need to update the task list
        runGetDailyTask()
        setTimeout(() => {
          refresh()
        }, 400)
        toast({
          render: () => {
            return <CustomToast title="Your post was sent." type={typeOptions.success} />
          },
          position: 'bottom',
        })
        resetUploadTask()
      } catch (error) {
        console.log(error, 'jacob======error')
        errorHandler(error)
      }
    }
    const id = generateUUID()
    const threads = []
    const thread = {
      id,
      name: 'upload_img',
      progress: 0,
      status: TaskStatus.PENDING,
      depends: [],
      result: null,
      thread: async () => {
        try {
          const formData = new FormData()
          const url = `${import.meta.env.VITE_APP_UPLOAD_URL}uploadall`
          for (const file of files) {
            formData.append('file', file)
          }
          const response = await axios.put(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
            onUploadProgress: (progressEvent: any) => {
              const total = progressEvent.total
              const current = progressEvent.loaded
              const percentCompleted = Math.round((current * 100) / total)
              updateUploadThread({
                id,
                progress: percentCompleted === 100 ? 99 : percentCompleted,
              })
              console.log(`上传进度: ${percentCompleted}%`)
            },
          })
          updateUploadThread({
            id,
            progress: 100,
            result: response.data,
            status: TaskStatus.COMPLETED,
          })
        } catch (e) {
          errorHandler(error)
        }
      },
    }
    threads.push(thread)
    addUploadThread(threads)
    addUploadTask({
      uploadThreads: threads,
      onAllThreadsComplete: allSuccessHandler,
      onError: (error) => {
        errorHandler(error)
      },
    })
    navigate(-1)
  }
  const handleUpload = async () => {
    // if (!title) {
    //   return
    // }
    if (firstFileType === 'image') {
      try {
        setIsLoading(true)
        imgUpload(files, title)
      } catch (e) {
        toast({
          render: () => {
            return <CustomToast title="Your post failed to send." type={typeOptions.error} />
          },
          position: 'bottom',
        })
      }
      return
    }
    if (!videoFile) {
      return
    }
    if(!cover){
      toast({
        render: () => {
          return <CustomToast title="Cover not" type={typeOptions.error} />
        },
        position: 'bottom',
      })
      return
    }
    try {
      setIsLoading(true)
      const errorHandler = (error: any) => {
        toast({
          render: () => {
            return <CustomToast title="Your post failed to send." type={typeOptions.error} />
          },
          position: 'bottom',
        })
        resetUploadTask()
      }
      const allSuccessHandler = async (uploadThreads: UploadThread[]) => {
        const url = uploadThreads.filter((task) => task.name === 'check_video_sync')[0].result
        try {
          const medias = [url]
          cover && medias.unshift([cover])
          await postResources({
            duration: Math.floor(videoRef?.current?.duration || 0),
            media: medias.join(','),
            ...(title ? { title } : {}),
            type: 0,
            currency: 0,
            price: price || 0,
          })
          // when sent page will back to task page,so we need to update the task list
          runGetDailyTask()
          setTimeout(() => {
            refresh()
          }, 400)
          toast({
            render: () => {
              return <CustomToast title="Your post was sent." type={typeOptions.success} />
            },
            position: 'bottom',
          })
          resetUploadTask()
        } catch (error) {
          errorHandler(error)
        }
      }
      const stepOne = generateUUID()
      const stepTwo = generateUUID()
      const stepThree = generateUUID()

      const getUploadUrlThread = {
        id: stepOne,
        name: 'upload_url',
        progress: 0,
        status: TaskStatus.PENDING,
        depends: [],
        result: null,
        thread: async () => {
          try {
            let percent = 0
            const timer = setInterval(() => {
              updateUploadThread({
                id: stepOne,
                progress: ++percent >= 100 ? 99 : percent,
              })
            }, 100)
            const response = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            })
            clearInterval(timer)
            updateUploadThread({
              id: stepOne,
              progress: 100,
              result: response.data,
              status: TaskStatus.COMPLETED,
            })
          } catch (error) {
            errorHandler(error)
          }
        },
      }

      const uploadVideoThread = {
        id: stepTwo,
        name: 'upload_video',
        progress: 0,
        status: TaskStatus.PENDING,
        depends: ['upload_url'],
        result: null,
        thread: async ({ upload_url }: { upload_url: string }) => {
          try {
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
            const response = await axios.post(upload_url, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              onUploadProgress: (progressEvent: any) => {
                const total = progressEvent.total
                const current = progressEvent.loaded
                const percentCompleted = Math.round((current * 100) / total)
                updateUploadThread({
                  id: stepTwo,
                  progress: percentCompleted === 100 ? 99 : percentCompleted,
                })
                console.log(`上传进度(upload_video): ${percentCompleted}%`)
              },
            })
            updateUploadThread({
              id: stepTwo,
              progress: 100,
              result: response,
              status: TaskStatus.COMPLETED,
            })
          } catch (error) {
            errorHandler(error)
          }
        },
      }

      const checkVideoSyncThread = {
        id: stepThree,
        name: 'check_video_sync',
        progress: 0,
        status: TaskStatus.PENDING,
        depends: ['upload_url', 'upload_video'],
        result: null,
        thread: async ({ upload_url, upload_video }: any) => {
          if (upload_video.status === 200) {
            const id = upload_url.split('/').pop()
            const url = `https://customer-sn5y0tm58c41dbpc.cloudflarestream.com/${id}/manifest/video.m3u8`
            let percent = 0
            const timer = setInterval(() => {
              const add = 1 / Math.log(percent + Math.E)
              percent += add
              updateUploadThread({
                id: stepThree,
                progress: percent >= 100 ? 99 : percent,
              })
            }, 100)
            await checkVideoURL(url)
            clearInterval(timer)
            updateUploadThread({
              id: stepThree,
              progress: 100,
              result: url,
              status: TaskStatus.COMPLETED,
            })
          } else {
            errorHandler('upload_video error')
          }
        },
      }

      addUploadTask({
        uploadThreads: [getUploadUrlThread, uploadVideoThread, checkVideoSyncThread],
        onAllThreadsComplete: allSuccessHandler,
        onError: (error) => {
          errorHandler(error)
        },
      })

      navigate(-1)
    } catch (e) {
      toast({
        render: () => {
          return <CustomToast title="Your post failed to send." type={typeOptions.error} />
        },
        position: 'bottom',
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        render: () => {
          return (
            <CustomToast
              title="Please select only images or only videos"
              type={typeOptions.warning}
            />
          )
        },
        position: 'bottom',
      })
      return
    }
    setFirstFileType(firstFileType)
    if (firstFileType === 'video') {
      if (fileArray.length > 1) {
        toast({
          render: () => {
            return <CustomToast title="Please select only one video." type={typeOptions.warning} />
          },
          position: 'bottom',
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
          render: () => {
            return <CustomToast title="Maximum 9 images allowed" type={typeOptions.warning} />
          },
          position: 'bottom',
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
    console.log(inputRef.current)
    inputRef.current?.click()
  }

  const removeImg = (key: number) => {
    setWidths((prevWidths) => prevWidths.filter((_, index) => index !== key))
    setHeights((prevWidths) => prevWidths.filter((_, index) => index !== key))

    setImgAttr((prevItems) => prevItems.filter((_, index) => index !== key))
    setFiles((prevItems) => prevItems.filter((_, index) => index !== key))
  }


  useEffect(() => {
    return () => {
      imgAttr.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imgAttr])

  useEffect(() => {
    const handleKeyboardHide = () => {
      window.scrollTo(0, 0)
    }
    window.addEventListener('focusout', handleKeyboardHide)

    return () => {
      window.removeEventListener('focusout', handleKeyboardHide)
    }
  }, [])
  useEffect(() => {
    if (isFocused) {
      const scrollable: any = document.getElementById('scrollable')
      scrollable.scrollTo({
        top: 100000,
        behavior: 'smooth',
      })
    }
  }, [isFocused])

  return (
    <Box
      h="100vh"
      overflow="hidden"
      className="fixed w-screen h-screen bg-[#fff] z-10 overflow-auto scrollbar-hide"
      id="scrollable"
    >
      <Box p="0 16px">
        <HStack justifyContent="space-between" pt="16px">
          <Heading as="h3" fontSize="20px" color="#000">
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
            _hover={{
              bg: (firstFileType === 'image' ? files.length === 0 : videoFile == null)
                ? '#D1D0DE'
                : '#6254FF',
            }}
          >
            <Image src={PostIcon} mr="5px" /> Post
          </Button>
        </HStack>
        <Box pt="16px">
          <Input
            type="file"
            accept=".png,.jpg,.jpeg,.mp4,.webm"
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
                    <VideoPlayer
                      videoRef={videoRef}
                      videoRefCover={videoRefCover}
                      src={videoSrc}
                      style={{ borderRadius: '4px', maxHeight: '380px' }}
                    />
                    <VideoFrameSelector videoRef={videoRefCover} setCover={setCover} />
                    <Image
                      onClick={() => {
                        setVideoSrc('')
                        setVideoFile(null)
                      }}
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
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <GridItem aspectRatio={1}>
                      <div
                        onClick={handleChooseFile}
                        className="w-full h-full flex items-center justify-center border-dashed border border-[#CDCDD4] rounded-lg cursor-pointer"
                      >
                        <i className="iconfont icon-add text-[#999999] text-[30px]"></i>
                      </div>
                    </GridItem>
                  </Grid>
                )}
              </>
            )}
            {firstFileType === 'image' && (
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {imgAttr.map((url: string, key: number) => (
                  <GridItem aspectRatio={1} key={url} position="relative">
                    <Image
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      borderRadius="2px"
                      src={url}
                      alt="img"
                    />
                    <span
                      className="w-6 h-6 flex justify-center items-center bg-black bg-opacity-50 absolute top-2 right-2 rounded-full text-white-close cursor-pointer hover:bg-opacity-100"
                      onClick={() => removeImg(key)}
                    >
                      <i className="iconfont icon-icon_close"></i>
                    </span>
                  </GridItem>
                ))}
                {imgAttr.length < 9 && (
                  <GridItem aspectRatio={1}>
                    <div
                      onClick={handleChooseFile}
                      className="w-full h-full flex items-center justify-center border-dashed border border-[#CDCDD4] rounded-lg cursor-pointer"
                    >
                      <i className="iconfont icon-add text-[#999999] text-[30px]"></i>
                    </div>
                  </GridItem>
                )}
              </Grid>
            )}
          </Box>
          <Textarea
            className="placeholder-[#999] mt-6"
            value={title}
            onFocus={() => {
              isMobileDevice() && setIsFocused(true)
            }}
            onBlur={() => {
              isMobileDevice() && setIsFocused(false)
            }}
            onChange={(event) => setTitle(event.target.value)}
            mt="10px"
            color="#333"
            fontWeight="400"
            p="0"
            fontSize="14px"
            border="none"
            placeholder="Say something ..."
            h="80px"
          />
        </Box>
        <StarsPage setPrice={setPrice} price={price || 0} />
      </Box>
      <Box h={`${isFocused ? '600px' : ''}`}></Box>
    </Box>
  )
}
