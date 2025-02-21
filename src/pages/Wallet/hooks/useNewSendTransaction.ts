// import { DexTransaction } from '@/constants/types'
// import { useMfa } from './useMfa'
// import { Web3Type } from '@/proviers/web3Provider/type'
// import useTransactions from '@/stores/walletStore/hooks/useTransactions'
// import sendEvm from '@/utils/sendTransaction/sendEvm'
// import useTonTransaction from './useTonTransaction'
// import useLoginInfo from './useLoginInfo'
// import sendTon from '@/utils/sendTransaction/sendTon'
// import sendTron from '@/utils/sendTransaction/sendTron'
// import { getChainByChainId, getChainByToken } from '@/stores/walletStore/utils'
// import approveErc20 from '@/utils/sendTransaction/approveERC20'
// import sendSol from '@/utils/sendTransaction/sendSol'
// import { useAtom } from 'jotai'
// import { approveHashAtom } from '@/state'
// import useSwapStore from '@/stores/swapStore/hooks/useSwapStore'
// import approveTRC20 from '@/utils/sendTransaction/approveTRC20'
// import covertToAssetsToken from '@/utils/covertToAssetsToken'
// import sendSui from '@/utils/sendTransaction/sendSui'
// import sendBtc from '@/utils/sendTransaction/sendBtc'
// import sendCosmos from '@/utils/sendTransaction/sendCosmos'
// import sendDoge from '@/utils/sendTransaction/sendDoge'
// import useTonTestnetTransaction from './useTonTestnetTransaction'
// import sendTonTestnet from '../utils/sendTransaction/sendTonTestnet'
// import useCommonStore from '@/stores/commonStore/hooks/useCommonStore'
// import userStore from '@/stores/userStore'

import { useUserStore } from '@/store/wallet/walletUser'
import { useMfa } from '../Account/hooks/useMfa'
import { DexTransaction } from '@/store/wallet/type'
import { getChainByChainId } from '@/store/wallet/util/tokenHelper'
import { Web3Type } from '@/store/wallet/chainType'
import useTonTransaction from './useTonTransaction'
import sendTon from '../utils/sendTransaction/sendTon'
import sendEvm from '../utils/sendTransaction/sendEvm'
import useTransactions from '@/store/wallet/hooks/useTransactions'
import { useStore } from '@/store'

export type GetMfaParamsType = (params: {
  content: any
  chainid: number
  faildCallBack?: (success: boolean) => void
}) => Promise<{
  mfa: any
  signature: any
}>

export const useNewSendTransaction = (type: 'Send' | 'Swap' | 'Gift') => {
  const { getMfaParams } = useMfa()
  const { walletUserInfo } = useUserStore()
  const { tonAddress, tonAddressTest, tonPublicKey, ethereumAddress: evmAddress } = walletUserInfo
  // todo...
  const { addTx: setTransactionHistory } = useTransactions()
  // const [, setApproveHash] = useAtom(approveHashAtom)
  // const { setStatus } = useSwapStore()
  const feeMode = useStore((state) => state.feeMode)
  const tonTransData = {
    fromAddress: `${tonAddress}`,
    publicKey: `${tonPublicKey}`,
    amount: '0',
    toAddress: tonAddress || '',
    memo: ``,
    token: undefined,
  }
  const tonTestnetTransData = {
    fromAddress: `${tonAddressTest}`,
    publicKey: `${tonPublicKey}`,
    amount: '0',
    toAddress: tonAddress || '',
    memo: ``,
    token: undefined,
  }

  const { handleTransferMessage, handleTransferSend } = useTonTransaction(tonTransData)

  // const { handleTransferMessageTest, handleTransferSendTest } =
  //   useTonTestnetTransaction(tonTestnetTransData)

  const sendTransaction = async ({
    params,
    init,
  }: {
    params: DexTransaction
    init?: () => void
  }) => {
    // if (params?.needApprove) {
    //   if (params.fromToken.chain === 'TRON') {
    //     return approveTRC20(params, getMfaParams, setTransactionHistory, setApproveHash, setStatus)
    //   }
    //   return await approveErc20(params, getMfaParams, setApproveHash, setStatus)
    // }
    const currentChain = getChainByChainId(params.fromToken.chainId)

    switch (currentChain?.type) {
      case Web3Type.EVM:
        return sendEvm(params, getMfaParams, type, setTransactionHistory, evmAddress, feeMode)
      // case Web3Type.BTC:
      //   return sendBtc(params, getMfaParams, type, setTransactionHistory)
      case Web3Type.TON:
        return sendTon(
          { ...tonTransData, ...params },
          handleTransferMessage,
          handleTransferSend,
          type
        )
      // case Web3Type.TONTEST:
      //   return sendTonTestnet(
      //     { ...tonTestnetTransData, ...params },
      //     handleTransferMessageTest,
      //     handleTransferSendTest,
      //     type
      //   )
      // case Web3Type.TRON:
      //   return await sendTron(params, getMfaParams, type, setTransactionHistory)
      // case Web3Type.SOL:
      //   return await sendSol(params, getMfaParams, type, setTransactionHistory)
      // case Web3Type.SUI:
      //   return await sendSui(params, getMfaParams, type, setTransactionHistory)
      // case Web3Type.COSMOS:
      //   return await sendCosmos(params, getMfaParams, type, setTransactionHistory)
      // case Web3Type.DOGE:
      //   return await sendDoge(params, getMfaParams, type, setTransactionHistory)
    }
  }

  return { sendTransaction }
}
