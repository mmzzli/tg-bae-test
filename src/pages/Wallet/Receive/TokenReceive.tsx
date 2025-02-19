import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { TContainer, TCopy, TTokenImage } from '@/components/tmd'
import useLoginInfo from '@/store/wallet/hooks/useLoginInfo'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { useTokenStore } from '@/store/wallet/walletToken'
import { useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zeroAddress } from 'viem'
import BaseButton from '@/components/BaseButton/BaseButton'
import { ToastId, useToast } from '@chakra-ui/react'
import { CustomToast, typeOptions } from '@/components/comm/Toast'
import useCopy from '@/hooks/useCopy'
import QRCode from 'react-qr-code'
import { IconDown2 } from '@/components/tmd/icons/arrowDown2'

export function ReceivePageComponent(props: {
  chain?: string
  address?: string
  wtype?: string
  image?: string
  tokenSymbol?: string
  symbol?: string
  onBack?: () => void
}) {
  // from home need props
  const { chain: chainIdStr, address: tokenAddress } = props
  const toast = useToast()
  const { copy } = useCopy()

  const navigate = useNavigate()
  const qrRef = useRef<any>(null)
  const toastIdRef = useRef<ToastId>()

  // from market and other page need params
  const chainId = chainIdStr || '-1'
  const { tokenList: tokens } = useTokenStore()

  const { getAddressAsChainId } = useLoginInfo()

  const token = tokens.find((token) => {
    if (tokenAddress !== zeroAddress) {
      return (
        token.address?.toLocaleUpperCase() === tokenAddress?.toLocaleUpperCase() &&
        String(token.chainId) == chainId
      )
    }
    return String(token.chainId) == chainId && !token.address
  })

  const address = getAddressAsChainId({ chainId: Number(chainId) })

  const onCopy = () => {
    if (toastIdRef.current) {
      const currentToastId = toastIdRef.current
      setTimeout(() => {
        toast.close(currentToastId)
      }, 500)
    }
    toastIdRef.current = toast({
      render: () => {
        return <CustomToast title="Copied to clipboard successfully" type={typeOptions.success} />
      },
      position: 'bottom',
      duration: 2000,
    })
  }

  const chainName = getChainByChainId(Number(chainId))?.name || ''
  const toSelectToken = () => {
    navigate('/wallet/receive/select-token')
  }

  const ChainTag = () => {
    let tagName = chainName

    return tagName ? (
      <div className={` rounded-[5px]  bg-bg3 px-[4px] py-[3px] text-xs text-t2`}>{tagName}</div>
    ) : (
      <></>
    )
  }

  return (
    <TContainer className="px-5 flex flex-col size-full" scrollable>
      <>
        <div className={`flex w-full flex-1 flex-col items-center gap-[24px]`}>
          <div className="mt-[14px] flex w-full flex-1 flex-col items-center">
            <div
              className="mb-[8px] flex items-center rounded-full bg-bg3 p-[8px]"
              onClick={toSelectToken}
            >
              <TTokenImage
                image={token?.image || ''}
                size={20}
                symbol={token?.symbol?.toUpperCase() || ''}
              />
              <span className="ml-[4px] mr-[8px] max-w-[160px] truncate text-sm text-t1">
                {token?.symbol?.toUpperCase() || ''}
              </span>
              <IconDown2 className="size-5 text-t1" />
            </div>
            <div className="flex w-full flex-col items-center">
              <div
                className={`relative mb-[6px] mt-[8px] flex size-[250px] items-center justify-center bg-white `}
                ref={qrRef}
              >
                <QRCode value={address || ''} className={`size-[90%]`} />
              </div>
              <div className="text-xs text-t3">
                Only supports receiving{' '}
                <span className="text-medium text-sm text-t1">{chainName}</span> network assets
              </div>
            </div>

            <div className="mb-[10px] flex w-full flex-1 flex-col justify-end">
              <div className="w-full rounded-lg py-[16px]">
                <div className={`flex w-full flex-col  gap-[8px]`}>
                  {
                    <div className="flex items-center">
                      <div className={` flex items-center gap-[4px]`}>
                        {token && (
                          <div
                            className={`max-w-[160px] truncate text-xl font-medium leading-[21px] text-t1`}
                          >
                            {token.symbol.toLocaleUpperCase()}
                          </div>
                        )}
                        <ChainTag />
                      </div>
                    </div>
                  }

                  <div className={`flex w-full items-center gap-[4px] text-lg leading-[20px]`}>
                    <div className="min-w-0 flex-1 break-all text-sm text-t3">{address}</div>

                    <TCopy
                      onCopy={onCopy}
                      text={address || ''}
                      className="ml-[18px] rounded-full border-[0.5px] border-l1 px-[18px] py-[8px] text-t2"
                    />
                  </div>
                </div>
              </div>

              <div className={`mt-[8px] w-full`}>
                <BaseButton
                  text="Copy Address"
                  handler={async () => {
                    await copy(address)
                    onCopy()
                  }}
                  height="52px"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    </TContainer>
  )
}

export default function TokenReceive() {
  const { chain: chainIdStr, address: tokenAddress } = useParams()

  return <ReceivePageComponent chain={chainIdStr} address={tokenAddress} />
}
