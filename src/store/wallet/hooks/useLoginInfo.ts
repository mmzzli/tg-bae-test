import chains from '../chains'
import { AssetsToken } from '../tokenType/AssetsToken'
import { useUserStore } from '../walletUser'

export default function useLoginInfo() {
  const { walletUserInfo } = useUserStore()

  const getAddressByToken = (token: AssetsToken) => {
    //btcWalletType?: WalletType
    if (!token || !walletUserInfo) return ''

    // if (token.chainId == chains.btc.id) {
    //   return getBtcWallet(walletUserInfo, btcWalletType || walletStore.btcWalletType)
    // }
    if (token.chainId == chains.solana.id) {
      return walletUserInfo?.solanaAddress
    }
    if (token.chainId == chains.solana.id) {
      return walletUserInfo?.solanaAddress
    }
    if (token.chainId == chains.ton.id) {
      return walletUserInfo?.tonAddress
    }
    // if (token.chainId == chains.tonTestnet.id) {
    //   return walletUserInfo?.tonAddressTest
    // }
    // if (token.chainId == chains.tron.id) {
    //   return walletUserInfo?.tronAddress
    // }
    // if (token.chainId == chains.sui.id) {
    //   return walletUserInfo?.suiAddress
    // }
    // if (token.chainId === chains.cosmos.id) {
    //   return walletUserInfo?.cosmosAddress
    // }
    // if (token.chainId == chains.doge.id) {
    //   return walletUserInfo?.dogeAddress
    // }
    return walletUserInfo.ethereumAddress
  }

  return {
    getAddressByToken,
  }
}
