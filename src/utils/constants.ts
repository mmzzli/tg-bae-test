import { createContext } from 'react'
import { isLocalEnv, isTest } from './env'

const isProd = !isTest && !isLocalEnv
export const tgMiniProgramUrl = !isProd
  ? 'https://t.me/ditto_gray_tes_bot.'
  : 'https://t.me/ditto_gray_tes_bot.'

export const COMMUNITY_LINK = 'https://t.me/bae_epoch'

// export const DEV_INIT_DATA_RAW =
//   'query_id=AAGPWGl0AgAAAI9YaXRCJCcS&user=%7B%22id%22%3A6248028303%2C%22first_name%22%3A%22GrayCookie%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22GrayJy1915%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1730567469&hash=4c7ee210c591d2cfb1c879ffd2436530d0b81f6fa1731ac852dc31e3e3c3b51c'

export const DEV_INIT_DATA_RAW = `query_id=AAESvtgDAwAAABK-2AN0UMoA&user=%7B%22id%22%3A6506987026%2C%22first_name%22%3A%22Talk%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22talk0x09%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FPrIw55HWoXI0zovoIEIgm6UW0HTANDT2vzZgq8NaH1bCk6Y9qDHtK_QZ_Pe08b35.svg%22%7D&auth_date=1735226993&signature=dwgHAv9590g4RTWASzlZRklx_iDAOxarsUH3GsHwRB2yX9d4ESlGaMCILWLaCdXxtes_U4yi8xGYpoBx5bHuCg&hash=57204b4066303ad86418bf625b2ac5fe39207f55c00a7ed1d6bf0974b79755a1`
export const CardRecommendProvider = createContext<
  { recommend: boolean; setVideoOpen: React.Dispatch<React.SetStateAction<boolean>> } | undefined
>(undefined)
