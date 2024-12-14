import { FormatterListItem } from '@/store/slices/resourceListSlice'

interface M3U8Result {
  id: string | number
  fragments?: string[]
  error?: string
}

const processedIds = new Set<string | number>() // 已处理的 m3u8 文件的 ID
const taskQueue: FormatterListItem[] = [] // 任务队列
let isProcessing = false // 当前是否正在处理任务

// 处理单个任务
const processTask = async (video: FormatterListItem): Promise<M3U8Result> => {
  const medias = video?.media[0]
  const id = video.id

  if (processedIds.has(id)) {
    // 跳过已处理的任务
    return { id }
  }

  if (!medias) {
    console.error(`Media not found for video: ${video.id}`)
    return { id, error: 'Media not found' }
  }

  const media = medias.split(',').find((item) => item.endsWith('.m3u8'))
  if (!media) {
    return { id, error: 'No valid m3u8 media found' }
  }

  try {
    const response = await fetch(media)
    if (!response.ok) {
      throw new Error(`Failed to fetch m3u8: ${response.statusText}`)
    }

    const m3u8Content = await response.text()
    const fragments = m3u8Content.split('\n').filter((line) => line && !line.startsWith('#')) // 解析分片

    processedIds.add(id) // 记录已处理的任务
    return { id, fragments }
  } catch (error: any) {
    return { id, error: error.message }
  }
}

// 逐个处理队列任务
const processQueue = async () => {
  if (isProcessing || taskQueue.length === 0) return

  isProcessing = true

  while (taskQueue.length > 0) {
    const currentTask = taskQueue.shift()! // 从队列中取出第一个任务
    const result = await processTask(currentTask)

    // 将结果发送回主线程
    self.postMessage({ result })
  }

  isProcessing = false
}

// 接收主线程任务并加入队列
self.onmessage = (event: MessageEvent<{ tasks: FormatterListItem[] }>) => {
  const { tasks } = event.data

  console.log(tasks, '====')

  // 添加新任务到队列
  tasks.forEach((task) => {
    if (!processedIds.has(task.id)) {
      taskQueue.push(task)
    }
  })

  // 启动任务处理
  processQueue()
}
