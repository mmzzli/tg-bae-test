import { IChainId, IWeb3ChainType, Web3Type } from "../chainType"

export const swapTokenDefaults: {
  [key in IChainId]?: string
} = {
  1: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  501: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  56: '0x55d398326f99059ff775485246999027b3197955',
  42161: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  81457: '0x4300000000000000000000000000000000000003',
  43114: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
  137: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
  534352: '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
  10: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  1100: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
  59144: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  19484: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', // tron
  // 784: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7' // sui
  784: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC', // sui
}

export const transactionSuccess = 'Transaction Submitted!'

export const transactionBackSuccess =
  'Sign & Send successful! Redirecting to the previous page in 2 seconds.'

export const errorContents = {
  approveSuccess: 'Approve Successful!',
  approveFailed: 'Approve Failed!',
  gasError:
    'Failed to estimate gas. Please ensure you have enough funds in your wallet.',
  transactionError:
    'Transaction failed. Please check the details and try again.',
  beenExceededError: 'Transaction already submitted.',
  networkError:
    'Transaction failed. Please check your network and try again later.',
  blockhashFailed:
    'Transaction failed due to an on-chain error. Please try again later.',
  argumentError:
    'Transaction failed due to abnormal signature data. Please verify the amount and try again.',
  rpcError: 'Transaction failed. Please try again later.',
  networkLongError:
    'Transaction failed. Please check your network and try again later.',
  balanceError: 'Insufficient balance.',
  noEnoughGas: 'Insufficient balance to pay for the network fee.',
  userErrors: {
    loginFailed:
      'Login failed. Please check your Telegram account or restart Tomo Wallet.',
    tokenNotExist: 'Token is invalid or does not exist.',
    payPinFailed: 'Pay PIN verification failed.',
    wordsCheckFailed: 'Mnemonic validation failed.',
    referralCodeFailed: 'Please enter the correct referral code.',
    claimFailed: 'Claim failed, please try again.',
    refundFailed: 'Refund failed, please try again.',
    createFailed: 'Create failed, please try again.',
    gasError:
      'Failed to estimate gas. Please ensure you have enough funds in your wallet.',
    signedMessageError: 'Failed to sign transaction.',
    payPinCanceled: 'Pay PIN verification canceled.'
  },

  tonConnect: {
    sendFaild: 'Tonconnect_error: failed to send transaction.',
    wrongFrom: 'Tonconnect_error: failed to send assets.',
    wrongNetwork: 'Tonconnect_error: network issue.',
    wrongRequest: 'Tonconnect_error: invalid request.'
  },
  transactionErrors: {
    approveError: 'Approve failed.',
    insufficientFunds: 'Tonconnect_error: insufficient funds.',
    signError: 'Failed to sign transaction.'
  },
  paypinErrors: {
    wrong1: 'Incorrect payment PIN',
    wrong2: 'Incorrect payment PIN',
    wrong3: 'Incorrect payment PIN, 2 attempts remaining.',
    wrong4: 'Incorrect payment PIN, 1 attempt remaining.',
    wrong5: 'Too many attempts. Please try again after the next day (UTC+0).',
    NotMatch: 'The two passwords you entered do not match.'
  },
  loginErrors: {
    wrongInitdata: 'Please open the telegram and try again',
    frozen: 'Frozen. Please try again after the next day (UTC+0).',
    userInfo: 'get user info error'
  },
  biometryErrors: {
    authenticateFailed: 'Authenticate Failed'
  },
  splitPageErrors:
    'Price changed too much. Adjust slippage or try again later.',
  serverError: 'An error occurred. Please try again later.',
  starSwapError: {
    vaultBalance: 'Insufficient vault balance.',
    priceChange: 'Price change too much, please try again',
    blockUser:
      'Sorry, your account is restricted from using Star to Gas. If you believe this is an error, please contact community support for assistance.',
    overLimit:
      'You are exceeding the daily limit of 2000 Star. Please input a lower amount to proceed.'
  }
}

export const beenExceededError = 'been exceeded'

export const SWAP_REFERRER_FEE = 0.6
export const SWAP_REFERRER_INVITE_FEE = 0.55

export const getTomoRefferAddress = (
  chain: IWeb3ChainType | undefined
) => {
  if (!chain) {
    return undefined
  }
  switch (chain.type) {
    case Web3Type.EVM:
      return '0xabdce9b45e813efcd7590c7091f4500adb52bd40'
    case Web3Type.SOL:
      return 'E8J87CV7RtBGwytnvnJUmXNETzQCL8oEMRam9kZzGZVW'
    case Web3Type.TON:
      return 'UQCDGlKIe86hXkCpEOTVJQULcC2ATvAiv2tJOIZUoa_cjzSy'
    case Web3Type.TRON:
      return 'TGKtZQjZMLyzUQ4foC6k47nkEYGRXiEZFw'
    case Web3Type.SUI:
      return '0x6343029f233aac68c58ee8d942a08860753794b16b01d495a389db70a4c0e06f'
    default:
      return undefined
  }
}

export const DuckChainDsAddress = '0x6b828c2a0f369f394ab1aba52bed76bb4b1bac56'
