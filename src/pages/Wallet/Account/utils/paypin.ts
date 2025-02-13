import { errorContents } from '@/config/wallet/const'

export const buildErrMsg = (failedCnt: number) => {
  switch (failedCnt) {
    case 1:
      return errorContents.paypinErrors.wrong1
    case 2:
      return errorContents.paypinErrors.wrong2
    case 3:
      return errorContents.paypinErrors.wrong3
    case 4:
      return errorContents.paypinErrors.wrong4
    case 5:
      return errorContents.paypinErrors.wrong5
    default:
      return errorContents.paypinErrors.wrong1
  }
}
