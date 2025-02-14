import { useStore } from '@/store'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { useMemo } from 'react'

export default function useNativeToken(token: AssetsToken | { chainId: number } | undefined) {
  const tokenList = useStore.getState().tokenList
  const nativeToken = useMemo(() => {
    if (!token) return
    return tokenList?.find?.((item) => item.chainId === token.chainId && item.isNative)
  }, [token, tokenList])
  return nativeToken
}
