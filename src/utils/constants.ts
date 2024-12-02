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
  'query_id=AAFNmGp-AgAAAE2Yan73V7iE&user=%7B%22id%22%3A6415882317%2C%22first_name%22%3A%22Jacob%22%2C%22last_name%22%3A%22zhao%22%2C%22username%22%3A%22Jacobizhao%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FXmEI1Kz5fjkOSL6oEMDY4XkK6Rst74TQzQC1S2TAV_buacn8uBVk0MhT80JaAvDT.svg%22%7D&auth_date=1733042576&signature=asmukWw2wSB-BESzxsK6ckA_OrygfTdlM1EPqw-tezm4nWtqHZNbSao85NrWgqM_Ms72UvfUKDA9GKzmf5KeCg&hash=5c7056511515035f35b563dfc8e4cdc194222cc179886f972935e512172dddfd'

export const CardRecommendProvider = createContext<
  { recommend: boolean; setVideoOpen: React.Dispatch<React.SetStateAction<boolean>> } | undefined
>(undefined)
