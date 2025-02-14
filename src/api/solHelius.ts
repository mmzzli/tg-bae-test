import {
  Helius,
  MicroLamportPriorityFeeLevels,
  PriorityLevel
} from 'helius-sdk'
import bs58 from 'bs58'
import axios from 'axios'
import { FeeMode } from '@/pages/Wallet/components/FeeSelect'

const heliusRpcUrl =
  'https://mainnet.helius-rpc.com/?api-key=ac6f0298-d53b-4a04-8389-7966584a67d1'
const api = axios.create({ baseURL: heliusRpcUrl })

export const getSolAllBalance = async (address: string) => {
  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getAssetsByOwner',
    params: {
      ownerAddress: address,
      page: 1,
      limit: 1000,
      displayOptions: {
        showFungible: true,
        showNativeBalance: true
      }
    }
  })
  const res = await api.post('', body)
  return res.data.result
}

export const getSolFeeByFeeMode = ({
  fees,
  feeMode
}: {
  fees: MicroLamportPriorityFeeLevels | undefined
  feeMode: FeeMode
}) => {
  if (!fees)
    return {
      fee: undefined,
      modeFees: undefined
    }
  const key: keyof MicroLamportPriorityFeeLevels = (() => {
    switch (feeMode) {
      case FeeMode.SLOW:
        return 'medium'
      case FeeMode.FAST:
        return 'veryHigh'
      case FeeMode.AVERAGE:
        return 'high'
      default:
        return 'high'
    }
  })()

  const modeFees: { [key in FeeMode]: number } = {
    [FeeMode.FAST]: fees['veryHigh'],
    [FeeMode.SLOW]: fees['medium'],
    [FeeMode.AVERAGE]: fees['high']
  }

  return {
    fee: fees[key],
    modeFees: modeFees
  }
}

// transaction.serialize() or transaction.serialize({ requireAllSignatures: false, verifySignatures: false })
export const getSolFeeEstimate = async (transaction: Uint8Array | number[]) => {
  const helius = new Helius('ac6f0298-d53b-4a04-8389-7966584a67d1')
  const result = await helius.rpc.getPriorityFeeEstimate({
    transaction: bs58.encode(transaction),
    options: {
      includeAllPriorityFeeLevels: true
      // priorityLevel: PriorityLevel.HIGH
    }
  })

  // return result.priorityFeeEstimate
  return result.priorityFeeLevels ? result.priorityFeeLevels : undefined
}

/**
 * Reference link: https://docs.helius.dev/guides/priority-fee-api#what-are-priority-fees-on-solana
 * @param accountKeys string[]
 * @returns string
 */
export const getSolFeeEstimate2 = async (accountKeys: string[]) => {
  const helius = new Helius('ac6f0298-d53b-4a04-8389-7966584a67d1')
  const result = await helius.rpc.getPriorityFeeEstimate({
    accountKeys,
    options: {
      includeAllPriorityFeeLevels: true
    }
  })

  console.log('solFeeEstimate2 ==>', result)

  return result.priorityFeeLevels?.high || 100000
}
