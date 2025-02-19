import useInitUser from '@/store/wallet/hooks/useInitUser'
import { DEV_INIT_DATA_RAW } from '@/utils/constants'
import { retrieveLaunchParams } from '@telegram-apps/sdk'
import { useMfa } from './Account/hooks/useMfa'
import useWallet from './hooks/useWallet'
import { string } from '@tma.js/sdk'
import { useUserStore } from '@/store/wallet/walletUser'
import { getSendSplToken, mockSolEvmChainId, sendSolTx } from '@/store/wallet/config/sol'
import { useCommonStore } from '@/store/wallet/walletCommon'
import { BaseModal } from '@/components/Modal/BaseModal'
import { useState } from 'react'
import BaseButton from '@/components/BaseButton/BaseButton'
import { Input } from 'antd-mobile'

const WalletTest = () => {
  const { tgLogin, getUserInfo } = useInitUser()
  const { hanleWalletAction } = useWallet()
  const {
    walletUserInfo: { tonPublicKey, tonAddress, solanaAddress },
  } = useUserStore()
  const { feeMode } = useCommonStore()

  const connect = async () => {
    let userInfo
    try {
      const { initDataRaw } = retrieveLaunchParams()
      userInfo = import.meta.env.VITE_APP_ENV === 'dev' ? DEV_INIT_DATA_RAW : initDataRaw
      // log('userInfo finally', userInfo)
    } catch (error) {
      userInfo = DEV_INIT_DATA_RAW
    }

    await tgLogin(userInfo)
    await getUserInfo()
  }

  const { getMfaParams } = useMfa()

  const handleMfa = async () => {
    const { mfa, signature } = await getMfaParams({})
    console.log('mfa, signature', mfa, signature)
  }

  const handleSign = async () => {
    const data = await hanleWalletAction({
      method: 'eth_signTransaction',
      params: [
        {
          from: '0xdcf971dcc07fb220bf8b3001b903afc6ef58e635',
          to: '0xdcf971dcc07fb220bf8b3001b903afc6ef58e635',
          chainId: 56,
          value: '0.001',
        },
      ],
    })
    console.log('handleSign', data)
  }

  const handleSignTon = async () => {
    const data = await hanleWalletAction({
      method: 'ton_signTx',
      params: [
        {
          publicKey: tonPublicKey,
          fromAddress: tonAddress,
          body: {
            from: tonAddress,
            to: 'UQB92Cl6dzShQFgEk9lFSDHe0eWhvEZFY0SWDr3KSjcopLLS',
            messages: [
              {
                address: 'UQB92Cl6dzShQFgEk9lFSDHe0eWhvEZFY0SWDr3KSjcopLLS',
                amount: '1000000',
              },
            ],
          },
        },
      ],
    })
    console.log('handleSignTon', data)
  }

  const handleSignSol = async () => {
    const params = {
      fromAddress: solanaAddress,
      toAddress: solanaAddress,
      value: 1000000n,
      contract: undefined,
    }
    let txStr
    if (!params.contract) {
      txStr = await sendSolTx(
        params.fromAddress, // my Address
        params.toAddress, // toAddress
        params.value || 0n, //value
        // signData.txMeta.mintAddress // contract Address
        feeMode
      )
    } else {
      txStr = await getSendSplToken(
        params.contract,
        params.fromAddress,
        params.toAddress,
        params.value,
        feeMode
      )
    }

    const data = await hanleWalletAction({
      method: 'sol_signTx',
      params: [{ txHex: txStr?.transaction, chainId: mockSolEvmChainId }],
    })
    console.log('handleSignSol', data)
  }

  const [visible, setVisible] = useState(false)
  const handleBaseModal = () => {
    setVisible(true)
  }

  return (
    <>
      <BaseModal
        isOpen={visible}
        onClose={() => setVisible(false)}
        // height={isLandscape ? '70vh' : '85vh'}
        style={{
          maxHeight: '70vh',
          height: 'auto',
          overflow: 'auto',
        }}
        animation={{
          duration: 400,
          timingFunction: 'ease-in-out',
        }}
        theme={{
          darkBackgroundColor: '#1a1a1a',
          lightBackgroundColor: '#ffffff',
          handleColor: '#d1d5db',
        }}
        closeOnBackdropClick={true}
        showHandle={false}
      >
        <div className="w-full">
          <div className="py-4">
            <Input placeholder="input 输入框" />
          </div>
          <BaseButton height="52px" text="测试下按钮" handler={() => {}} />
        </div>
      </BaseModal>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={connect}>connect</button>
        <button onClick={handleMfa}>useMfa</button>

        <button onClick={handleSign}>oauth evm</button>
        <button onClick={handleSignTon}>oauth ton</button>
        <button onClick={handleSignSol}>oauth sol</button>

        <button onClick={handleBaseModal}>BaseModal测试下</button>
      </div>
    </>
  )
}

export default WalletTest
