import useSdk from '@/hooks/oauth/useSdk'
import useApp from '@/hooks/oauth/useApp'
import useLoginInfo from '@/hooks/useLoginInfo'
import useSuiTx from '@/hooks/oauth/useSuiTx'

import { useMemo, useState } from 'react'
import { useWebApp } from '@vkruglikov/react-telegram-web-app'
import { Button } from 'components/Button'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { hexToString, isHex } from 'viem'
import { useSolanaTx } from '@/hooks/oauth/useSolanaTx'

export default function SignMessageUI(props: any) {
  const { getPayload } = useSdk()
  const webApp = useWebApp()
  const { webAppReject } = useApp()

  const { chainType } = props
  const { defaultWalletId } = useLoginInfo()

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

  const [status, setStatus] = useState<'normal' | 'loading' | 'success'>(
    'normal'
  )

  const chainId = useMemo(() => {
    let id = 1
    if (chainType === 'sol') {
      id = 501
    }
    if (chainType === 'sui') {
      id = 784
    }
    return id
  }, [chainType])

  const { signSolMessage } = useSolanaTx()
  const { signSuiMessage } = useSuiTx({
    chainId: chainId
  })

  const doSignMsg = async (chainType: 'sol' | 'ton' | 'sui') => {
    if (status !== 'normal') return

    try {
      setStatus('loading')

      let signData
      let result
      if (chainType === 'sol') {
        signData = {
          message: signParam,
          walletId: defaultWalletId || -1
        }

        result = await signSolMessage(signData)
      }
      // ton does not have sign message
      if (chainType === 'ton') {
        // TODO:
      }

      if (chainType === 'sui') {
        signData = {
          message: signParam,
          walletId: defaultWalletId || -1
        }
        result = await signSuiMessage(signData)
      }

      if (result && result?.code == 10000) {
        setStatus('success')
        setTimeout(() => {
          webApp?.close()
        }, 500)
      } else {
        setStatus('normal')
        throw result?.message || 'Network error.'
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || err)
      setStatus('normal')
    }
  }

  const handleConfirmClick = () => {
    if (['sol', 'ton', 'sui'].includes(chainType)) {
      doSignMsg(chainType)
    }
  }

  const showMessage = useMemo(() => {
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
            {/* </div> */}

            <div
              className={
                'mb-[40px] mt-[20px] w-full rounded-[12px] bg-[#F9F9F9] py-[8px]'
              }
            >
              <div className="max-h-[300px] min-h-[150px] overflow-auto whitespace-pre-wrap break-words px-[20px] py-[12px] text-sm text-title">
                {showMessage || signParam || ''}
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
              onClick={handleConfirmClick}
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

function ListItem({
  title,
  children,
  className,
  np
}: {
  title: string
  children: React.ReactNode
  className?: string
  np?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-[8px] ${
        np ? '' : 'py-[12px]'
      } ${className}`}
    >
      <div className={`text-sm text-[#757580]`}>{title}</div>
      <div className={`text-sm text-black`}>{children}</div>
    </div>
  )
}
