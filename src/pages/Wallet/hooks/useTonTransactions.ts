import {
  convertBase64ToHex,
  getTonWebAsync,
  getTransactionsByInMessageHash,
} from '@/store/wallet/config/ton'
import { sleep } from '@/store/wallet/util'
import { isEmpty } from '@/store/wallet/util/tokenHelper'
import TonWeb from 'tonweb'

export const queryTransaction = async (address: string, msgHash: string) => {
  const transactions = await getTransactionsByInMessageHash(msgHash)
  let transaction: any = {}
  if (transactions && transactions.length) {
    transaction = transactions.find((trans: any) => {
      const account = new TonWeb.Address(trans.account).toString(true, true, false)
      if (account.toLocaleLowerCase() == address.toLocaleLowerCase()) {
        return true
      }
      return false
    })
    if (!isEmpty(transaction)) {
      transaction.hashHex = convertBase64ToHex(transaction.hash)
      transaction.feeFormatted = (await getTonWebAsync()).utils.fromNano(transaction.fee)
      transaction.valueFormatted = (await getTonWebAsync()).utils.fromNano(
        transaction.out_msgs[0].value
      )
    }
  }
  return transaction
}

const useTonTransactions = () => {
  const waitForTonTransactionSuccess = async ({
    address,
    msgHash,
    timeoutMs = 30 * 1000,
  }: {
    address: string
    msgHash: string
    timeoutMs?: number
  }): Promise<boolean> => {
    const endTime = Date.now() + timeoutMs

    while (Date.now() < endTime) {
      try {
        const trans = await queryTransaction(address, msgHash)
        if (trans && Object.keys(trans).length) {
          return true
        }
        await sleep(1500)
      } catch (error) {
        console.error(`Error checking transaction ${msgHash}:`, error)
      }
    }

    return false
  }

  return {
    queryTransaction,
    waitForTonTransactionSuccess,
  }
}

export default useTonTransactions
