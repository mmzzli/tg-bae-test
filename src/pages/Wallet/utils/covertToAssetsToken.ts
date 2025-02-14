// import { ITomoToken } from '@/constants/types'
// import { AssetsToken } from '@/stores/tokenStore/type/AssetsToken'
// import { APIToken } from '@/stores/tokenStore/type/APIToken'
import { APIToken } from '@/store/wallet/tokenType/APIToken'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { ITomoToken } from '@/store/wallet/type'

const covertToAssetsToken = (token: ITomoToken, source?: APIToken['source']): AssetsToken => {
  const assetsSource: APIToken['source'] = source ?? 'history'
  const isNative = !token.address
  const isToken = !!token.address
  const id = `${token?.address}-${token.chainId}-${token.symbol}`

  const assetsTokenObj: AssetsToken = {
    ...token,
    image: token.logoURI,
    isNative,
    isToken,
    id,
    formatted: '0',
    balance: '0',
    price: Number(token.price),
    source: assetsSource,
    symbol: token.symbol || '',
  }
  return assetsTokenObj
}

export default covertToAssetsToken
