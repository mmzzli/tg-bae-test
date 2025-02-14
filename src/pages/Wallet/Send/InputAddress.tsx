// import { TBottomButton, TIcon, TScrollContent } from '@/components/tmd'
// import { Button } from '@/components/tmd/button/Button'
// import { TContainer } from '@/components/tmd'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { TextArea } from 'antd-mobile'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AddressItem from './components/AddressItem'
import { validateAddressFnMap } from '@/store/wallet/util/validateAddress'
import { URLSearchParams } from 'url'
import { BackButton, useWebApp } from '@vkruglikov/react-telegram-web-app'
import { useAtomValue } from 'jotai'
import { tonSendTransactionDataAtom } from '@/store/wallet/util/tonconnect'
import { useTokenStore } from '@/store/wallet/walletToken'
// import useWalletStore from '@/stores/walletStore/hooks/useWalletStore'

interface BaseIconButtonType {
  onClick: () => void
  children: React.ReactNode
  classNames: string
}
const BaseIconButton = ({ onClick, children, ...props }: BaseIconButtonType) => {
  return (
    <div
      onClick={onClick}
      className={classNames(
        'border-[0.5px] border-l1  py-[6px] px-[10px] text-xs flex item-center text-t1',
        props.classNames || ''
      )}
    >
      {children}
    </div>
  )
}
const ScanButton = ({ onClick }: { onClick: BaseIconButtonType['onClick'] }) => {
  return (
    <BaseIconButton onClick={onClick} classNames="rounded-full mr-4">
      <TIcon name="tg_wallet_scan-the-code" />
    </BaseIconButton>
  )
}

const ClearButton = ({ onClick }: { onClick: BaseIconButtonType['onClick'] }) => {
  return (
    <BaseIconButton onClick={onClick} classNames="rounded-[42px] mr-2">
      <TIcon name="tg_wallet_delete2" />
      <div className="ml-[8px] flex items-center">
        <span>Clear</span>
      </div>
    </BaseIconButton>
  )
}

export default function InputAddress() {
  const [searchStr, setSearchStr] = useSearchParams()
  const navigate = useNavigate()
  const address = searchStr.get('address') || ''
  const chainId = searchStr.get('chainId') || ''
  const toAddress = searchStr.get('toAddress') || ''
  const btcAdrType = searchStr.get('btcAdrType') || ''
  const [receiveAddress, setReceiveAddress] = useState(toAddress)
  const WebApp = useWebApp()
  const tonSendTxData = useAtomValue(tonSendTransactionDataAtom)
  const { walletReportTxs } = useTokenStore()

  useEffect(() => {
    // @ts-ignore
    const address = tonSendTxData?.[0].address
    if (address) {
      setReceiveAddress(address)
    }
  }, [])

  const recentReceiveAddress = useMemo(() => {
    const addressList = walletReportTxs
      .filter((i) => i.type === 'send')
      .filter((i) => !!i.source)
      .filter((i) => Number(i.chainID) === Number(chainId))
      .map((i) => JSON.parse(i.source).toAddress)
      .filter((i) => !!i)
    const uni = addressList.filter((item, index) => addressList.indexOf(item) === index).slice(0, 5)
    return uni
  }, [chainId, walletReportTxs])

  const chain = getChainByChainId(Number(chainId))

  const isValid =
    validateAddressFnMap[chain?.type as keyof typeof validateAddressFnMap](receiveAddress)

  useEffect(() => {
    setSearchStr({ address, chainId, toAddress: receiveAddress, btcAdrType }, { replace: true })
  }, [receiveAddress])

  const confirmReceiveAddress = () => {
    const urlSearchParams = {
      chainId,
      address,
      toAddress: receiveAddress,
      btcAdrType,
    }
    const urlSearchParamsStr = new URLSearchParams(urlSearchParams).toString()
    navigate(`/wallet/send/input-amount?${urlSearchParamsStr}`)
  }

  const showScanQrPopup = () => {
    WebApp?.showScanQrPopup(
      {
        text: 'Scan Address',
      },
      function (text: string) {
        const address = text.includes(':') ? text.split(':')[1] : text
        setReceiveAddress(address)
        return true
      }
    )
  }

  return (
    <div className="flex h-full flex-col !px-0">
      {/* <BackButton onClick={() => navigate(-1)} /> */}
      {/* <TScrollContent> */}
      <div>
        <div className="mt-[15px] text-h3 font-semibold  text-t1">Receiving address</div>
        <div className="mt-[15px]">
          <TextArea
            style={{
              '--color': 'var(--text-t1)',
              '--font-size': 'var(--text-sm)',
              '--placeholder-color': 'var(--text-t4)',
            }}
            value={receiveAddress}
            placeholder={`${chain?.name} address`}
            className="h-[46px] text-sm text-t1"
            onChange={(val) => {
              setReceiveAddress(val)
            }}
          />
          {receiveAddress.length !== 0 && !isValid && (
            <div className="absolute mt-[8px] text-xs text-red">Please enter a valid address</div>
          )}
        </div>
        <div
          className={classNames(
            { 'border-b-[0.5px]': recentReceiveAddress.length > 0 },
            'mt-10 flex justify-end   border-b-l1 pb-4'
          )}
        >
          <ClearButton onClick={() => setReceiveAddress('')} />
          <ScanButton onClick={showScanQrPopup} />
        </div>
        {recentReceiveAddress.length > 0 ? (
          <div className="mt-[12px]">
            <div className="mb-[12px] text-base text-t1">Transactions</div>
            {recentReceiveAddress.map((address) => (
              <AddressItem
                address={address}
                key={address}
                onClick={(addressData: string) => {
                  setReceiveAddress(addressData)
                }}
              />
            ))}
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className="py-[10px]">
        {/* <Button disabled={!isValid} className="h-[52px] w-full" onClick={confirmReceiveAddress}>
          Confirm
        </Button> */}
      </div>
    </div>
  )
}
