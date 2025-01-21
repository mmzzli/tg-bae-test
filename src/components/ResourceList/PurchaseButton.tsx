import React, { FC, useEffect, useState } from 'react'
import { useTMAUtils } from '@/hooks/useTMAUtils'
import { useGA4EventTrackingReporting } from '@/hooks/useGA4EventTrackingReporting'

import BaseButton from '@/components/BaseButton/BaseButton'
import { useStore } from '@/store/store'

import { botInvoice, totalAvailableInvoice, viewPid } from '@/api'

type PurchaseButtonProps = {
  price: number
  post_id: number
  resourcesEve: (post_id: number, url: string, is_pay?: boolean) => void
  setIsPaid?: (is_paid: boolean) => void
}

const PurchaseButton: FC<PurchaseButtonProps> = ({ price, post_id, resourcesEve, setIsPaid }) => {
  const userInfo = useStore((state) => state.userInfo)
  const { launchParams, openLink } = useTMAUtils()
  const { initData } = launchParams
  const [loading, setLoading] = useState<boolean>(false)
  const [isPay, setIsPay] = useState<boolean>(true)
  const [exchange_rate, setExchangeRate] = useState<number>(0)
  const { trackPurchase } = useGA4EventTrackingReporting()

  useEffect(() => {
    const fetchData = async () => {
      const response = await totalAvailableInvoice()
      setExchangeRate(response.exchange_rate)
    }
    fetchData()
  }, [])

  const invoiceEve = async () => {
    setLoading(true)

    try {
      const viewUrl = await viewPid(post_id)
      resourcesEve(post_id, viewUrl, true)
      return
    } catch (error) {
      const url = await botInvoice({
        amount: price,
        memo: String(post_id),
        post_id: String(post_id),
        user_id: String(initData?.user?.id),
      })

      let retryCount = 0
      const MAX_RETRIES = 10

      const items = setInterval(async () => {
        try {
          retryCount++
          const viewUrl = await viewPid(post_id)
          resourcesEve(post_id, viewUrl, true)
          clearInterval(items)
          setIsPay(false)
          setIsPaid?.(true) // 支付成功
        } catch (error) {
          console.log(error, 'payment')
          if (retryCount >= MAX_RETRIES) {
            clearInterval(items)
            setLoading(false)
          }
        }
      }, 3000)
      if (window.Telegram?.WebApp) {
        const tgApp = window.Telegram.WebApp
        tgApp.openInvoice(url, (status: string) => {
          if (status === 'paid') {
            const timestamp = Date.now()
            trackPurchase({
              transaction_id: `${initData?.user?.id}_${post_id}_${timestamp}`,
              value: price,
              price: price,
              tg_user_id: String(initData?.user?.id),
              bae_user_name: userInfo.username,
              tg_user_name: initData?.user?.username,
              items: [
                {
                  item_id: String(post_id),
                  item_name: String(post_id),
                  price: price,
                  quantity: 1,
                },
              ],
            })

            window.umami.track('purchase', {
              revenue: price * exchange_rate,
              currency: 'USD',
              transaction_id: `${initData?.user?.id}_${post_id}_${timestamp}`,
              item_id: String(post_id),
              item_name: String(post_id),
              amount: 1,
              tg_user_id: String(initData?.user?.id),
              bae_user_name: userInfo.username,
              tg_user_name: initData?.user?.username,
            })
          } else {
            setLoading(false)
          }
        })
      } else {
        openLink(url)
      }
    }
  }
  return (
    <>
      {isPay && (
        <>
          {loading ? (
              <BaseButton text="" handler={() => console.log(1)} loading={true} height="40px" />
            ) : (
              <BaseButton
                height="40px"
                text={`Unlock post for ${price}`}
                icon={<i className="iconfont icon-lock text-white"></i>}
                iconRight={<i className="iconfont icon-stars text-[#FFC700]"></i>}
                handler={() => invoiceEve()}
            />
          )}
        </>
      )}
    </>
  )
}
export default PurchaseButton
