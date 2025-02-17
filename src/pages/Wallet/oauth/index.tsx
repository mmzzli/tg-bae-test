// import { useMemo } from 'react'
// import { BackButton } from '@vkruglikov/react-telegram-web-app'
// import useApp from '@/hooks/oauth/useApp'
// import SignTonTx from './components/ui/SignTonTx'
// import RequestAccounts from './components/ui/RequestAccounts'
// import { NoResult } from '@/components/NoResult'
// import SignTransaction from './components/ui/SignTransaction'
// import SignSolanaTransaction from './components/ui/SignSolanaTransaction'
// import SignSuiTransaction from './components/ui/SignSuiTransaction'
// import SignMessageUI from './components/ui/SignMessageUI'
// import PersonalSign from './components/ui/PersonalSign'
// import SignTransactionUILegacy from './components/ui/SignTransactionUILegacy'
// import { inBrowser } from '@/components/tmd/utils/base'
// import { getMethodInfo } from '@/store/wallet/util'

import { useWalletRequestStore } from '@/store/wallet/walletRequest'
import RequestAccounts from './components/ui/RequestAccounts'
import PersonalSign from './components/ui/PersonalSign'
import SignTransaction from './components/ui/SignTransaction'
import SignTonTx from './components/ui/SignTonTx'
import SignSolanaTransaction from './components/ui/SignSolanaTransaction'
import SignSuiTransaction from './components/ui/SignSuiTransaction'

export default function Oauth() {
  const {
    requestParam: { method, params },
  } = useWalletRequestStore()
  // const [chainType, operation] = getMethodInfo(actions.method || '')
  // const computedViewHeight = useMemo(() => {
  //   if (!inBrowser) return 600
  //   const visualViewportHeight = window.visualViewport?.height || 0
  //   return visualViewportHeight
  // }, [])

  const renderPageContent = () => {
    switch (method) {
      case 'eth_requestAccounts':
        return <RequestAccounts />
      case 'personal_sign':
        return <PersonalSign />
      case 'eth_signTransaction':
      case 'eth_signETHTransaction':
      case 'eth_signErc20Transaction':
        return <SignTransaction />
      case 'ton_signTx':
        return <SignTonTx />
      case 'sol_signTx': // new sign tx, accepting transaction as param, for sdk at and after 1.0.14
        return <SignSolanaTransaction />
      case 'sui_signTransaction':
        return <SignSuiTransaction />
      default: // currently used for sol and ton
        // if (operation === 'connectWallet') {
        //   return <RequestAccounts />
        // } else if (
        //   // sol_transaction & sol_transfer, sol_transaction is for sdk before 1.0.14
        //   operation === 'signTransaction' ||
        //   operation === 'transfer'
        // ) {
        //   return <SignTransactionUILegacy chainType={chainType as any} />
        // } else if (operation === 'signMessage') {
        //   return <SignMessageUI chainType={chainType} />
        // }
        // return <NoResult emptyText="Not Found" containerClassName="mt-[20vh]" />
        return <div>NoResult</div>
    }
  }

  return (
    <>
      {/* <BackButton
        onClick={() => {
          webAppReject(true)
        }}
      ></BackButton> */}
      {renderPageContent()}
    </>
  )
}
