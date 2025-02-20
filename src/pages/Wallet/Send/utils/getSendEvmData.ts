import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { encodeFunctionData, erc20Abi, parseUnits } from 'viem'

const getSendEvmData = (
  token: AssetsToken | undefined,
  toAddress: string,
  amount: string
): string => {
  if (token?.isNative) return '0x'
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: 'transfer',
    args: [toAddress as `0x${string}`, parseUnits(amount, token?.decimals ?? 18)],
  })
}

export default getSendEvmData
