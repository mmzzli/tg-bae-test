import NiceModal from '@ebay/nice-modal-react'
import { PromiseModal } from '../modals/PaypinVerify'

export const useMfa = () => {

  const getMfaParams = async (
    params: {
      // content: any
      // chainid: number
      // faildCallBack?: (success: boolean) => void
    }
    // callback: (params: { signature: string; mfa: string }) => void
  ): Promise<{
    mfa: string
    signature: any
  }> => {
    return await NiceModal.show(PromiseModal)
      .then((data: any) => {
        return { mfa: `${data}`, signature: '' }
      })
      .catch((err) => {
        // console.log('NiceModal catch', err);
        return { mfa: '', signature: '' }
      })
  }
  return { getMfaParams }
}
