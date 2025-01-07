export const abi = [
  {
    inputs: [
      // 打赏的话为0
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
      // 打赏的token地址 如果是原生gas 则地址为当前合约地址
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_uid',
        type: 'uint256',
      },
    ],
    name: 'reward',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_uid',
        type: 'uint256',
      },
    ],
    name: 'getRewardByUid',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        internalType: 'struct LiveReward.tokenAmount[]',
        name: 'data_',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_uid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'token',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        internalType: 'struct LiveReward.tokenAmount[]',
        name: '_data',
        type: 'tuple[]',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
      {
        internalType: 'bytes[]',
        name: '_signs',
        type: 'bytes[]',
      },
    ],
    name: 'withdrawMultiToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_uid',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_deadline',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_sign',
        type: 'bytes',
      },
    ],
    name: 'withdrawToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const
