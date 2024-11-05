import { isLocalEnv, isTest } from './env'

const isProd = !isTest && !isLocalEnv
export const tgMiniProgramUrl = !isProd
  ? 'https://t.me/ditto_gray_tes_bot.'
  : 'https://t.me/ditto_gray_tes_bot.'

export const COMMUNITY_LINK = 'https://t.me/bae_epoch'

// export const DEV_INIT_DATA_RAW =
//   'query_id=AAGPWGl0AgAAAI9YaXRCJCcS&user=%7B%22id%22%3A6248028303%2C%22first_name%22%3A%22GrayCookie%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22GrayJy1915%22%2C%22language_code%22%3A%22zh-hans%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1730567469&hash=4c7ee210c591d2cfb1c879ffd2436530d0b81f6fa1731ac852dc31e3e3c3b51c'

export const DEV_INIT_DATA_RAW =
  'query_id=AAESvtgDAwAAABK-2AMYyccm&user=%7B%22id%22%3A6506987026%2C%22first_name%22%3A%22Talk%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1730796450&hash=a61c259d960884003e6e8d6dac01092650dbe046fb45154777194058518bffd2'