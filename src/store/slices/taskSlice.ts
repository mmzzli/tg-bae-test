import { StateCreator } from 'zustand'

export enum TaskStatus {
  PENDING = 0,
  RUNNING = 1,
  COMPLETED = 2,
  FAILED = 3,
}
export interface UploadThread {
  id: string
  name: string
  status: TaskStatus
  depends: string[]
  progress: number
  result: any
  thread: any
  error?: string
}

export type UploadTask = {
  uploadThreads: UploadThread[]
  onAllThreadsComplete: any
  onError: (error: string) => void
}
export interface TaskSlice {
  uploadTask: UploadTask
  addUploadThread: (thread: UploadThread[]) => void
  updateUploadThread: ({
    id,
    progress,
    status,
    error,
    result,
  }: {
    id: string
    progress?: number
    status?: TaskStatus
    error?: string
    result?: any
  }) => void
  addUploadTask: (task: UploadTask) => void
  resetUploadTask: () => void
}

export const createTaskSlice: StateCreator<TaskSlice> = (set) => ({
  uploadTask: {
    uploadThreads: [],
    onAllThreadsComplete: () => {},
    onError: (error: string) => {},
  },
  addUploadThread: (thread) => {
    set((state) => ({
      uploadTask: {
        ...state.uploadTask,
        uploadThreads: [...state.uploadTask.uploadThreads, ...thread],
      },
    }))
  },
  updateUploadThread: ({ id, progress, status, error, result }) => {
    set((state) => ({
      uploadTask: {
        ...state.uploadTask,
        uploadThreads: state.uploadTask.uploadThreads.map((thread) => {
          if (thread.id === id) {
            return {
              ...thread,
              progress: progress !== undefined ? progress : thread.progress,
              status: status !== undefined ? status : thread.status,
              error: error !== undefined ? error : thread.error,
              result: result !== undefined ? result : thread.result,
            }
          }
          return thread
        }),
      },
    }))
  },
  addUploadTask: (task: UploadTask) => {
    set(() => ({
      uploadTask: task,
    }))
  },
  resetUploadTask: () => {
    set({
      uploadTask: {
        uploadThreads: [],
        onAllThreadsComplete: () => {},
        onError: (error: string) => {},
      },
    })
  },
})
