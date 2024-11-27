import { useStateRef } from '@/hooks/useStateRef'
import { TaskStatus, UploadThread } from '@/store/slices/taskSlice'
import { useStore } from '@/store/store'
import { useEffect } from 'react'
import { shallow } from 'zustand/shallow'

export const PostProgressBar = () => {
  const { uploadThreads, uploadTask } = useStore(
    (state) => ({
      uploadThreads: state.uploadTask.uploadThreads,
      uploadTask: state.uploadTask,
    }),
    shallow
  )

  const progress = useStateRef(0)

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (uploadThreads.length > 0) {
      timer = setInterval(() => {
        console.warn('progress bar interval')
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
          pendingTask.thread()
        }

        // update progress
        progress.current =
          uploadThreads.reduce((acc, task) => acc + (task.progress || 0), 0) /
          (uploadThreads.length * 100)

        // check if all threads are completed
        const allEnd = uploadThreads.every((task) => task.completed)
        if (allEnd) {
          clearInterval(timer)
          uploadTask.onAllThreadsComplete()
        }
      }, 100)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [uploadThreads.length])

  if (uploadThreads.length === 0) return null

  return (
    <div className="fixed bottom-[84px] left-0 right-0 z-10" style={{ height: '2px' }}>
      <div
        className="h-full bg-[#6254FF] transition-all duration-300 ease-in-out"
        style={{ width: `${progress.current}%` }}
      />
    </div>
  )
}
