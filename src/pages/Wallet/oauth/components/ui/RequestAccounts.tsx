import { Button } from 'components/Button'
import { tokenSwapSvg, logoSvg } from 'assets'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import useApp from '@/hooks/oauth/useApp'
import { SafeArea } from 'antd-mobile'
import useSdk from '@/hooks/oauth/useSdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import BaseAvatar from 'components/BaseAvatar'
import useApprove from '@/hooks/oauth/useApprove'
import { loggerA } from '@/utils/sentry/logger'
import isError from '@/utils/sentry/logger/isError'

export default function RequestAccounts() {
  const {
    handleApprove,
    isPending,
    isSuccess,
    handleTonProofApprove,
    handleSdkLogin
  } = useApprove()
  const webApp = useWebApp()
  const { webAppReject } = useApp()
  const { getPayload } = useSdk()

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )

  const { data: transData } = useQuery({
    queryKey: ['request-account'],
    queryFn: async () => {
      return await getPayload()
    }
  })

  const transfer = useMemo(() => {
    const metaData = transData?.data?.options?.metaData || {}
    if ((transData?.data?.params || []).length) {
      const data = transData?.data?.params[0] || {}
      return { ...data, ...metaData }
    }
    return { ...metaData }
  }, [transData?.data?.options?.metaData, transData?.data?.params])

  const isTonProof = useMemo(
    () => transfer.tonProof && transfer.domain,
    [transfer.tonProof, transfer.domain]
  )

  const dappName = useMemo(() => {
    return transfer?.name || 'Dapp'
  }, [transfer?.name])

  const handleLogin = async () => {
    try {
      const isNew = !!transfer?.isNew
      if (isTonProof) {
        const params = {
          payload: transfer?.tonProof,
          domain: transfer?.domain,
          workChain: transfer?.workChain ?? 0
        }
        handleTonProofApprove(params)
      } else {
        isNew ? handleApprove() : handleSdkLogin()
      }
    } catch (error: any) {
      if (isError(error)) {
        loggerA.error('Login', 'login err', error)
      }
    }
  }

  useEffect(() => {
    if (isPending) {
      setStatus('loading')
    } else if (isSuccess) {
      setStatus('success')
      webApp?.close()
    } else {
      setStatus('normal')
    }
  }, [isPending, isSuccess, webApp])

  return (
    <>
      <div
        className={`flex h-full flex-1 flex-col justify-between px-[16px] py-[20px]`}
      >
        <div className={`flex h-full flex-col`}>
          <div className="mt-[90px] flex-1 p-[16px]">
            <div className="flex items-center justify-center p-[16px]">
              {transfer.icon ? (
                <img src={transfer.icon} className={`size-[56px]`} />
              ) : (
                <BaseAvatar
                  name={dappName}
                  size="56px"
                  fontSize="56px"
                  color="#F5F5F9"
                  className="rounded-full"
                />
              )}

              <img src={tokenSwapSvg} className="ml-[19px] size-[32px]" />
              <img src={logoSvg} className={`ml-[19px] size-[56px]`} />
            </div>
            <p className="m-auto mt-[16px] w-full max-w-[268px] text-center text-base font-medium leading-[21px] text-gray-1000 dark:!text-white">
              {dappName} is requesting to connect to your Tomo Wallet.
            </p>
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
            <Button status={status} size="large" block onClick={handleLogin}>
              Approve
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
