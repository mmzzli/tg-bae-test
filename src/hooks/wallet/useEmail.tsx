import {
  bindEmailCodeSend,
  bindEmailCodeVerify,
  sendTradePwdEmail as sendTradePwdEmailApi,
} from '@/api/wallet'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import { errorContents } from '@/config/wallet/const'
import { useToast } from '@chakra-ui/react'
// import {
//   bindEmailCodeVerify,
//   bindEmailCodeSend,
//   reLoginEmailSend as reLoginEmailSendApi,
//   reLoginEmailVerify as reLoginEmailVerifyApi,
//   reLoginIncreaseAuth as reLoginIncreaseAuthApi,
//   reLoginPassIncrease as reLoginPassIncreaseApi,
//   sendTradePwdEmail as sendTradePwdEmailApi,
//   verifyTradeEmail as verifyTradeEmailApi,
// } from 'api'

const successCode = 10000
const useEmail = () => {
  const toast = useToast()

  const verifyBindEmailCode = async (params: { email: string; code: string }) => {
    try {
      const { code, result, message } = await bindEmailCodeVerify(params)
      // console.log({ code, result, message })
      if (code === successCode) {
        return { success: true, message }
      }
      return { success: false, message }
    } catch (err: any) {
      return { success: false, message: err?.message || errorContents.serverError }
    }
  }
  const sendBindEmailCode = async (email: string) => {
    try {
      const { code, result, message } = await bindEmailCodeSend(email)
      if (code === successCode) {
        return { success: true, message }
      }
      return { success: false, message }
    } catch (err: any) {
      return { success: false, message: err?.message || errorContents.serverError }
    }
  }

  // const reLoginEmailSend = async () => {
  //   try {
  //     const { code, message } = await reLoginEmailSendApi()
  //     if (code === 8000) {
  //       return true
  //     }
  //     toast.error(message)
  //     return code
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.msg || err?.message || '')
  //   }
  //   return false
  // }

  const sendTradePwdEmail = async () => {
    try {
      const { code, message } = await sendTradePwdEmailApi()
      if (code === 10000) {
        return { success: true, message }
      }
      toast({
        render: () => {
          return (
            <CustomToast title={message || errorContents.serverError} type={typeOptions.error} />
          )
        },
        position: 'bottom',
        duration: 2000,
      })
      return { success: false, message }
    } catch (err: any) {
      const message = err?.response?.data?.msg || err?.message || errorContents.serverError
      toast({
        render: () => {
          return <CustomToast title={message} type={typeOptions.error} />
        },
        position: 'bottom',
        duration: 2000,
      })
      return {
        success: false,
        message,
      }
    }
  }

  const verifyTradeEmail = async (mailCode: string) => {
    // try {
    //   const { code, message, data } = await verifyTradeEmailApi(mailCode)
    //   if (code !== 10000) {
    //     toast.error(message)
    //     return false
    //   }
    //   return true
    // } catch (err: any) {
    //   // console.log('errrrrrr', err)
    //   toast.error(err?.response?.data?.message || err?.message || '')
    // }
    // return false
  }

  return {
    verifyBindEmailCode,
    sendBindEmailCode,
    // reLoginEmailSend,
    sendTradePwdEmail,
    verifyTradeEmail,
  }
}

export default useEmail
