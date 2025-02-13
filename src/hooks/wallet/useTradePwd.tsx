import {
  firstSetTradePasword,
  mfaAuthVerificationApi,
  resetTradePwdEmail,
  setTradePasword,
} from '@/api/wallet'
import { hashWithWebCrypto } from '@/components/tmd/utils/crypto'
import { errorContents } from '@/config/wallet/const'

const successCode = 10000

const useTradePwd = () => {
  const checkTradePwd = () => {}

  const setTradePwd = async (passwd: string) => {
    try {
      const { code, message } = await firstSetTradePasword({
        newTradePassword: await hashWithWebCrypto(passwd),
      })
      if (code === successCode) {
        return { success: true, message: message }
      }
      return { success: false, message: message }
    } catch (err: any) {
      // throw err?.message || err || ''
      return { success: false, message: err?.message || errorContents.serverError }
    }
  }
  const changeTradePwd = async (oldpwd: string, newpwd: string) => {
    try {
      const { code, data, message } = await setTradePasword({
        oldTradePassword: await hashWithWebCrypto(oldpwd),
        newTradePassword: await hashWithWebCrypto(newpwd),
      })
      if (code === successCode) {
        return true
      }
      throw message
    } catch (err: any) {
      throw err?.message || err || ''
    }
  }

  const resetTradePwd = async (emailCode: string, tradePassword: string) => {
    try {
      const { code, data, message } = await resetTradePwdEmail({
        code: emailCode,
        tradePassword: await hashWithWebCrypto(tradePassword),
      })
      if (code === successCode) {
        return true
      }
      throw message
    } catch (err: any) {
      throw err?.message || err || ''
    }
  }

  const verifyTradePwd = async (password: string) => {
    try {
      const { code, result, message } = await mfaAuthVerificationApi({
        mfaType: 2,
        tradePassword: await hashWithWebCrypto(password),
      })
      if (code === successCode) {
        return {
          validateFlag: true,
          failedCnt: 0,
          prompt: '',
          mfaToken: result,
        }
      }
      return {
        ...result,
        validateFlag: false,
        failedCnt: result?.count || 0,
        mfaToken: '',
      }
    } catch (err) {
      throw errorContents.serverError
    }
  }

  return {
    checkTradePwd,
    setTradePwd,
    changeTradePwd,
    resetTradePwd,
    verifyTradePwd,
  }
}

export default useTradePwd
