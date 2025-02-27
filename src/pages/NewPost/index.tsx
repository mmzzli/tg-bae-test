import React, { FC, useState, useEffect, useRef, useMemo } from 'react'
import { Image, Button, Box, Input, useToast, Grid, GridItem } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import * as tus from "tus-js-client";

import axios, { AxiosResponse } from 'axios'
import { postResources, postReq } from '@/api'
import { PostResourceReq } from '@/types'
import StarsPage from '@/components/NewPost/Stars'
import AddPreview from '@/components/NewPost/AddPreview'
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
import MentionFeature from './MentionFeature'
import { debounce } from '@/utils/chat/schedulers'

const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
}

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
  const [firstSelectFileType, setFirstSelectFileType] = useState<string>('')
  const [imgAttr, setImgAttr] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([])
  const token = useStore((state) => state.token)
  let updateUrl = ""

  const containerRef = useRef<HTMLDivElement>(null)
  const postContentRef = useRef<HTMLDivElement>(null)
  // const [frameSelectorBoll, setFrameSelectorBoll] = useState<boolean>(false)
  // start
  const [price, setPrice] = useState<number | null>(null)
  const [durationData, setDurationData] = useState({
    duration: 0,
    width: 0,
    height: 0
  })
  // cover
  const [cover, setCover] = useState<string | null>(null)
  //
  const [trailer, setTrailer] = useState<string | null>(null)
  const [trailerR2, setTrailerR2] = useState<string | null>(null)

  const [widths, setWidths] = useState<number[]>([])
  const [heights, setHeights] = useState<number[]>([])
  const [isFocused, setIsFocused] = useState<boolean>(false)
  const [initTgViewportHeight, setInitTgViewportHeight] = useState(0)
  const initTgViewportHeightRef = useRef(0)
  const [screenBoll, setScreenBoll] = useState(false)

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
    if ((!imgAttr || !imgAttr.length) && !videoSrc) {
      setFirstSelectFileType('')
    }
  }, [imgAttr, files, videoSrc])

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
        // 过滤HTML标签
        // const filteredTitle = title.replace(/<[^>]*>/g, '')

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
    if (!cover && !trailer) {
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
      if (trailer) {
        await checkVideoURL(trailer)
      }
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
          if(!cover){
            toast({
              render: () => {
                return <CustomToast title="Please select cover" type={typeOptions.error} />
              },
              position: 'bottom',
            })
            return
          }
          const medias = [url]
          cover && medias.unshift([cover])
          //
          const params: PostResourceReq = {
            duration: String(Math.floor(durationData.duration)),
            width: String(durationData.width),
            height: String(durationData.height),
            media: medias.join(','),
            ...(title ? { title } : {}),
            type: 0,
            currency: 0,
            price: price || 0,
          }
          if (params.price && trailer) {
            params['trailer'] = trailer
          }
          await postResources(params)
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
            // const response = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
            //   headers: {
            //     'Content-Type': 'multipart/form-data',
            //     Authorization: `Bearer ${token}`,
            //   },
            // })
            clearInterval(timer)
            updateUploadThread({
              id: stepOne,
              progress: 100,
              result: "",
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

          // 判断是否是.mp4格式
          if (videoFile.name.endsWith('.mp4')) {

            const url = `${import.meta.env.VITE_APP_UPLOAD_URL}uploadall`
            // 参数
            const formData = new FormData()
            const items = Date.now()
            formData.append('file', videoFile)
            formData.append('name', `${items}`)
            formData.append('type', 'bae')

            const r2Response = await axios.put(url, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
              onUploadProgress: (progressEvent: any) => {
                const total = progressEvent.total
                const current = progressEvent.loaded
                const percentCompleted = Math.round((current * 100) / total)
                console.log(`上传进度: ${percentCompleted}%`)
              },
            })
            updateUrl = r2Response.data.urls[0]
          }else{

            const videoId = performance.timeOrigin * 1e6 + performance.now() * 1e3
            console.log(videoId)
            const metadata: any = {
              vid: videoId,
            }
            const upload = new tus.Upload(videoFile, {
              endpoint: `${import.meta.env.VITE_APP_UPLOAD_R2_URL}files`, // 你的 tus 服务器地址
              retryDelays: [0, 3000, 5000, 10000], // 失败时重试间隔
              headers: {
                'Authorization': `Bearer ${token}`
              },
              metadata: metadata,
            })
            upload.start();
            updateUrl = `${import.meta.env.VITE_APP_UPLOAD_IMG_URL}${videoId}.mp4`
          }
          updateUploadThread({
            id: stepTwo,
            progress: 100,
            result: updateUrl,
            status: TaskStatus.COMPLETED,
          })
          // try {
          //   // data
          //   const formData = new FormData()
          //   formData.append('file', videoFile)
          //   formData.append('name', videoFile.name)
          //   formData.append('type', 'bae')

          //   formData.append(
          //     'meta',
          //     JSON.stringify({
          //       name: videoFile.name,
          //       type: 'bae',
          //     })
          //   )
          //   // 判断是否是.mp4格式
          //   if (!videoFile.name.endsWith('.mp4')) {

          //     // const postreqRes = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
          //     //   headers: {
          //     //     'Content-Type': 'multipart/form-data',
          //     //     Authorization: `Bearer ${token}`,
          //     //   },
          //     // })
          //     const videoId:any = upload_url.split('/').pop();
          //     console.log(videoId, upload_url)
          //     const upload = new tus.Upload(videoFile, {
          //       endpoint: `${import.meta.env.VITE_APP_UPLOAD_R2_URL}files`, // 你的 tus 服务器地址
          //       retryDelays: [0, 3000, 5000, 10000], // 失败时重试间隔
          //       headers: {
          //         'Authorization': `Bearer ${token}`
          //       },
          //       metadata: {
          //         vid: videoId,
          //         url: upload_url
          //       },
          //     })
          //     r2Url = `${import.meta.env.VITE_APP_UPLOAD_IMG_URL}${videoId}.mp4`
          //     upload.start();

          //     // mp4 格式转换
          //     // const postreqRes = await axios.get(import.meta.env.VITE_API_URL + 'api/v1/postreq', {
          //     //   headers: {
          //     //     'Content-Type': 'multipart/form-data',
          //     //     Authorization: `Bearer ${token}`,
          //     //   },
          //     // })
          //     // const videoId = postreqRes.data.split('/').pop();
          //     // formData.append('vid', videoId)
          //     // const { data } = await axios.post(
          //     //   import.meta.env.VITE_API_URL + 'api/v1/convert_req_file',
          //     //   formData,
          //     //   {
          //     //     headers: {
          //     //       'Content-Type': 'multipart/form-data',
          //     //       Authorization: `Bearer ${token}`,
          //     //     },
          //     //     timeout: 600000,
          //     //   }
          //     // )
          //     // r2Url = data
          //   } else {
          //     // r2 update
          //     const url = `${import.meta.env.VITE_APP_UPLOAD_URL}uploadall`
          //     const r2Response = await axios.put(url, formData, {
          //       headers: {
          //         'Content-Type': 'multipart/form-data',
          //         Authorization: `Bearer ${token}`,
          //       },
          //       onUploadProgress: (progressEvent: any) => {
          //         const total = progressEvent.total
          //         const current = progressEvent.loaded
          //         const percentCompleted = Math.round((current * 100) / total)
          //         console.log(`上传进度: ${percentCompleted}%`)
          //       },
          //     })
          //     r2Url = r2Response.data.urls[0]
          //   }
          //   console.log(r2Url)
          //   // m3u8 update
          //   const response = await axios.post(upload_url, formData, {
          //     headers: {
          //       'Content-Type': 'multipart/form-data',
          //     },
          //     onUploadProgress: (progressEvent: any) => {
          //       const total = progressEvent.total
          //       const current = progressEvent.loaded
          //       const percentCompleted = Math.round((current * 100) / total)
          //       updateUploadThread({
          //         id: stepTwo,
          //         progress: percentCompleted === 100 ? 99 : percentCompleted,
          //       })
          //       console.log(`上传进度(upload_video): ${percentCompleted}%`)
          //     },
          //   })
          //   updateUploadThread({
          //     id: stepTwo,
          //     progress: 100,
          //     result: response,
          //     status: TaskStatus.COMPLETED,
          //   })
          // } catch (error) {
          //   errorHandler(error)
          // }
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
          if (true) {
            const id = upload_url.split('/').pop()
            const url = updateUrl
            console.log(url)
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
          return <CustomToast title="Post unsuccessful" type={typeOptions.error} />
        },
        position: 'bottom',
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('file type...', firstFileType)
    const newFiles = event.target.files
    if (!newFiles || newFiles.length === 0) return
    const fileArray = Array.from(newFiles)
    const _firstFileType = fileArray[0].type.startsWith('image/') ? 'image' : 'video'
    const allSameType = fileArray.every(
      (file) =>
        (file.type.startsWith('image/') && _firstFileType === 'image') ||
        (file.type.startsWith('video/') && _firstFileType === 'video')
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
    setFirstFileType(_firstFileType)
    setFirstSelectFileType(_firstFileType)
    if (_firstFileType === 'video') {
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

  const stopVideo = () => {
    const video = videoRef.current
    if (video) {
      video.pause()
    }
  }

  useEffect(() => {
    return () => {
      imgAttr.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imgAttr])

  // useEffect(() => {
  // const handleKeyboardHide = () => {
  //   window.scrollTo(0, 0)
  // }
  // window.addEventListener('focusout', handleKeyboardHide)

  // return () => {
  //   window.removeEventListener('focusout', handleKeyboardHide)
  // }
  // }, [])
  useEffect(() => {
    // const onFocusIn = () => {
    //   setIsFocused(true)
    // }
    // const onFocusOut = () => {
    //   setIsFocused(false)
    // }
    // document.addEventListener('focusin', onFocusIn)
    // document.addEventListener('focusout', onFocusOut)
    // return () => {
    //   document.removeEventListener('focusin', onFocusIn)
    //   document.removeEventListener('focusout', onFocusOut)
    // }
  }, [])

  const stopMove = (e: any) => {
    const messageList = document.querySelector('.list-scroll-trigger')
    if (messageList && messageList.contains(e.target)) {
      return
    }
    console.log('cant scroll')
    e.preventDefault()
    window.scrollTo(0, 0)
  }

  const scroll = () => {
    window.scrollTo(0, 0)
  }

  const keyboardUp = () => {
    window.scrollTo(0, 0)
    document.addEventListener('touchend', scroll)
  }

  const keyboardDown = () => {
    document.addEventListener('touchend', scroll)
  }

  useEffect(() => {
    const parentElement = document.getElementById('post-editor')
    const onFocusIn = () => {
      setIsFocused(true)
    }
    const onFocusOut = () => {
      setIsFocused(false)
    }

    if (parentElement) {
      parentElement.addEventListener('focusin', onFocusIn, true)

      parentElement.addEventListener('focusout', onFocusOut, true)
    }

    const handleViewportChange = () => {
      const tg = window.Telegram?.WebApp
      if (tg.viewportStableHeight < initTgViewportHeightRef.current) {
        console.log('keyboard up')
        // setIsFocused(true)
      } else {
        console.log('keyboard down')
        // setIsFocused(false)
        keyboardDown()
      }
    }

    const tg = window.Telegram?.WebApp
    setInitTgViewportHeight(tg.viewportStableHeight)
    tg?.onEvent('viewportChanged', handleViewportChange)

    document.body.addEventListener('touchmove', stopMove, {
      passive: false,
    })

    return () => {
      document.body.removeEventListener('touchmove', stopMove)
      keyboardDown()
      if (parentElement) {
        parentElement.removeEventListener('focusin', onFocusIn)
        parentElement.removeEventListener('focusout', onFocusOut)
      }
    }
  }, [])

  useEffect(() => {
    initTgViewportHeightRef.current = initTgViewportHeight
  }, [initTgViewportHeight])

  useEffect(() => {
    if (isFocused) {
      keyboardUp()
    } else {
      keyboardDown()
      setTimeout(() => {
        document.body.scrollIntoView()
      }, 100)
    }
  }, [isFocused])

  // 移动端聚焦时 需要滚动到光标处
  const handleFocusedTop = (top: number) => {
    setTimeout(() => {
      if (postContentRef.current) {
        const viewportHeight = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--tg-viewport-stable-height')
        )
        const safeAreaHeight = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--tg-safe-area-inset-bottom')
        )
        // top是 距离屏幕顶部的 距离 需要加上当前元素的滚动距离
        const scrollTop = postContentRef.current.scrollTop
        const scrollDistance = scrollTop + top - viewportHeight + safeAreaHeight + 66
        if (scrollDistance > 0) {
          postContentRef.current.scrollTop += scrollDistance
        }
      }
    }, 300)
  }

  useEffect(() => {
    if (isFocused) {
      const scrollable: any = document.getElementById('scrollable')
      scrollable.scrollTo({
        top: 60,
        behavior: 'smooth',
      })
    }
  }, [isFocused])
  const featureRefBoll = useRef(false)

  return (
    <div
      ref={containerRef}
      className="fixed top-0 w-screen bg-[#fff] z-10 overflow-hidden scrollbar-hide new-post-section"
      style={{
        paddingTop: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
        height: 'calc(var(--tg-safe-area-inset-bottom) + var(--tg-viewport-stable-height))',
      }}
    >
      <div
        ref={postContentRef}
        className="absolute left-0 right-0 px-4 overflow-auto"
        style={{
          top: 'calc(var(--tg-safe-area-inset-top) + var(--tg-content-safe-area-inset-top))',
          bottom: isFocused
            ? '32px'
            : price != null && price > 0 && firstFileType === 'video' && videoSrc
              ? '229px'
              : '140px',
        }}
      >
        {/* Page Header */}
        <div className="fixed flex justify-between items-center left-0 right-0 h-[60px] px-4 py-3 bg-white z-[11]">
          <h3 className="text-[20px] font-bold text-[#333]">New Post</h3>
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
        </div>
        <div className="list-scroll-trigger pt-[66px]" id="scrollable">
          <Input
            type="file"
            accept={
              !firstSelectFileType
                ? 'image/png,image/jpeg,image/jpg,video/mp4,video/webm'
                : firstSelectFileType === 'image'
                  ? 'image/png,image/jpeg,image/jpg'
                  : 'video/mp4,video/webm'
            }
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            ref={inputRef}
          />

          {/* POST Media Content */}
          <div>
            {firstFileType === 'video' && (
              <>
                {videoSrc ? (
                  <Box maxW="600px" m="auto" position="relative" style={{
                    width: screenBoll ? "220px" : "100%",
                    // height: screenBoll ? "306px" : "auto",
                    margin: screenBoll ? "unset" : "auto",
                  }}>
                    <VideoPlayer
                      videoRef={videoRef}
                      videoRefCover={videoRefCover}
                      setDurationData={setDurationData}
                      src={videoSrc}
                      setScreenBoll={setScreenBoll}
                      style={{ borderRadius: '4px', objectFit: "cover", height: screenBoll ? "306px" : "auto" }}
                    />
                    <VideoFrameSelector
                      videoRef={videoRefCover}
                      setCover={setCover}
                      videoSrc={videoSrc}
                    />
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
                      borderRadius="8px"
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
                      borderRadius="8px"
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
          </div>
          {/* POST Text Content */}
          <div id="post-editor">
            <MentionFeature
              title={title}
              setTitle={setTitle}
              setIsFocused={setIsFocused}
              featureRefBoll={featureRefBoll}
              height="auto"
              focusedTop={handleFocusedTop}
            />
          </div>
        </div>
        {/* {!isFocused && ( */}
        <div>
          <div onClick={() => stopVideo()}>
            {price != null && price > 0 && firstFileType === 'video' && videoSrc && (
              <AddPreview
                videoRef={videoRefCover}
                setCover={setCover}
                videoSrc={videoSrc || ''}
                trailer={trailer}
                setTrailer={setTrailer}
                setTrailerR2={setTrailerR2}
                videoFile={videoFile}
              />
            )}
          </div>
          <StarsPage setPrice={setPrice} price={price || 0} featureRefBoll={featureRefBoll} />
        </div>
        {/* )} */}
      </div>
    </div>
  )
}
