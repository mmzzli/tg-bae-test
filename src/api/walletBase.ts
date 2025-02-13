import axios, {
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'
import { createStandaloneToast, ToastId } from '@chakra-ui/react'
import { useStore } from '@/store'

interface ApiResponse<T = any> {
  code: number
  message?: string
  msg?: string
  data?: T
  success?: boolean
  result?: T
}

interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean
  skipAuthHeader?: boolean
}

class WalletHttpClient {
  private instance: AxiosInstance
  private toastInstance = createStandaloneToast()
  private tokenGetter: () => string | null

  constructor(baseURL: string, tokenGetter: () => string | null) {
    this.tokenGetter = tokenGetter
    this.instance = axios.create({
      baseURL,
      timeout: 60000,
      validateStatus: (status: number) => status >= 200 && status < 300,
    })
    this.setupInterceptors()
  }

  private showToast(title: string, status: 'info' | 'warning' | 'success' | 'error') {
    console.log(title)
    return this.toastInstance.toast({
      title,
      status,
      position: 'bottom',
      duration: 3000,
      isClosable: true,
    })
  }

  private setupInterceptors() {
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const conf = config as InternalAxiosRequestConfig & RequestConfig
        if (!conf.skipAuthHeader) {
          const token = this.tokenGetter()
          if (token) {
            conf.headers = conf.headers || {}
            conf.headers.Authorization = `Bearer ${token}`
          }
        }
        return conf
      },
      (error) => Promise.reject(error)
    )

    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        const { code, message, msg, success, result } = data

        if (code >= 500) {
        //   const config = response.config as RequestConfig
        //   !config.skipErrorHandler && this.showToast(message || msg || 'Server Error', 'error')
        //   return Promise.reject(new Error(message || msg))
        }

        if (code === 212) {
          // const config = response.config as RequestConfig
          // !config.skipErrorHandler && this.showToast(message || 'Warning', 'warning')
          // return Promise.reject(new Error(message))
        }

        if (code === 200) {
          // return data.data ?? true
        }

        if (success) {
          return result
        }

        return data
      },
      (error) => {
        // const config = error.config as RequestConfig
        // !config?.skipErrorHandler && error.status === 500 && this.showToast(`Request failed: ${error.message}`, 'error')
        return Promise.reject(error)
      }
    )
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    try {
      return await this.instance.request(config)
    } catch (error) {
      throw error
    }
  }

  get = async <T>(
    url: string,
    params?: Record<string, any>,
    config: RequestConfig = {}
  ): Promise<T> => {
    return this.request<T>({ ...config, method: 'GET', url, params })
  }

  post = async <T>(url: string, data?: any, config: RequestConfig = {}): Promise<T> => {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }
  put = async <T>(url: string, data?: any, config: RequestConfig = {}): Promise<T> => {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  delete = async <T>(
    url: string,
    params?: Record<string, any>,
    config: RequestConfig = {}
  ): Promise<T> => {
    return this.request<T>({ ...config, method: 'DELETE', url, params })
  }

  patch = async <T>(url: string, data?: any, config: RequestConfig = {}): Promise<T> => {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }
}

const getStoreToken = () => {
  return useStore.getState().userState.token
}

const walletClient = new WalletHttpClient(import.meta.env.VITE_TOMO_WALLET_API, getStoreToken)
export const walletGet = walletClient.get.bind(walletClient)
export const walletPost = walletClient.post.bind(walletClient)

const tomoTgClient = new WalletHttpClient(import.meta.env.VITE_AVPIM_API, getStoreToken)
export const tomoTgGet = walletClient.get.bind(tomoTgClient)
export const tomoTgPost = walletClient.post.bind(tomoTgClient)