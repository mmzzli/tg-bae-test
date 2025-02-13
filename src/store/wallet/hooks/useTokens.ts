import { okxChains } from "../chains";
import { useOkxBalanceAccount } from "./useOkxAccount";

const useTokens = () => {
  const okxBalancesQuery = useOkxBalanceAccount(
    okxChains.map((i) => i.id).join(',')
  )
}

export default useTokens