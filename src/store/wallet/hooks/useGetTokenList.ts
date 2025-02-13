import chains from '../chains'
import { mergeTokensData } from '../util/tokenHelper'
import useUserTokens from './useUserTokens'

// Get Token List
const useGetTokenList = () => {
  const {
    isLoading: userTokensLoading,
    refetch: userTokensRefetch,
    customTokens,
    whiteTokens,
  } = useUserTokens()

  const isLoading = userTokensLoading

  const refetch = async () => {
    await userTokensRefetch()
  }

  const tokens = mergeTokensData({
    whiteTokens,
    customTokens,
  })

  const reqEvmTokens = tokens.filter((token) => {
    return token.chainId !== chains.solana.id && token.chainId !== chains.ton.id
  })

  const reqSolTokens = tokens.filter((token) => {
    return token.chainId === chains.solana.id
  })

  const reqJettonTokens = tokens.filter((token) => {
    return token.chainId === chains.ton.id
  })

  const evmToken = [...reqEvmTokens]
  const solToken = [...reqSolTokens]
  const tonToken = [...reqJettonTokens]
  return {
    walletTokens: tokens,
    evmToken,
    solToken,
    tonToken,
    isLoading,
    refetch,
  }
}

export default useGetTokenList
