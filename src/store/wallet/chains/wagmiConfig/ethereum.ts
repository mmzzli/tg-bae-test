import chainsSvgs from '@/assets'
import { IWeb3ChainType, IWeb3NetworkType } from '../../chainType'
import { mainnet } from '@wagmi/core/chains'

const icon = chainsSvgs.ethSvg
const networkType: IWeb3NetworkType = 'main'

const chainInfo: IWeb3ChainType = {
  chain: {
    ...mainnet,
    rpcUrls: {
      default: {
        http: [
          // @ts-ignore
          'https://mainnet.infura.io/v3/fa3c7de738414a0bba9d4504d40534cd',
          'https://eth-mainnet.g.alchemy.com/v2/RtiObPHFZnEsl72kfnQ5Q1bk0Aj8WFwD',
          'https://eth-mainnet.g.alchemy.com/v2/DR7Jtd4NSYTtAY7Heme8ml-j6oBCZgGO',
          'https://mainnet.infura.io/v3/e42637ee1f664cad93e70bbf62196769',
          // 'https://rpc.ankr.com/eth/0db0a5029f9542d34fa7ae9096b21462fafa1b76bf87c2863cf0a84b36747331'
        ],
      },
    },
  },
  id: 1,
  type: 'EVM',
  name: mainnet.name,
  icon: icon,
  networkType,
}

export default chainInfo
