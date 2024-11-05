import { TonConnectUIProvider } from '@tonconnect/ui-react'
import React from 'react'
import { tgMiniProgramUrl } from '@/utils/constants'

export function isPC() {
  return !!window.navigator.userAgent.match(/Windows/i)
}

export default function TonConnectUIProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      restoreConnection
      manifestUrl="https://app.secondlive.world/ton/manifest.json"
      actionsConfiguration={{
        modals: ['before'],
        returnStrategy: 'back',

        twaReturnUrl: isPC() ? tgMiniProgramUrl : undefined,
      }}
    >
      {children}
    </TonConnectUIProvider>
  )
}
