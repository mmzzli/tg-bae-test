import chainsSvgs from '@/assets'
import { IWeb3ChainType, IWeb3NetworkType } from '../../chainType'
import { bsc } from '@wagmi/core/chains'

const icon = chainsSvgs.bscSvg
const networkType: IWeb3NetworkType = 'main'

const chainInfo: IWeb3ChainType = {
  chain: {
    ...bsc,
    rpcUrls: {
      default: {
        http: [
          'https://bnb-mainnet.g.alchemy.com/v2/G4hUqxgmvzDORrO27SZTgPTZdz9vaMT6',
          'https://bnb-mainnet.g.alchemy.com/v2/DR7Jtd4NSYTtAY7Heme8ml-j6oBCZgGO',
          'https://rpc.ankr.com/bsc/ac79e83cf02a544dbb9b3f4c5d5478b2510b921e7d5739ded8791a932e8de0a6',
          'https://rpc.ankr.com/bsc/5fc8ed1906d70db2174601d49aa1edc708e5ff35f1c862c95d43734a6943730e',
          'https://bsc-dataseed1.defibit.io/',
        ],
      },
    },
  },
  id: 56,
  type: 'EVM',
  name: 'BNB smart chain',
  icon: icon,
  networkType,
}

export default chainInfo
