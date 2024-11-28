import { TaskStatus, UploadThread } from '@/store/slices/taskSlice'
import { useStore } from '@/store/store'
import { useEffect } from 'react'

export const PostProgressBar = () => {
  const { uploadThreads, uploadTask, updateUploadThread } = useStore((state) => ({
    uploadThreads: state.uploadTask.uploadThreads,
    uploadTask: state.uploadTask,
    updateUploadThread: state.updateUploadThread,
  }))

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
        let dependParams: Record<string, any> = {}
        if (pendingTask.depends.length > 0) {
          const depends = pendingTask.depends.map((name) =>
            uploadThreads.find((task) => task.name === name)
          )
          dependParams = {}
          depends.forEach((task) => {
            if (task) {
              dependParams[task.name] = task.result
            }
          })
        }
        updateUploadThread({
          id: pendingTask.id,
          status: TaskStatus.RUNNING,
        })
        pendingTask.thread(dependParams)
      }

      // check if all threads are completed
      const allEnd = uploadThreads.every((task) => task.status === TaskStatus.COMPLETED)
      if (allEnd) {
        console.log('all threads are completed', uploadThreads)
        uploadTask.onAllThreadsComplete(uploadThreads)
      }
    }
  }, [uploadThreads])

  if (uploadThreads.length === 0) return null

  return (
    <div className="fixed bottom-[84px] left-0 right-0" style={{ height: '2px', zIndex: 9999 }}>
      <div
        className="h-full bg-[#6254FF] transition-all duration-300 ease-in-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}
