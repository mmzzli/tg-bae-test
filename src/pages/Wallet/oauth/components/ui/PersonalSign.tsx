import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import { Button } from 'components/Button'
import toast from 'components/Toast'
import useSdk from '@/hooks/oauth/useSdk'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import useApp from '@/hooks/oauth/useApp'
import { hexToString, isHex } from 'viem'
import useEvmMethods from '@/hooks/oauth/useEvmMethods'
import { getDefaultWalletId } from '@/utils/oauth/helper'

export default function PersonalSign() {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()

  const { data: payloadData, isLoading } = useQuery({
    queryKey: ['sign-message'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  const signParam = useMemo(() => {
    if ((payloadData?.data?.params || []).length) {
      const data = payloadData?.data?.params[0]

      return data
    }
    return ''
  }, [payloadData?.data?.params])

  const chainId = 1

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )

  const { signEVMMessage } = useEvmMethods({
    chainId: chainId
  })

  const handleConfirm = async () => {
    if (status !== 'normal') return
    try {
      setStatus('loading')
      const signData = {
        message: signParam,
        walletId: getDefaultWalletId()
      }

      const result = await signEVMMessage(signData)
      if (result && result?.code == 10000) {
        setStatus('success')

        setTimeout(() => {
          // webApp.enableClosingConfirmation()
          // webApp.disableClosingConfirmation()
          webApp?.close()
        }, 500)
      } else {
        setStatus('normal')
        throw result?.message || 'Network error.'
      }
    } catch (err: any) {
      // toast.error(err?.response?.data?.message || err?.message || err)
      setStatus('normal')
    }
  }

  const showMessage = useMemo(() => {
    if (typeof signParam != 'string') return ''
    let message = signParam
    if (isHex(signParam)) {
      message = hexToString(signParam)
    }
    return message
  }, [signParam])

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between px-[16px] py-[20px]`}
      >
        <div className={`flex h-full flex-col`}>
          <div className="">
            <p className="text-[20px] font-bold leading-[1.3] text-title dark:text-white">
              Sign Message
            </p>

            <div
              className={
                'mb-[40px] mt-[20px] w-full rounded-[12px] bg-[#F9F9F9] py-[8px]'
              }
            >
              <div className="max-h-[300px] min-h-[150px] overflow-auto whitespace-pre-wrap break-words px-[20px] py-[12px] text-sm text-title">
                {showMessage || ''}
              </div>
            </div>
          </div>

          <div className={`grid w-full flex-1 grid-cols-2 items-end gap-5`}>
            <Button
              size="large"
              block
              onClick={() => webAppReject(false)}
              theme="ghost"
            >
              Reject
            </Button>
            <Button
              size="large"
              className="w-full"
              onClick={handleConfirm}
              status={status}
              disabled={
                isLoading ||
                !payloadData?.data ||
                !signParam ||
                !signParam.length
              }
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
