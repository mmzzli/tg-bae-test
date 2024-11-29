import { createContext } from 'react'
import { isLocalEnv, isTest } from './env'

const isProd = !isTest && !isLocalEnv
export const tgMiniProgramUrl = !isProd
  ? 'https://t.me/ditto_gray_tes_bot.'
  : 'https://t.me/ditto_gray_tes_bot.'

export const COMMUNITY_LINK = 'https://t.me/bae_epoch'

// export const DEV_INIT_DATA_RAW =
//   'query_id=AAGPWGl0AgAAAI9YaXRCJCcS&user=%7B%22id%22%3A6248028303%2C%22first_name%22%3A%22GrayCookie%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22GrayJy1915%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1730567469&hash=4c7ee210c591d2cfb1c879ffd2436530d0b81f6fa1731ac852dc31e3e3c3b51c'

export const DEV_INIT_DATA_RAW =
  'query_id=AAESvtgDAwAAABK-2AM80Q6m&user=%7B%22id%22%3A6506987026%2C%22first_name%22%3A%22Talk%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FPrIw55HWoXI0zovoIEIgm6UW0HTANDT2vzZgq8NaH1bCk6Y9qDHtK_QZ_Pe08b35.svg%22%7D&auth_date=1732844062&signature=f1QpJ8fAf-n2suJqVCpw-E1n74IauiVrqTZhT_cYbr5usH-GsLI-Ww5krT22hUe3VpwEPFBuRmAXnSWM5U6NDQ&hash=66de54d7485dcb83649f819abebe024a994ca7bb84a969684dd279b8fafe3932'

export const CardRecommendProvider = createContext<{ recommend: boolean } | undefined>(undefined)
