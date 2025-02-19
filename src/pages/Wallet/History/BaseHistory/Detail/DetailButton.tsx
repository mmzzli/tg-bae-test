import BaseButton from '@/components/BaseButton/BaseButton'
import { Web3Type } from '@/store/wallet/chainType'
import { IHistoryType } from '@/store/wallet/type'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatUnits } from 'viem'

const DetailButton = ({ tx }: { tx: IHistoryType }) => {
  const navigate = useNavigate()
  const fromInfo = tx.fromSwapTokens
  const btnText = useMemo(() => {
    if (['Send', 'Swap'].includes(tx.historyType)) {
      switch (tx.status) {
        case 'success':
          return tx.historyType === 'Swap' ? (
            'Swap again'
          ) : (
            'Send again'
          )
        case 'failed':
          return 'Retry'
      }
    }
  }, [tx.historyType, tx.status])

  const btnShow = useMemo(() => {
    return tx.historyType === 'Send'
  }, [tx.historyType])

  const onClick = () => {
    if (tx.historyType === 'Send') {
      const params = {
        chainId: fromInfo.chain?.id?.toString?.() || '',
        toAddress: tx.toAddress || '',
        address: fromInfo.token.address,
        btcAdrType: '',
        amount: ''
      }
      if (tx.status === 'failed') {
        params.amount = formatUnits(
          BigInt(tx.toAmount),
          fromInfo.token.decimals
        )
        const searchUrl = new URLSearchParams(params).toString()
        return navigate(`/wallet/send/confirm-send?${searchUrl}`)
      }
      if (tx.status === 'success') {
        const searchUrl = new URLSearchParams(params).toString()
        return navigate(`/wallet/send/input-amount?${searchUrl}`)
      }
    }
  }

  const disabled =
    tx.historyType === 'Send' &&
    tx.chain?.type === Web3Type.EVM &&
    tx.toAddress === fromInfo.token.address

  return btnShow && btnText ? (
    <div className="pb-2">
      <BaseButton
        disabled={disabled}
        className="h-[53px] w-full"
        handler={onClick}
        text={btnText}
      >
      </BaseButton>
    </div>
  ) : (
    <></>
  )
}

export default DetailButton
