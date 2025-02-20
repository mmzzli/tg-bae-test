import { errorContents } from './const'

export const getErrorContext = (error: string) => {
  if (
    error.includes('Estimate Gas') ||
    error.includes('eth_getTransactionCount') ||
    error.includes('Request failed') ||
    error.includes('exceeded CUs meter at BPF instruction') ||
    error.includes('not enough native for fees') ||
    error.includes('gas required exceeds allowance')
  ) {
    return errorContents.gasError
  } else if (
    error.includes('Min return not reached') ||
    error.includes('Error Code: RequireGteViolated')
  ) {
    return errorContents.splitPageErrors
  } else if (error.includes('Network Error')) {
    return errorContents.networkError
  } else if (
    error.includes('insufficient funds') ||
    error.includes('insufficient lamports') || // sol
    error.includes('transfer amount exceeds balance')
  ) {
    return errorContents.balanceError
  } else if (
    error.includes('failed to get recent blockhash') ||
    error.includes('500 Internal Server Error') ||
    error.includes('internal error') ||
    error.includes('Account is frozen')
  ) {
    return errorContents.blockhashFailed
  } else if (error.includes('The first argument must')) {
    return errorContents.argumentError
  } else if (error.includes('The quota has been exceeded')) {
    return errorContents.rpcError
  } else if (
    error.includes('The request took too long to respond') ||
    error.includes('The request timed out')
  ) {
    return errorContents.networkLongError
  } else if (
    error.includes('eth_sendRawTransaction') ||
    error.includes('null is not an object') ||
    error.includes('invalid argument 0') ||
    error.includes('null') ||
    error.includes('InvalidInput') ||
    error.includes('custom program error') ||
    error.includes('timeout of')
  ) {
    return errorContents.transactionError
  } else {
    // for (const [key, value] of Object.entries(errorMessages)) {
    //   const contentKey = key as keyof typeof errorMessages
    //   if (error.includes(value)) {
    //     return errorContents[contentKey]
    //   }
    // }
    return error
  }
}
