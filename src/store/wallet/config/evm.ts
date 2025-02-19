import { createPublicClient, Hex, http, PublicClient, serializeTransaction } from 'viem'
import { IChainType, IWeb3ChainType } from '../chainType'
import { sleep } from '../util'
import { signEvmTransaction } from '@/api/wallet'

export const attemptsSendTransaction = async ({
  maxAttempts = 5,
  chain,
  serializedTransaction,
}: {
  maxAttempts?: number
  serializedTransaction: Hex
  chain: IChainType | undefined
}) => {
  let attempt = 0

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  })

  while (attempt < maxAttempts + 1) {
    try {
      const hash = await publicClient.sendRawTransaction({
        serializedTransaction: serializedTransaction,
      })

      return hash
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed. Retrying in 1 second...`, error)
      await sleep(1000)
      if (attempt === maxAttempts - 1) {
        throw error
      }
      attempt++
    }
  }
}

export const sendTransaction = async ({
  chain,
  serializedTransaction,
}: {
  chain: IWeb3ChainType
  serializedTransaction: Hex
}) => {
  const chainId = chain.id
  const evmChain = chain.chain

  if (typeof chainId === 'number') {
    const hash = await attemptsSendTransaction({
      chain: evmChain,
      serializedTransaction,
    })

    return hash
  }
}

export const sendRawTransactionApi = async ({
  mfa,
  mfaParams,
  chain,
}: {
  mfa: any
  mfaParams: {
    gas: string | undefined
    maxFeePerGas: string | undefined
    maxPriorityFeePerGas: string | undefined
    gasPrice: string | undefined
    value: string | undefined
    from: string | undefined
    to: string | undefined
    nonce: number | undefined
    data: string | undefined
  }
  chain: IWeb3ChainType
}) => {
  const chainId = chain.id

  if (chainId) {
    const signRes = await signEvmTransaction(mfa, {
      transaction: mfaParams,
      chainId,
    })

    // const readyHash = serializeTransaction(signRes.result)

    const rawHash = await sendTransaction({
      chain: chain,
      serializedTransaction: signRes.result,
    })

    const hash = rawHash

    return hash
  }
}
