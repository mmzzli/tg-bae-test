import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useLoginInfo from '@/store/wallet/hooks/useLoginInfo'
import { useChainId, useSwitchChain } from 'wagmi'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { Web3Type } from '@/store/wallet/chainType'
import chains from '@/store/wallet/chains'
import useEstimatedGas, { UseEstimatedGasParamsType } from './hook/useEstimatedGas'
import getSendEvmData from './utils/getSendEvmData'
import ConfirmSendBtn, { sendEvmParams } from './components/ConfirmSendBtn'
import { TBottomButton, TContainer, TScrollContent } from '@/components/tmd'

import ShowSendInfo from './components/ShowSendInfo'
import { useStore } from '@/store'
// import ConfirmSendBtn, { sendEvmParams } from './components/ConfirmSendBtn'

// import tokenStore from '@/stores/tokenStore'
// import { getChainByChainId } from '@/stores/walletStore/utils'
// import btcProvider from '@/utils/provider/btcProvider'
// import chains from '@/proviers/web3Provider/chains'
// import useEstimatedGas, { UseEstimatedGasParamsType } from './hook/useEstimatedGas'
// import { TBottomButton, TContainer, TSafeAreaIos, TScrollContent } from '@/components/tmd'
// import getSendEvmData from './utils/getSendEvmData'
// import { Routers } from '@/router'
// import useCommonStore from '@/stores/commonStore/hooks/useCommonStore'
// import walletStore from '@/stores/walletStore'
// import { WalletType } from '@/stores/tokenStore/type/BTCToken'

