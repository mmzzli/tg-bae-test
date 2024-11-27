import { StateCreator } from 'zustand'
export interface UploadThread {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  depends: string[]
  progress: number
  completed: boolean
  result: any
  thread: any
  error?: string
}
export interface TaskSlice {
  uploadTask: {
    uploadThreads: UploadThread[]
    onAllThreadsComplete: () => void
    onError: (error: string) => void
  }
  addUploadThread: (thread: UploadThread[]) => void
  updateUploadThread: ({
    id,
    progress,
    completed,
    error,
    result,
  }: {
    id: string
    progress?: number
    completed?: boolean
    error?: string
    result?: any
  }) => void
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
  updateUploadThread: ({ id, progress, completed, error, result }) => {
    set((state) => ({
      uploadTask: {
        ...state.uploadTask,
        uploadThreads: state.uploadTask.uploadThreads.map((thread) => {
          if (thread.id === id) {
            return {
              ...thread,
              progress: progress !== undefined ? progress : thread.progress,
              completed: completed !== undefined ? completed : thread.completed,
              error: error !== undefined ? error : thread.error,
              result: result !== undefined ? result : thread.result,
            }
          }
          return thread
        }),
      },
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
