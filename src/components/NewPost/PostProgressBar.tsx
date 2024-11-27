import { TaskStatus, UploadThread } from '@/store/slices/taskSlice'
import { useStore } from '@/store/store'
import { useEffect } from 'react'

export const PostProgressBar = () => {
  const { uploadThreads, uploadTask, updateUploadThread } = useStore((state) => ({
    uploadThreads: state.uploadTask.uploadThreads,
    uploadTask: state.uploadTask,
    updateUploadThread: state.updateUploadThread,
  }))

  console.log('🚀 ~ file: PostProgressBar.tsx:20 ~ uploadThreads:', uploadThreads)

  const progress =
    uploadThreads.reduce((acc, task) => acc + (task.progress || 0), 0) /
    (uploadThreads.length * 100)

  useEffect(() => {
    if (uploadThreads.length > 0) {
      // run thread
      let pendingTask: UploadThread | undefined
      uploadThreads.some((task) => {
        if (task.status === TaskStatus.PENDING) {
          pendingTask = task
          return true
        }
        if (task.status === TaskStatus.RUNNING) {
          return true
        }
        return false
      })
      if (pendingTask) {
        console.log('run thread', pendingTask)
        updateUploadThread({
          id: pendingTask.id,
          status: TaskStatus.RUNNING,
        })
        pendingTask.thread()
      }

      // check if all threads are completed
      const allEnd = uploadThreads.every((task) => task.status === TaskStatus.COMPLETED)
      if (allEnd) {
        const result: string[] = uploadThreads.map((task) => task.result)
        console.log('all threads are completed', uploadThreads, result)
        uploadTask.onAllThreadsComplete(result)
      }
    }
  }, [uploadThreads])

  if (uploadThreads.length === 0) return null

  return (
    <div className="fixed bottom-[84px] left-0 right-0 z-10" style={{ height: '2px' }}>
      <div
        className="h-full bg-[#6254FF] transition-all duration-300 ease-in-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