function ConfirmSendInfo() {
  const [search] = useSearchParams()
  const toAddress = search.get('toAddress') || ''
  const address = search.get('address') || ''
  const chainId = Number(search.get('chainId')) ?? ''
  const { getAddressByToken } = useLoginInfo()
  // const fromAddress = solAddress
  const btcAdrType = search.get('btcAdrType') || ''
  const amount = search.get('amount') || ''

  const { tonPublicKey, tonAddress } = useStore((state) => state.walletUserInfo)
  const tokens = useStore((state) => state.tokenList)
  const feeMode = useStore((state) => state.feeMode)
  const token = useMemo(() => {
    return tokens?.find?.(
      (token) =>
        token?.chainId === Number(chainId) &&
        token?.address?.toLocaleUpperCase() === address?.toLocaleUpperCase()
    )
  }, [tokens])

  useEffect(() => {
    // redirect to wallet when not found token
    if (tokens.length !== 0 && !token) {
      navigate('/', { replace: true })
    }
  }, [token, tokens])

  // useEffect(() => {
  //   if (btcAdrType) {
  //     walletStore.btcWalletTypeActions(btcAdrType as WalletType)
  //   }
  // }, [])

  const fromAddress = getAddressByToken(token)
  const wagmiChainId = useChainId()
  const chain = typeof chainId === 'number' ? getChainByChainId(chainId) : undefined

  const [memo, setMemo] = useState('')
  const navigate = useNavigate()
  const { switchChain } = useSwitchChain()
  const curChainId = chain?.chain?.id
  const tonTransData = useMemo(() => {
    const transData = {
      fromAddress: `${tonAddress}`,
      publicKey: `${tonPublicKey}`,
      amount: amount,
      toAddress: toAddress,
      memo,
      token: token,
      tokenContractAddress: token?.address,
      tokenPrecision: token?.decimals,
    }
    return transData
  }, [memo])

  // const tonTestTransData = useMemo(() => {
  //   const transData = {
  //     fromAddress: `${tonAddressTest}`,
  //     publicKey: `${tonPublicKey}`,
  //     amount: amount,
  //     toAddress: toAddress,
  //     memo,
  //     token: token,
  //     tokenContractAddress: token?.address,
  //     tokenPrecision: token?.decimals,
  //   }
  //   return transData
  // }, [memo])
  const [btcPsbtData, setBtcPsbtData] = useState(null)

  // const walletBtcType = getBitCoinTypeBySend(btcAdrType as IBtcAddressType)
  const findNativeToken = (chainid: number | undefined) => {
    if (typeof chainid !== 'number') return undefined
    return tokens?.find?.((item) => item.chainId === chainid && item.isNative)
  }
  const nativeToken = useMemo(() => {
    if (token?.isNative) {
      return token
    }
    switch (chain?.type) {
      // case Web3Type.BTC:
      //   return findNativeToken(chains.btc.id)
      case Web3Type.SOL:
        return findNativeToken(chains.solana.id)
      case Web3Type.TON:
        return findNativeToken(chains.ton.id)
      // case Web3Type.TRON:
      //   return findNativeToken(chains.tron.id)
      // case Web3Type.SUI:
      //   return findNativeToken(chains.sui.id)
      // case Web3Type.COSMOS:
      //   return findNativeToken(chains.cosmos.id)
      // case Web3Type.DOGE:
      //   return findNativeToken(chains.doge.id)
      default:
        return findNativeToken(token?.chainId)
    }
  }, [token, tokens])

  const estimatedGasParams: UseEstimatedGasParamsType = {
    toAddress,
    token: token!,
    walletBtcType: btcAdrType,
    amount,
    data: chain?.type === 'EVM' ? getSendEvmData(token, toAddress, '0') : undefined,
  }
  const { gasFee, gasFeeUsd, solPriorityFee, nativeTokenPrice, solPriorityFees, isLoading } =
    useEstimatedGas({
      params: estimatedGasParams,
      chainId: chainId,
      evmParams:
        token &&
        getChainByChainId(token.chainId)?.type === Web3Type.EVM &&
        sendEvmParams({
          amount: amount,
          token: token,
          toAddress: toAddress,
          fromAddress: fromAddress,
        }),
      feeModeParams: feeMode,
    })

  useEffect(() => {
    if (wagmiChainId !== curChainId && chain?.type === 'EVM' && curChainId) {
      switchChain({ chainId: curChainId })
    }
  }, [chain, curChainId, switchChain, wagmiChainId])

  // const initBtcPsbtData = async () => {
  //   const pk = getbtcPubKeysByType(walletBtcType)
  //   // console.log('pk ==>', pk)
  //   const obj = {
  //     from: fromAddress,
  //     pubKey: Buffer.from(pk, 'hex'),
  //     to: toAddress,
  //     amount,
  //     addressType: walletBtcType,
  //     networkType: import.meta.env.VITE_TOMO_BTC_NETWORK,
  //   }
  //   console.log('obj ==>', obj)

  //   const data = await btcProvider.createSendPsbt(obj)
  //   // console.log(111, data, data.psbt.toHex())

  //   setBtcPsbtData(data)
  // }

  // useEffect(() => {
  //   if (chain?.type === Web3Type.BTC) {
  //     initBtcPsbtData()
  //   }
  // }, [chain])

  const isButtonLoading = useMemo(() => {
    if (isLoading) {
      return true
    }
    if (Number(gasFee) <= 0) {
      // && chainId !== chains.tron.id
      return true
    } else {
      return false
    }
  }, [isLoading, chainId])

  return (
    <>
      {/* <BackButton onClick={() => navigate(-1)} /> */}
      <TContainer className="flex size-full flex-col !px-0">
        <TScrollContent className="pt-4">
          <div className={`flex flex-col`}>
            <ShowSendInfo
              amount={amount}
              chain={chain}
              fromAddress={fromAddress}
              toAddress={toAddress}
              gasPriceToken={Number(gasFee)}
              // fees={fees}
              priorityFee={solPriorityFee}
              solPriorityFees={solPriorityFees}
              nativeTokenPrice={nativeTokenPrice}
              nativeToken={nativeToken}
              gasPriceUSD={gasFeeUsd}
              token={token}
              curChainId={curChainId}
              memoChange={setMemo}
            />
          </div>
        </TScrollContent>

        <TBottomButton>
          <ConfirmSendBtn
            isLoading={isButtonLoading}
            toAddress={toAddress}
            amount={amount}
            token={token!}
            walletBtcType={''} //walletBtcType
            fromAddress={fromAddress}
            // curChainId={curChainId}
            chain={chain}
            tonTransData={tonTransData}
            tonTestTransData={''} //tonTestTransData
            btcPsbtData={btcPsbtData}
            gasFee={gasFee}
            // feesQuery={feesQuery}
            // refetch={refetch}
          />
        </TBottomButton>
      </TContainer>
    </>
  )
}

export default ConfirmSendInfo
