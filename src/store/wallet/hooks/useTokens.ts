import { okxChains } from "../chains";
import useGetTokenList from "./useGetTokenList";
import { useOkxBalanceAccount } from "./useOkxAccount";

const useTokens = () => {
  const okxBalancesQuery = useOkxBalanceAccount(
    okxChains.map((i) => i.id).join(',')
  )
  const {
    walletTokens,
    refetch,
    isLoading: tokenListLoading
  } = useGetTokenList()
}

export default useTokens